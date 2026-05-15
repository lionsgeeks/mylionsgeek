<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class UserActivityController extends Controller
{
    private function filterAllows(?string $filter, string $activityType): bool
    {
        $f = strtolower(trim((string) $filter) ?: 'all');
        if ($f === 'all') {
            return true;
        }

        return match ($f) {
            'likes' => in_array($activityType, ['post_like', 'comment_like'], true),
            'comments' => $activityType === 'comment',
            'saves' => $activityType === 'save',
            'posts' => $activityType === 'post',
            'reposts' => $activityType === 'repost',
            'bookings' => in_array($activityType, ['reservation', 'cowork'], true),
            'follows' => $activityType === 'follow',
            default => true,
        };
    }

    private function postThumbUrl(?array $images): ?string
    {
        if (! is_array($images) || count($images) < 1) {
            return null;
        }
        $image = $images[0] ?? null;
        if (! $image) {
            return null;
        }
        if (str_starts_with((string) $image, 'http')) {
            return (string) $image;
        }
        $imagePath = ltrim((string) $image, '/');
        if (str_contains($imagePath, 'img/posts/')) {
            return url('storage/'.$imagePath);
        }

        return url('storage/img/posts/'.$imagePath);
    }

    private function snippet(?string $text, int $max = 100): string
    {
        $t = trim(strip_tags((string) ($text ?? '')));

        return Str::limit($t, $max, '…');
    }

    public function index(Request $request): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $filter = $request->query('filter', 'all');
        $offset = max(0, (int) $request->query('offset', 0));
        $limit = min(50, max(5, (int) $request->query('limit', 25)));

        $uid = (int) $user->id;

        $parts = [];

        if ($this->filterAllows($filter, 'post_like') && Schema::hasTable('likes')) {
            $parts[] = DB::table('likes')
                ->where('user_id', $uid)
                ->select([
                    DB::raw("'post_like' as activity_type"),
                    DB::raw('likes.id as source_id'),
                    'likes.post_id as post_id',
                    DB::raw('NULL as comment_id'),
                    DB::raw('NULL as reservation_id'),
                    DB::raw('NULL as cowork_id'),
                    DB::raw('NULL as followed_user_id'),
                    'likes.created_at as occurred_at',
                ]);
        }

        if ($this->filterAllows($filter, 'comment_like') && Schema::hasTable('comment_likes') && Schema::hasTable('comments')) {
            $parts[] = DB::table('comment_likes as cl')
                ->join('comments as c', 'c.id', '=', 'cl.comment_id')
                ->where('cl.user_id', $uid)
                ->select([
                    DB::raw("'comment_like' as activity_type"),
                    DB::raw('cl.id as source_id'),
                    'c.post_id as post_id',
                    'cl.comment_id as comment_id',
                    DB::raw('NULL as reservation_id'),
                    DB::raw('NULL as cowork_id'),
                    DB::raw('NULL as followed_user_id'),
                    'cl.created_at as occurred_at',
                ]);
        }

        if ($this->filterAllows($filter, 'save') && Schema::hasTable('post_saves')) {
            $parts[] = DB::table('post_saves as ps')
                ->where('ps.user_id', $uid)
                ->select([
                    DB::raw("'save' as activity_type"),
                    DB::raw('ps.id as source_id'),
                    'ps.post_id as post_id',
                    DB::raw('NULL as comment_id'),
                    DB::raw('NULL as reservation_id'),
                    DB::raw('NULL as cowork_id'),
                    DB::raw('NULL as followed_user_id'),
                    'ps.created_at as occurred_at',
                ]);
        }

        if ($this->filterAllows($filter, 'comment') && Schema::hasTable('comments')) {
            $parts[] = DB::table('comments')
                ->where('user_id', $uid)
                ->select([
                    DB::raw("'comment' as activity_type"),
                    DB::raw('comments.id as source_id'),
                    'comments.post_id as post_id',
                    DB::raw('comments.id as comment_id'),
                    DB::raw('NULL as reservation_id'),
                    DB::raw('NULL as cowork_id'),
                    DB::raw('NULL as followed_user_id'),
                    'comments.created_at as occurred_at',
                ]);
        }

        if ($this->filterAllows($filter, 'post') && Schema::hasTable('posts')) {
            // Own authored posts: include hidden rows so this stays a truthful personal trail.
            $parts[] = DB::table('posts')
                ->where('user_id', $uid)
                ->select([
                    DB::raw("'post' as activity_type"),
                    DB::raw('posts.id as source_id'),
                    'posts.id as post_id',
                    DB::raw('NULL as comment_id'),
                    DB::raw('NULL as reservation_id'),
                    DB::raw('NULL as cowork_id'),
                    DB::raw('NULL as followed_user_id'),
                    'posts.created_at as occurred_at',
                ]);
        }

        if ($this->filterAllows($filter, 'repost') && Schema::hasTable('reposts_posts')) {
            $parts[] = DB::table('reposts_posts as rp')
                ->where('rp.user_id', $uid)
                ->select([
                    DB::raw("'repost' as activity_type"),
                    DB::raw('rp.id as source_id'),
                    'rp.post_id as post_id',
                    DB::raw('NULL as comment_id'),
                    DB::raw('NULL as reservation_id'),
                    DB::raw('NULL as cowork_id'),
                    DB::raw('NULL as followed_user_id'),
                    'rp.created_at as occurred_at',
                ]);
        }

        if ($this->filterAllows($filter, 'reservation') && Schema::hasTable('reservations')) {
            $q = DB::table('reservations');
            if (Schema::hasColumn('reservations', 'user_id')) {
                $q->where('user_id', $uid);
            } else {
                $q->whereRaw('1 = 0');
            }
            $parts[] = $q->select([
                DB::raw("'reservation' as activity_type"),
                DB::raw('reservations.id as source_id'),
                DB::raw('NULL as post_id'),
                DB::raw('NULL as comment_id'),
                'reservations.id as reservation_id',
                DB::raw('NULL as cowork_id'),
                DB::raw('NULL as followed_user_id'),
                'reservations.created_at as occurred_at',
            ]);
        }

        if ($this->filterAllows($filter, 'cowork') && Schema::hasTable('reservation_coworks')) {
            $parts[] = DB::table('reservation_coworks as rc')
                ->where('rc.user_id', $uid)
                ->select([
                    DB::raw("'cowork' as activity_type"),
                    DB::raw('rc.id as source_id'),
                    DB::raw('NULL as post_id'),
                    DB::raw('NULL as comment_id'),
                    DB::raw('NULL as reservation_id'),
                    'rc.id as cowork_id',
                    DB::raw('NULL as followed_user_id'),
                    'rc.created_at as occurred_at',
                ]);
        }

        if ($this->filterAllows($filter, 'follow') && Schema::hasTable('followers')) {
            $parts[] = DB::table('followers as f')
                ->where('f.follower_id', $uid)
                ->select([
                    DB::raw("'follow' as activity_type"),
                    DB::raw('f.id as source_id'),
                    DB::raw('NULL as post_id'),
                    DB::raw('NULL as comment_id'),
                    DB::raw('NULL as reservation_id'),
                    DB::raw('NULL as cowork_id'),
                    'f.followed_id as followed_user_id',
                    'f.created_at as occurred_at',
                ]);
        }

        if (count($parts) === 0) {
            return response()->json([
                'activities' => [],
                'next_offset' => null,
            ]);
        }

        $union = $parts[0];
        for ($i = 1; $i < count($parts); $i++) {
            $union = $union->unionAll($parts[$i]);
        }

        $rows = DB::query()
            ->fromSub($union, 'user_activity')
            ->orderByDesc('occurred_at')
            ->orderBy('activity_type')
            ->orderByDesc('source_id')
            ->offset($offset)
            ->limit($limit + 1)
            ->get();

        $hasMore = $rows->count() > $limit;
        $page = $hasMore ? $rows->slice(0, $limit) : $rows;

        $postIds = $page->pluck('post_id')->filter()->map(fn ($id) => (int) $id)->unique()->values()->all();
        $followIds = $page->pluck('followed_user_id')->filter()->map(fn ($id) => (int) $id)->unique()->values()->all();
        $resIds = $page->pluck('reservation_id')->filter()->map(fn ($id) => (int) $id)->unique()->values()->all();
        $cowIds = $page->pluck('cowork_id')->filter()->map(fn ($id) => (int) $id)->unique()->values()->all();
        $commentIds = $page->pluck('comment_id')->filter()->map(fn ($id) => (int) $id)->unique()->values()->all();

        $posts = collect();
        if (! empty($postIds)) {
            $posts = Post::query()->whereIn('id', $postIds)->get()->keyBy('id');
        }

        $commentsById = collect();
        if (! empty($commentIds) && Schema::hasTable('comments')) {
            $commentsById = DB::table('comments')->whereIn('id', $commentIds)->get()->keyBy('id');
        }

        $usersById = collect();
        if (! empty($followIds)) {
            $usersById = User::query()->whereIn('id', $followIds)->get()->keyBy('id');
        }

        $reservationsById = collect();
        if (! empty($resIds)) {
            $reservationsById = Reservation::query()->whereIn('id', $resIds)->get()->keyBy('id');
        }

        $coworksById = collect();
        if (! empty($cowIds) && Schema::hasTable('reservation_coworks')) {
            $coworksById = DB::table('reservation_coworks')->whereIn('id', $cowIds)->get()->keyBy('id');
        }

        $activities = $page->map(function ($row) use ($posts, $commentsById, $usersById, $reservationsById, $coworksById) {
            $type = (string) $row->activity_type;
            $at = $row->occurred_at
                ? (is_string($row->occurred_at) ? $row->occurred_at : $row->occurred_at->format('Y-m-d H:i:s'))
                : null;

            $postId = $row->post_id !== null ? (int) $row->post_id : null;
            $commentId = $row->comment_id !== null ? (int) $row->comment_id : null;
            $reservationId = $row->reservation_id !== null ? (int) $row->reservation_id : null;
            $coworkId = $row->cowork_id !== null ? (int) $row->cowork_id : null;
            $followedId = $row->followed_user_id !== null ? (int) $row->followed_user_id : null;

            $postModel = $postId ? $posts->get($postId) : null;
            $postPayload = null;
            if ($postModel) {
                $images = $postModel->images ?? [];
                $postPayload = [
                    'id' => (int) $postModel->id,
                    'snippet' => $this->snippet($postModel->description ?? ''),
                    'thumbnail_url' => $this->postThumbUrl(is_array($images) ? $images : []),
                ];
            } elseif ($postId) {
                $postPayload = [
                    'id' => $postId,
                    'snippet' => '',
                    'thumbnail_url' => null,
                ];
            }

            $commentPayload = null;
            if ($commentId && $commentsById->has($commentId)) {
                $c = $commentsById->get($commentId);
                $commentPayload = [
                    'id' => $commentId,
                    'snippet' => $this->snippet($c->comment ?? '', 80),
                ];
            } elseif ($commentId) {
                $commentPayload = ['id' => $commentId, 'snippet' => ''];
            }

            $followPayload = null;
            if ($followedId) {
                $u = $usersById->get($followedId);
                $avatar = null;
                if ($u && $u->image) {
                    $imagePath = ltrim((string) $u->image, '/');
                    $avatar = str_contains($imagePath, 'img/profile/')
                        ? url('storage/'.$imagePath)
                        : url('storage/img/profile/'.$imagePath);
                }
                $followPayload = [
                    'user_id' => $followedId,
                    'name' => $u?->name ?? 'Member',
                    'avatar_url' => $avatar,
                ];
            }

            $bookingPayload = null;
            if ($type === 'reservation' && $reservationId) {
                $r = $reservationsById->get($reservationId);
                $bookingPayload = [
                    'kind' => 'studio',
                    'id' => $reservationId,
                    'title' => $r?->title ?? 'Studio reservation',
                    'day' => $r?->day,
                    'start' => $r?->start,
                    'end' => $r?->end,
                    'approved' => (bool) ($r?->approved ?? false),
                    'canceled' => (bool) ($r?->canceled ?? false),
                ];
            }
            if ($type === 'cowork' && $coworkId) {
                $c = $coworksById->get($coworkId);
                $spot = $c && isset($c->table) ? (string) $c->table : '';
                $bookingPayload = [
                    'kind' => 'cowork',
                    'id' => $coworkId,
                    'title' => $spot !== '' ? ('Cowork · '.$spot) : 'Coworking reservation',
                    'day' => $c?->day,
                    'start' => $c?->start,
                    'end' => $c?->end,
                    'approved' => $c ? (bool) $c->approved : false,
                    'canceled' => $c ? (bool) $c->canceled : false,
                ];
            }

            return [
                'type' => $type,
                'source_id' => (int) $row->source_id,
                'occurred_at' => $at,
                'post' => $postPayload,
                'comment' => $commentPayload,
                'follow' => $followPayload,
                'booking' => $bookingPayload,
            ];
        })->values()->all();

        return response()->json([
            'activities' => $activities,
            'next_offset' => $hasMore ? $offset + $limit : null,
        ]);
    }
}
