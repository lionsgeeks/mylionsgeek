<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Story;
use App\Models\StoryReaction;
use App\Models\StoryView;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Throwable;

class StoryController extends Controller
{
    private const STORIES_DIR = 'stories';
    private const TTL_HOURS = 24;
    private const MAX_PHOTO_BYTES = 10 * 1024 * 1024;  // 10 MB
    private const MAX_VIDEO_BYTES = 50 * 1024 * 1024;  // 50 MB
    private const MAX_VIDEO_DURATION_MS = 60_000;       // 60s

    /**
     * Lazy cleanup of expired stories. Runs at most once per request to keep
     * the DB tidy without needing a cron. Deletes the rows and the files.
     */
    private function purgeExpired(): void
    {
        try {
            // Stories that are referenced by a highlight are kept forever, even
            // after their 24h expiry, so the owner can keep them on their
            // profile. We exclude those from the lazy purge.
            $expired = Story::where('stories.expires_at', '<=', now())
                ->whereNotExists(function ($q) {
                    $q->select(DB::raw(1))
                        ->from('story_highlight_items')
                        ->whereColumn('story_highlight_items.story_id', 'stories.id');
                })
                ->limit(50)
                ->get();
            foreach ($expired as $story) {
                try {
                    if ($story->media_path) {
                        Storage::disk('public')->delete($story->media_path);
                    }
                } catch (Throwable $e) {
                    Log::warning('Story file delete failed', ['id' => $story->id, 'err' => $e->getMessage()]);
                }
                $story->delete();
            }
        } catch (Throwable $e) {
            Log::warning('Story lazy purge failed: ' . $e->getMessage());
        }
    }

    private function publicUrl(string $path): string
    {
        return url('storage/' . ltrim($path, '/'));
    }

    private function avatarUrl(?User $u): ?string
    {
        if (!$u || !$u->image) return null;
        $path = ltrim((string) $u->image, '/');
        return str_contains($path, 'img/profile/')
            ? url('storage/' . $path)
            : url('storage/img/profile/' . $path);
    }

    private function mapStory(Story $s, int $authUserId): array
    {
        return [
            'id'              => (int) $s->id,
            'media_url'       => $this->publicUrl($s->media_path),
            'media_type'      => $s->media_type,
            'audience'        => $s->audience ?: 'public',
            'overlays'        => is_array($s->overlays) ? $s->overlays : [],
            'duration_ms'     => (int) ($s->duration_ms ?? 5000),
            'width'           => $s->width,
            'height'          => $s->height,
            'created_at'      => optional($s->created_at)->toIso8601String(),
            'expires_at'      => optional($s->expires_at)->toIso8601String(),
            'is_mine'         => (int) $s->user_id === $authUserId,
            'views_count'     => (int) ($s->views_count ?? 0),
            'has_viewed'      => (bool) ($s->viewer_has_seen ?? false),
            'reactions_count' => (int) ($s->reactions_count ?? 0),
            'my_reaction'     => $s->viewer_reaction ?: null,
        ];
    }

    /**
     * GET /api/mobile/stories
     *
     * Returns active stories grouped by user. The authed user's own group
     * is always first (so the "Your story" entry has data). Each entry:
     *   { user: {id, name, avatar}, stories: [...], has_unseen: bool, latest_at: ts }
     */
    public function index(Request $request)
    {
        $this->purgeExpired();

        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        try {
            // Fetch all active stories with their owner and a view-count subquery
            // and a flag for whether the current user has viewed each story.
            $stories = Story::query()
                ->with(['user:id,name,image'])
                ->withCount('views as views_count')
                ->withCount('reactions as reactions_count')
                ->selectSub(function ($q) use ($user) {
                    $q->selectRaw('COUNT(*)')
                        ->from('story_views')
                        ->whereColumn('story_views.story_id', 'stories.id')
                        ->where('story_views.user_id', $user->id);
                }, 'viewer_has_seen')
                ->selectSub(function ($q) use ($user) {
                    $q->select('emoji')
                        ->from('story_reactions')
                        ->whereColumn('story_reactions.story_id', 'stories.id')
                        ->where('story_reactions.user_id', $user->id)
                        ->limit(1);
                }, 'viewer_reaction')
                ->where('expires_at', '>', now())
                ->where(function ($q) use ($user) {
                    // Audience filter: public to everyone; close_friends only
                    // to people on the owner's close-friends list; you can
                    // always see your own.
                    $q->where('stories.user_id', $user->id)
                      ->orWhere('stories.audience', 'public')
                      ->orWhere(function ($qq) use ($user) {
                          $qq->where('stories.audience', 'close_friends')
                             ->whereExists(function ($e) use ($user) {
                                 $e->select(DB::raw(1))
                                   ->from('close_friends')
                                   ->whereColumn('close_friends.user_id', 'stories.user_id')
                                   ->where('close_friends.friend_id', $user->id);
                             });
                      });
                })
                ->orderBy('user_id')
                ->orderBy('created_at')
                ->get();

            // Group by user.
            $groups = $stories->groupBy('user_id')->map(function ($group) use ($user) {
                $owner = $group->first()->user;
                $latest = $group->max('created_at');
                $hasUnseen = $group->contains(function ($s) {
                    return !$s->viewer_has_seen;
                });

                return [
                    'user' => [
                        'id'     => (int) $owner->id,
                        'name'   => $owner->name,
                        'avatar' => $this->avatarUrl($owner),
                    ],
                    'has_unseen' => $hasUnseen,
                    'latest_at'  => $latest ? Carbon::parse($latest)->toIso8601String() : null,
                    'stories'    => $group->map(fn ($s) => $this->mapStory($s, $user->id))->values(),
                ];
            })->values();

            // Sort: own group first, then unseen first, then newest first.
            $sorted = $groups->sortBy([
                fn ($a, $b) => ((int) $b['user']['id'] === (int) $user->id ? 1 : 0)
                            <=> ((int) $a['user']['id'] === (int) $user->id ? 1 : 0),
                fn ($a, $b) => ($b['has_unseen'] ? 1 : 0) <=> ($a['has_unseen'] ? 1 : 0),
                fn ($a, $b) => strcmp($b['latest_at'] ?? '', $a['latest_at'] ?? ''),
            ])->values();

            return response()->json(['groups' => $sorted]);
        } catch (Throwable $e) {
            Log::error('Stories index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to load stories',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * POST /api/mobile/stories
     *
     * multipart/form-data:
     *   media (file, required)         – image (jpg/png/webp/heic) or video (mp4/mov/webm)
     *   media_type (string, required)  – "image" or "video"
     *   duration_ms (int, optional)    – defaults: image=5000, video=actual length / 15s fallback
     *   width, height (optional)
     */
    public function store(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'media'       => ['required', 'file'],
            'media_type'  => ['required', 'in:image,video'],
            'duration_ms' => ['nullable', 'integer', 'min:1000', 'max:' . self::MAX_VIDEO_DURATION_MS],
            'width'       => ['nullable', 'integer', 'min:1', 'max:10000'],
            'height'      => ['nullable', 'integer', 'min:1', 'max:10000'],
            'audience'    => ['nullable', 'in:public,close_friends'],
            // overlays are sent as a JSON-encoded string from the mobile
            // client (because the request is multipart). We validate the
            // decoded shape further below. Allow up to 400KB so a music
            // overlay with embedded lyrics still fits comfortably.
            'overlays'    => ['nullable', 'string', 'max:400000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid story upload',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $file = $request->file('media');
        $type = $request->input('media_type');

        // Size guard.
        $maxBytes = $type === 'video' ? self::MAX_VIDEO_BYTES : self::MAX_PHOTO_BYTES;
        if ($file->getSize() > $maxBytes) {
            return response()->json([
                'message' => 'File is too large. Max ' . ($maxBytes / 1024 / 1024) . ' MB.',
            ], 413);
        }

        // Mime guard.
        $mime = strtolower((string) $file->getMimeType());
        $okImage = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
        $okVideo = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];
        $allowed = $type === 'video' ? $okVideo : $okImage;
        if (!in_array($mime, $allowed, true)) {
            return response()->json([
                'message' => 'Unsupported media type: ' . $mime,
            ], 415);
        }

        try {
            $ext = $file->getClientOriginalExtension() ?: ($type === 'video' ? 'mp4' : 'jpg');
            $filename = 'story_' . $user->id . '_' . time() . '_' . substr(bin2hex(random_bytes(4)), 0, 8) . '.' . $ext;
            $path = $file->storeAs(self::STORIES_DIR, $filename, 'public');

            // Decode & sanitize creative overlays. Anything that doesn't match
            // a known overlay shape is silently dropped so we never blow up
            // on malformed client data.
            $overlays = null;
            $overlaysRaw = $request->input('overlays');
            if (is_string($overlaysRaw) && $overlaysRaw !== '') {
                $decoded = json_decode($overlaysRaw, true);
                if (is_array($decoded)) {
                    $overlays = array_values(array_filter(array_map(function ($o) {
                        if (!is_array($o) || empty($o['type'])) return null;
                        $base = [
                            'id'       => (string) ($o['id'] ?? bin2hex(random_bytes(6))),
                            'type'     => (string) $o['type'],
                            'x'        => (float) ($o['x'] ?? 0.5),
                            'y'        => (float) ($o['y'] ?? 0.5),
                            'scale'    => (float) ($o['scale'] ?? 1.0),
                            'rotation' => (float) ($o['rotation'] ?? 0.0),
                        ];
                        if ($base['type'] === 'text') {
                            $base['text']      = mb_substr((string) ($o['text'] ?? ''), 0, 300);
                            $base['color']     = is_string($o['color'] ?? null) ? substr($o['color'], 0, 16) : '#ffffff';
                            $base['font']      = is_string($o['font'] ?? null) ? substr($o['font'], 0, 32) : 'default';
                            $base['has_bg']    = !empty($o['has_bg']);
                            $base['bg_color']  = is_string($o['bg_color'] ?? null) ? substr($o['bg_color'], 0, 16) : null;
                            if ($base['text'] === '') return null;
                            return $base;
                        }
                        if ($base['type'] === 'sticker') {
                            $base['emoji'] = mb_substr((string) ($o['emoji'] ?? ''), 0, 8);
                            if ($base['emoji'] === '') return null;
                            return $base;
                        }
                        if ($base['type'] === 'mention') {
                            $base['user_id']  = (int) ($o['user_id'] ?? 0);
                            $base['username'] = mb_substr((string) ($o['username'] ?? ''), 0, 80);
                            $base['color']    = is_string($o['color'] ?? null) ? substr($o['color'], 0, 16) : '#ffffff';
                            $base['has_bg']   = !empty($o['has_bg']);
                            $base['bg_color'] = is_string($o['bg_color'] ?? null) ? substr($o['bg_color'], 0, 16) : null;
                            if ($base['user_id'] <= 0 || $base['username'] === '') return null;
                            return $base;
                        }
                        if ($base['type'] === 'drawing') {
                            $rawPoints = $o['points'] ?? [];
                            if (!is_array($rawPoints)) return null;
                            // Cap to keep payloads sane: max 200 points per stroke.
                            $points = [];
                            foreach ($rawPoints as $p) {
                                if (!is_array($p) || count($p) < 2) continue;
                                $px = (float) $p[0];
                                $py = (float) $p[1];
                                if ($px < 0) $px = 0; if ($px > 1) $px = 1;
                                if ($py < 0) $py = 0; if ($py > 1) $py = 1;
                                $points[] = [$px, $py];
                                if (count($points) >= 200) break;
                            }
                            if (count($points) < 2) return null;
                            $base['points']       = $points;
                            $base['color']        = is_string($o['color'] ?? null) ? substr($o['color'], 0, 16) : '#ffffff';
                            $base['stroke_width'] = max(1.0, min(40.0, (float) ($o['stroke_width'] ?? 6.0)));
                            // Drawings don't use x/y/scale/rotation, but keep the
                            // base fields for shape consistency.
                            return $base;
                        }
                        if ($base['type'] === 'music') {
                            // Music sticker fields. preview_url is the only one
                            // strictly required to actually play audio in the
                            // viewer; everything else is for display.
                            $previewUrl = is_string($o['preview_url'] ?? null) ? trim($o['preview_url']) : '';
                            $coverUrl   = is_string($o['cover_url']   ?? null) ? trim($o['cover_url'])   : '';
                            if ($previewUrl === '' || !preg_match('#^https?://#i', $previewUrl)) return null;
                            if ($coverUrl !== '' && !preg_match('#^https?://#i', $coverUrl)) {
                                $coverUrl = '';
                            }
                            $title  = trim((string) ($o['title']  ?? ''));
                            $artist = trim((string) ($o['artist'] ?? ''));
                            $album  = trim((string) ($o['album']  ?? ''));
                            if ($title === '' && $artist === '') return null;
                            // Clip range: clamp to [0..30000] window since both
                            // Spotify and iTunes serve 30-second previews.
                            $startMs = max(0, (int) ($o['start_ms'] ?? 0));
                            $endMs   = (int) ($o['end_ms']   ?? 15000);
                            if ($endMs <= $startMs) $endMs = $startMs + 15000;
                            if ($endMs > 30000)    $endMs = 30000;
                            if ($startMs > 29000)  $startMs = 29000;
                            $style = (string) ($o['display'] ?? 'pill');
                            if (!in_array($style, ['pill', 'card', 'minimal', 'lyrics', 'none'], true)) {
                                $style = 'pill';
                            }
                            // Lyrics, if provided, are clipped to 6KB so the
                            // overlays JSON column never balloons.
                            $lyrics = null;
                            if ($style === 'lyrics' && is_string($o['lyrics'] ?? null)) {
                                $lyrics = mb_substr(trim($o['lyrics']), 0, 6000);
                                if ($lyrics === '') $lyrics = null;
                            }
                            $source = (string) ($o['source'] ?? 'spotify+itunes');
                            if (!in_array($source, ['spotify', 'itunes', 'spotify+itunes'], true)) {
                                $source = 'spotify+itunes';
                            }
                            $base['track_id']    = mb_substr((string) ($o['track_id'] ?? ''), 0, 64);
                            $base['title']       = mb_substr($title,  0, 200);
                            $base['artist']      = mb_substr($artist, 0, 200);
                            $base['album']       = mb_substr($album,  0, 200);
                            $base['cover_url']   = mb_substr($coverUrl,    0, 500);
                            $base['preview_url'] = mb_substr($previewUrl,  0, 500);
                            $base['start_ms']    = $startMs;
                            $base['end_ms']      = $endMs;
                            $base['display']     = $style;
                            $base['source']      = $source;
                            if ($lyrics !== null) {
                                $base['lyrics'] = $lyrics;
                            }
                            return $base;
                        }
                        return null;
                    }, $decoded)));
                    // Hard cap: max 20 overlays per story to keep payload sane.
                    if (count($overlays) > 20) $overlays = array_slice($overlays, 0, 20);
                    if (empty($overlays)) $overlays = null;
                }
            }

            $story = Story::create([
                'user_id'     => $user->id,
                'media_path'  => $path,
                'media_type'  => $type,
                'audience'    => $request->input('audience', 'public'),
                'overlays'    => $overlays,
                'duration_ms' => $type === 'video'
                    ? max(1000, min(self::MAX_VIDEO_DURATION_MS, (int) $request->input('duration_ms', 15000)))
                    : 5000,
                'width'       => $request->input('width'),
                'height'      => $request->input('height'),
                'expires_at'  => now()->addHours(self::TTL_HOURS),
            ]);

            $story->loadCount(['views as views_count', 'reactions as reactions_count']);
            $story->viewer_has_seen = 0;
            $story->viewer_reaction = null;

            return response()->json([
                'story' => $this->mapStory($story, $user->id),
            ], 201);
        } catch (Throwable $e) {
            Log::error('Story store failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Could not upload story.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * POST /api/mobile/stories/{id}/view
     * Records that the authenticated user has viewed this story. Idempotent.
     */
    public function view(int $id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $story = Story::active()->find($id);
        if (!$story) {
            return response()->json(['message' => 'Story not found or expired'], 404);
        }

        // Don't record self-views.
        if ((int) $story->user_id === (int) $user->id) {
            return response()->json(['ok' => true, 'self' => true]);
        }

        try {
            DB::table('story_views')->updateOrInsert(
                ['story_id' => $story->id, 'user_id' => $user->id],
                ['viewed_at' => now()]
            );
        } catch (Throwable $e) {
            Log::warning('Story view record failed: ' . $e->getMessage());
        }

        return response()->json(['ok' => true]);
    }

    /**
     * DELETE /api/mobile/stories/{id}
     */
    public function destroy(int $id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $story = Story::find($id);
        if (!$story) {
            return response()->json(['message' => 'Story not found'], 404);
        }
        if ((int) $story->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Not allowed'], 403);
        }

        try {
            if ($story->media_path) {
                Storage::disk('public')->delete($story->media_path);
            }
            $story->delete();
        } catch (Throwable $e) {
            Log::error('Story destroy failed: ' . $e->getMessage());
            return response()->json(['message' => 'Could not delete story'], 500);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * GET /api/mobile/stories/{id}/viewers
     *
     * Returns the list of users who viewed this story, plus their reaction
     * (if any). Only the story owner can see this.
     */
    public function viewers(int $id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $story = Story::find($id);
        if (!$story) {
            return response()->json(['message' => 'Story not found'], 404);
        }
        if ((int) $story->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Not allowed'], 403);
        }

        $rows = DB::table('story_views as sv')
            ->join('users as u', 'u.id', '=', 'sv.user_id')
            ->leftJoin('story_reactions as sr', function ($j) use ($story) {
                $j->on('sr.user_id', '=', 'sv.user_id')->where('sr.story_id', $story->id);
            })
            ->where('sv.story_id', $story->id)
            ->orderByDesc('sv.viewed_at')
            ->limit(500)
            ->get(['u.id', 'u.name', 'u.image', 'sv.viewed_at', 'sr.emoji']);

        $viewers = $rows->map(function ($r) {
            $avatar = null;
            if ($r->image) {
                $path = ltrim((string) $r->image, '/');
                $avatar = str_contains($path, 'img/profile/')
                    ? url('storage/' . $path)
                    : url('storage/img/profile/' . $path);
            }
            return [
                'id'        => (int) $r->id,
                'name'      => $r->name,
                'avatar'    => $avatar,
                'viewed_at' => $r->viewed_at,
                'reaction'  => $r->emoji,
            ];
        });

        return response()->json([
            'viewers'         => $viewers,
            'total'           => $viewers->count(),
            'reactions_count' => $story->reactions()->count(),
        ]);
    }

    /**
     * POST /api/mobile/stories/{id}/react
     * Body: { emoji: string }
     *
     * Adds or updates the auth user's reaction for the story. One reaction
     * per (user, story); re-reacting with a different emoji updates it.
     */
    public function react(int $id, Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'emoji' => ['required', 'string', 'max:16'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid emoji', 'errors' => $validator->errors()], 422);
        }

        $story = Story::active()->find($id);
        if (!$story) {
            return response()->json(['message' => 'Story not found or expired'], 404);
        }

        // Don't allow reacting to your own story (matches Instagram behaviour).
        if ((int) $story->user_id === (int) $user->id) {
            return response()->json(['message' => 'You cannot react to your own story'], 422);
        }

        $emoji = trim((string) $request->input('emoji'));

        try {
            StoryReaction::updateOrCreate(
                ['story_id' => $story->id, 'user_id' => $user->id],
                ['emoji' => $emoji]
            );
        } catch (Throwable $e) {
            Log::error('Story react failed: ' . $e->getMessage());
            return response()->json(['message' => 'Could not save reaction'], 500);
        }

        return response()->json([
            'ok'          => true,
            'my_reaction' => $emoji,
            'reactions_count' => $story->reactions()->count(),
        ]);
    }

    /**
     * DELETE /api/mobile/stories/{id}/react
     * Removes the auth user's reaction for the story (idempotent).
     */
    public function unreact(int $id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $story = Story::find($id);
        if (!$story) {
            return response()->json(['message' => 'Story not found'], 404);
        }

        StoryReaction::where('story_id', $story->id)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json([
            'ok' => true,
            'my_reaction' => null,
            'reactions_count' => $story->reactions()->count(),
        ]);
    }

    /**
     * POST /api/mobile/stories/{id}/reply
     * Body: { message: string }
     *
     * Sends a text reply to a story. The reply is delivered as a chat message
     * in the conversation between the auth user and the story's owner (via
     * the existing chat system, so it shows up in the user's inbox).
     */
    public function reply(int $id, Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'message' => ['required', 'string', 'min:1', 'max:1000'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid reply', 'errors' => $validator->errors()], 422);
        }

        $story = Story::active()->find($id);
        if (!$story) {
            return response()->json(['message' => 'Story not found or expired'], 404);
        }
        if ((int) $story->user_id === (int) $user->id) {
            return response()->json(['message' => 'You cannot reply to your own story'], 422);
        }

        $rawMessage = trim((string) $request->input('message'));

        // Embed the story context in the message body so the receiving client
        // can render it differently if it wants (or just show as plain text
        // for now).
        $body = json_encode([
            'type'         => 'story_reply',
            'story_id'     => (int) $story->id,
            'story_preview'=> $this->publicUrl($story->media_path),
            'media_type'   => $story->media_type,
            'text'         => $rawMessage,
        ], JSON_UNESCAPED_UNICODE);

        try {
            // Open or create the conversation between the two users directly,
            // bypassing the follow-only restriction in ChatController. A user
            // who could view the story is allowed to reply to it.
            $a = min($user->id, $story->user_id);
            $b = max($user->id, $story->user_id);

            $conversation = Conversation::firstOrCreate(
                ['user_one_id' => $a, 'user_two_id' => $b]
            );

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id'       => $user->id,
                'body'            => $body,
                'attachment_path' => null,
                'attachment_type' => null,
                'attachment_name' => null,
                'is_read'         => false,
            ]);

            // Best-effort: poke the real-time chat channel so the recipient's
            // open chat thread updates immediately if they're online. We try
            // Ably first (matches ChatController's transport); if the SDK or
            // key isn't configured, we silently skip — the message will still
            // appear next time the user opens the chat thread.
            try {
                $ablyKey = config('services.ably.key');
                if ($ablyKey && class_exists(\Ably\AblyRest::class)) {
                    $ably = new \Ably\AblyRest($ablyKey);
                    $channel = $ably->channels->get('chat:conversation:' . $conversation->id);
                    $channel->publish('message.new', [
                        'id'              => $message->id,
                        'conversation_id' => $conversation->id,
                        'sender_id'       => $user->id,
                        'body'            => $body,
                        'created_at'      => $message->created_at?->toIso8601String(),
                    ]);
                }
            } catch (Throwable $e) {
                Log::warning('Story reply Ably publish failed: ' . $e->getMessage());
            }

            return response()->json([
                'ok'              => true,
                'conversation_id' => $conversation->id,
                'message_id'      => $message->id,
            ]);
        } catch (Throwable $e) {
            Log::error('Story reply failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Could not send reply.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
