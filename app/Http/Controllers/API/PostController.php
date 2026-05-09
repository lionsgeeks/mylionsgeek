<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\Like;
use App\Models\Project;
use App\Models\Reservation;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class PostController extends Controller
{
    private const POST_IMAGES_DIR = 'img/posts';

    private function mapPostForMobileFeed(Post $post, $authUser, array $savedInteractionPostIds = []): array
    {
        $postUser = $post->user ?? null;
        $interactionPost = $this->resolveInteractionPost($post);
        $interactionPost->loadMissing(['user', 'likes', 'comments']);

        $images = $post->images ?? [];
        $imageUrls = [];

        if (is_array($images) && count($images) > 0) {
            foreach ($images as $image) {
                if (!$image) {
                    continue;
                }
                if (strpos($image, 'http') === 0) {
                    $imageUrls[] = $image;
                    continue;
                }
                $imagePath = ltrim((string) $image, '/');
                if (strpos($imagePath, 'img/posts/') !== false) {
                    $imageUrls[] = url('storage/' . $imagePath);
                } else {
                    $imageUrls[] = url('storage/img/posts/' . $imagePath);
                }
            }
        }

        $createdAt = null;
        if ($post->created_at) {
            $createdAt = is_string($post->created_at)
                ? $post->created_at
                : $post->created_at->toDateTimeString();
        }

        $interactionId = (int) $interactionPost->id;

        return [
            'id' => $post->id ?? null,
            'type' => 'post',
            'content' => $post->description ?? '',
            'description' => $post->description ?? '',
            'images' => $imageUrls,
            'image' => count($imageUrls) > 0 ? $imageUrls[0] : null,
            'hashtags' => $post->hashTags ?? [],
            'created_at' => $createdAt,
            'interaction_post_id' => $interactionId,
            'is_saved_by_user' => in_array($interactionId, $savedInteractionPostIds, true),
            'user' => [
                'id' => $postUser->id ?? null,
                'name' => $postUser->name ?? 'User',
                'avatar' => ($postUser && $postUser->image) ? (function() use ($postUser) {
                    $imagePath = ltrim((string)$postUser->image, '/');
                    if (strpos($imagePath, 'img/profile/') !== false) {
                        return url('storage/' . $imagePath);
                    }
                    return url('storage/img/profile/' . $imagePath);
                })() : null,
                'image' => $postUser->image ?? null,
            ],
            'likes' => $post->likes ? $post->likes->count() : 0,
            'is_liked_by_user' => $post->likes ? $post->likes->contains('user_id', $authUser->id) : false,
            'comments' => $post->comments ? $post->comments->count() : 0,
            'reposts' => (int) ($interactionPost->reposts()->count()),
            'is_reposted_by_user' => DB::table('reposts_posts')
                ->where('user_id', $authUser->id)
                ->where('post_id', $interactionPost->id)
                ->exists(),
        ];
    }

    private function resolveInteractionPost(Post $post): Post
    {
        // Pivot-based reposts do not create a separate Post row.
        return $post;
    }

    private function mapRepostForMobileFeed(object $repostRow, Post $originalPost, ?User $reposter, $authUser, array $savedInteractionPostIds = []): array
    {
        $originalPost->loadMissing(['user', 'likes', 'comments']);
        $original = $this->mapPostForMobileFeed($originalPost, $authUser, $savedInteractionPostIds);

        $createdAt = null;
        if (!empty($repostRow->created_at)) {
            $createdAt = is_string($repostRow->created_at) ? $repostRow->created_at : (string) $repostRow->created_at;
        }

        $reposterAvatar = null;
        if ($reposter?->image) {
            $imagePath = ltrim((string) $reposter->image, '/');
            $reposterAvatar = str_contains($imagePath, 'img/profile/')
                ? url('storage/' . $imagePath)
                : url('storage/img/profile/' . $imagePath);
        }

        return [
            'id' => (int) ($repostRow->id ?? 0),
            'type' => 'repost',
            'content' => (string) ($repostRow->description ?? ''),
            'description' => (string) ($repostRow->description ?? ''),
            'images' => [],
            'image' => null,
            'created_at' => $createdAt,
            'interaction_post_id' => (int) $originalPost->id,
            'is_saved_by_user' => in_array((int) $originalPost->id, $savedInteractionPostIds, true),
            'repost_of' => $original,
            'user' => [
                'id' => $reposter?->id,
                'name' => $reposter?->name ?? 'User',
                'avatar' => $reposterAvatar,
                'image' => $reposter?->image,
            ],
            // Surface original interaction stats at the top-level too (mobile clients often read these).
            'likes' => (int) ($original['likes'] ?? 0),
            'comments' => (int) ($original['comments'] ?? 0),
            'reposts' => (int) ($original['reposts'] ?? 0),
            'is_liked_by_user' => (bool) ($original['is_liked_by_user'] ?? false),
            'is_reposted_by_user' => DB::table('reposts_posts')
                ->where('user_id', $authUser->id)
                ->where('post_id', $originalPost->id)
                ->exists(),
        ];
    }

    public function index(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $feed = [];
            $recentPosts = collect([]);

            // Get recent posts + recent reposts (pivot), then merge into one feed.
            try {
                $recentPostsModels = Post::with(['user', 'likes', 'comments'])
                    ->withCount(['reposts'])
                    ->where(function ($q) {
                        $q->whereNull('is_hidden')->orWhere('is_hidden', false);
                    })
                    ->whereNotNull('created_at')
                    ->orderBy('created_at', 'desc')
                    ->limit(20)
                    ->get()
                    ->filter();

                $recentRepostRows = DB::table('reposts_posts')
                    ->orderByDesc('created_at')
                    ->limit(20)
                    ->get();

                $interactionIds = $recentPostsModels
                    ->map(fn ($p) => (int) $p->id)
                    ->concat($recentRepostRows->pluck('post_id')->map(fn ($id) => (int) $id))
                    ->filter()
                    ->unique()
                    ->values()
                    ->all();

                $savedInteractionIds = [];
                if (!empty($interactionIds)) {
                    $savedInteractionIds = DB::table('post_saves')
                        ->where('user_id', $user->id)
                        ->whereIn('post_id', $interactionIds)
                        ->pluck('post_id')
                        ->map(fn ($id) => (int) $id)
                        ->values()
                        ->all();
                }

                $recentPosts = $recentPostsModels
                    ->map(fn ($post) => $this->mapPostForMobileFeed($post, $user, $savedInteractionIds))
                    ->filter()
                    ->values();

                $originalPostsById = Post::with(['user', 'likes', 'comments'])
                    ->withCount(['reposts'])
                    ->where(function ($q) {
                        $q->whereNull('is_hidden')->orWhere('is_hidden', false);
                    })
                    ->whereIn('id', $recentRepostRows->pluck('post_id')->all())
                    ->get()
                    ->keyBy('id');

                $repostersById = User::query()
                    ->select(['id', 'name', 'image'])
                    ->whereIn('id', $recentRepostRows->pluck('user_id')->all())
                    ->get()
                    ->keyBy('id');

                $recentReposts = $recentRepostRows
                    ->map(function ($row) use ($originalPostsById, $repostersById, $user, $savedInteractionIds) {
                        $original = $originalPostsById[(int) $row->post_id] ?? null;
                        if (!$original) {
                            return null;
                        }

                        $reposter = $repostersById[(int) $row->user_id] ?? null;
                        return $this->mapRepostForMobileFeed($row, $original, $reposter, $user, $savedInteractionIds);
                    })
                    ->filter()
                    ->values();

                $recentPosts = $recentPosts->concat($recentReposts)->values();
            } catch (\Exception $e) {
                Log::error('Error fetching posts for feed: ' . $e->getMessage());
                Log::error('Stack trace: ' . $e->getTraceAsString());
                $recentPosts = collect([]);
            }

            // Sort posts by created_at and convert to array
            $feed = $recentPosts
                ->filter(function ($item) {
                    return $item !== null && isset($item['created_at']) && $item['created_at'] !== null;
                })
                ->sortByDesc('created_at')
                ->values()
                ->toArray();

            return response()->json(['feed' => $feed]);
        } catch (\Throwable $e) {
            Log::error('Error in feed endpoint: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            Log::error('File: ' . $e->getFile() . ' Line: ' . $e->getLine());
            Log::error('Exception class: ' . get_class($e));
            
            // Return empty feed instead of error to prevent app crash
            return response()->json([
                'feed' => [],
                'error' => config('app.debug') ? [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ] : null,
            ]);
        }
    }

    public function store(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'description' => 'nullable|string|max:5000',
            'images' => 'array|max:' . Post::MAX_IMAGES,
            'images.*' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:10240',
        ]);

        $uploadedFiles = $request->file('images', []);
        if (count($uploadedFiles) > Post::MAX_IMAGES) {
            return response()->json(['message' => 'Too many images'], 422);
        }

        $imagesArray = $this->persistUploadedImages($uploadedFiles);

        $post = Post::create([
            'user_id' => $user->id,
            'description' => (string) ($request->input('description') ?? ''),
            'images' => $imagesArray,
        ]);

        return response()->json([
            'post' => $this->formatPostForFeed($post, $user),
        ], 201);
    }

    /** Show a single post for editing (owner-only). */
    public function showPost(int $id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $post = Post::with(['user', 'likes', 'comments'])
            ->withCount(['reposts'])
            ->findOrFail($id);

        return response()->json([
            'post' => $this->mapPostForMobileFeed($post, $user, []),
            'can_edit' => (int) $post->user_id === (int) $user->id,
        ]);
    }

    /** Update a post (owner-only). Supports multipart with new_images[]. */
    public function updatePost(Request $request, int $id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $post = Post::findOrFail($id);
        if ((int) $post->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'description' => 'nullable|string|max:5000',
            'keep_images' => 'array',
            'keep_images.*' => 'string',
            'removed_images' => 'array',
            'removed_images.*' => 'string',
            'new_images' => 'array',
            'new_images.*' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:10240',
        ]);

        $ownedImages = collect($post->images ?? []);

        $removedImages = collect($request->input('removed_images', []))
            ->filter(fn ($image) => $ownedImages->contains($image))
            ->unique()
            ->values();

        $keepImages = collect($request->input('keep_images', []))
            ->filter(fn ($image) => $ownedImages->contains($image))
            ->unique()
            ->values();

        if ($keepImages->isEmpty()) {
            $keepImages = $ownedImages->diff($removedImages)->values();
        }

        $incomingFiles = $request->file('new_images', []);
        if ($keepImages->count() + count($incomingFiles) > Post::MAX_IMAGES) {
            return response()->json(['message' => 'Too many images'], 422);
        }

        $newImages = $this->persistUploadedImages($incomingFiles);
        $nextImages = $keepImages->concat($newImages)->values()->toArray();

        $this->deleteStoredImages($removedImages->toArray());

        $post->description = (string) ($request->input('description') ?? '');
        $post->images = $nextImages;
        $post->save();

        return response()->json([
            'post' => $this->formatPostForFeed($post->fresh(), $user),
        ]);
    }

    /** Delete a post (owner-only). */
    public function deletePost(int $id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $post = Post::findOrFail($id);
        if ((int) $post->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $this->deleteStoredImages($post->images ?? []);
        $post->delete();

        return response()->json(['deleted' => true]);
    }

    private function formatPostForFeed(Post $post, $authUser): array
    {
        $post->loadMissing(['user', 'likes', 'comments']);
        $interactionPost = $this->resolveInteractionPost($post);
        $postUser = $post->user ?? null;

        $imageUrls = [];
        $images = $post->images ?? [];
        if (is_array($images) && count($images) > 0) {
            foreach ($images as $image) {
                if (!$image) {
                    continue;
                }
                if (strpos($image, 'http') === 0) {
                    $imageUrls[] = $image;
                } else {
                    $imagePath = ltrim((string) $image, '/');
                    if (strpos($imagePath, 'img/posts/') !== false) {
                        $imageUrls[] = url('storage/' . $imagePath);
                    } else {
                        $imageUrls[] = url('storage/img/posts/' . $imagePath);
                    }
                }
            }
        }

        return [
            'id' => $post->id,
            'type' => 'post',
            'content' => $post->description ?? '',
            'description' => $post->description ?? '',
            'images' => $imageUrls,
            'image' => count($imageUrls) > 0 ? $imageUrls[0] : null,
            'created_at' => $post->created_at ? (is_string($post->created_at) ? $post->created_at : $post->created_at->toDateTimeString()) : null,
            'user' => [
                'id' => $postUser?->id,
                'name' => $postUser?->name ?? 'User',
                'avatar' => ($postUser && $postUser->image) ? (function () use ($postUser) {
                    $imagePath = ltrim((string) $postUser->image, '/');
                    if (strpos($imagePath, 'img/profile/') !== false) {
                        return url('storage/' . $imagePath);
                    }
                    return url('storage/img/profile/' . $imagePath);
                })() : null,
                'image' => $postUser?->image ?? null,
            ],
            'likes' => $post->likes ? $post->likes->count() : 0,
            'is_liked_by_user' => $post->likes ? $post->likes->contains('user_id', $authUser->id) : false,
            'comments' => $post->comments ? $post->comments->count() : 0,
            'reposts' => (int) ($interactionPost->reposts()->count()),
            'is_reposted_by_user' => DB::table('reposts_posts')
                ->where('user_id', $authUser->id)
                ->where('post_id', $interactionPost->id)
                ->exists(),
        ];
    }

    private function persistUploadedImages(array $files): array
    {
        $stored = [];
        $disk = 'public';

        try {
            $storage = Storage::disk($disk);
            if (!$storage->exists(self::POST_IMAGES_DIR)) {
                $storage->makeDirectory(self::POST_IMAGES_DIR, 0755, true);
            }
        } catch (Throwable $e) {
            report($e);
        }

        foreach ($files as $image) {
            if (!$image || !$image->isValid()) {
                continue;
            }

            try {
                $path = $image->store(self::POST_IMAGES_DIR, $disk);
                if ($path) {
                    $stored[] = basename($path);
                }
            } catch (Throwable $e) {
                Log::error('Failed to store post image: ' . $e->getMessage());
                report($e);
            }
        }

        return $stored;
    }

    private function deleteStoredImages(iterable $filenames = []): void
    {
        $disk = 'public';
        $storage = Storage::disk($disk);

        foreach ($filenames as $fileName) {
            if (!$fileName) {
                continue;
            }

            $value = ltrim((string) $fileName, '/');
            if (!str_contains($value, self::POST_IMAGES_DIR . '/')) {
                $value = self::POST_IMAGES_DIR . '/' . basename($value);
            }

            try {
                if ($storage->exists($value)) {
                    $storage->delete($value);
                }
            } catch (Throwable $e) {
                report($e);
            }
        }
    }

    /**
     * Return all top-level comments for a post (oldest first),
     * each with its replies nested, like count, and whether the auth user liked it.
     */
    public function getComments(int $id)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $post = Post::findOrFail($id);

        // Load top-level comments only; replies are nested via eager loading
        $comments = $post->comments()
            ->with([
                'user:id,name,image',
                'likes',
                'replies.user:id,name,image',
                'replies.likes',
            ])
            ->whereNull('parent_id')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($c) => $this->formatComment($c, $user->id));

        return response()->json(['comments' => $comments]);
    }

    /**
     * Return the real total comments count for a post (includes replies).
     */
    public function getCommentsCount(int $id)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $post = Post::findOrFail($id);

        $count = Comment::query()
            ->where('post_id', $post->id)
            ->count('*');

        return response()->json(['comments_count' => $count]);
    }

    /** Formats a single comment (or reply) into the mobile API shape. */
    private function formatComment(Comment $comment, int $authUserId): array
    {
        $avatarValue = $comment->user?->image;
        $avatar = null;

        if ($avatarValue) {
            $imagePath = ltrim((string) $avatarValue, '/');
            $avatar = str_contains($imagePath, 'img/profile/')
                ? url('storage/' . $imagePath)
                : url('storage/img/profile/' . $imagePath);
        }

        $likeCount     = $comment->likes?->count() ?? 0;
        $isLiked       = $comment->likes?->contains('user_id', $authUserId) ?? false;

        $replies = $comment->replies
            ? $comment->replies
                ->sortBy('created_at')
                ->map(fn ($r) => $this->formatComment($r, $authUserId))
                ->values()
                ->toArray()
            : [];

        return [
            'id'         => $comment->id,
            'parent_id'  => $comment->parent_id,
            'body'       => $comment->comment,
            'created_at' => $comment->created_at?->toDateTimeString(),
            'likes_count'       => $likeCount,
            'is_liked_by_user'  => $isLiked,
            'replies'    => $replies,
            'user'       => [
                'id'     => $comment->user?->id,
                'name'   => $comment->user?->name ?? 'User',
                'avatar' => $avatar,
            ],
        ];
    }

    /**
     * Add a comment (or reply) to a post.
     * Pass `parent_id` to make it a reply to an existing comment.
     */
    public function addComment(Request $request, int $id)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'comment'   => 'required|string|max:2000',
            'parent_id' => 'nullable|integer|exists:comments,id',
        ]);

        $post = Post::findOrFail($id);

        $comment = $post->comments()->create([
            'user_id'   => $user->id,
            'comment'   => $request->comment,
            'parent_id' => $request->parent_id ?? null,
        ]);

        $comment->load(['user:id,name,image', 'likes']);

        return response()->json([
            'comment' => $this->formatComment($comment, $user->id),
        ], 201);
    }

    /**
     * Toggle a like on a comment for the authenticated mobile user.
     */
    public function toggleCommentLike(int $commentId)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $comment = Comment::findOrFail($commentId);

        $existing = CommentLike::query()
            ->where('comment_id', $commentId)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            CommentLike::query()->whereKey($existing->getKey())->delete();
            $liked = false;
        } else {
            CommentLike::create(['comment_id' => $commentId, 'user_id' => $user->id]);
            $liked = true;
        }

        $count = CommentLike::query()->where('comment_id', $commentId)->count('*');

        return response()->json([
            'liked'       => $liked,
            'likes_count' => $count,
        ]);
    }

    /**
     * Update a comment/reply (owner-only).
     */
    public function updateComment(Request $request, int $id)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'comment' => 'required|string|max:2000',
        ]);

        $comment = Comment::with(['user:id,name,image', 'likes', 'replies.user:id,name,image', 'replies.likes'])
            ->findOrFail($id);

        if ((int) $comment->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $comment->comment = $request->comment;
        $comment->save();

        $comment->refresh();

        return response()->json([
            'comment' => $this->formatComment($comment, $user->id),
        ]);
    }

    /**
     * Delete a comment/reply (owner-only).
     * Replies are deleted automatically via the comments.parent_id cascade FK.
     */
    public function deleteComment(int $id)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $comment = Comment::findOrFail($id);

        if ((int) $comment->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $comment->delete();

        return response()->json(['deleted' => true]);
    }

    /**
     * Toggle a like on a post for the authenticated mobile user.
     * Returns the new liked state and updated like count.
     */
    public function toggleLike(int $id)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $post = Post::findOrFail($id);

        $existingLike = $post->likes()->where('user_id', $user->id)->first();

        if ($existingLike) {
            $existingLike->delete();
            $liked = false;
        } else {
            $post->likes()->create(['user_id' => $user->id]);
            $liked = true;
        }

        $post->loadCount('likes');

        return response()->json([
            'liked'       => $liked,
            'likes_count' => $post->likes_count,
        ]);
    }

    public function toggleSave(int $id)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $post = Post::findOrFail($id);
        $interactionPost = $this->resolveInteractionPost($post);
        $interactionId = (int) $interactionPost->id;

        $existing = DB::table('post_saves')
            ->where('user_id', $user->id)
            ->where('post_id', $interactionId)
            ->first();

        if ($existing) {
            DB::table('post_saves')
                ->where('user_id', $user->id)
                ->where('post_id', $interactionId)
                ->delete();
            $saved = false;
        } else {
            DB::table('post_saves')->insert([
                'user_id' => $user->id,
                'post_id' => $interactionId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $saved = true;
        }

        return response()->json([
            'saved' => $saved,
            'post_id' => $interactionId,
        ]);
    }

    public function getSavedPosts(Request $request)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $saved = $user->savedPosts()
            ->with(['user', 'likes', 'comments'])
            ->withCount(['reposts'])
            ->orderByPivot('created_at', 'desc')
            ->limit(60)
            ->get();

        $savedInteractionIds = $saved
            ->map(fn ($p) => (int) $this->resolveInteractionPost($p)->id)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $feed = $saved
            ->map(fn ($post) => $this->mapPostForMobileFeed($post, $user, $savedInteractionIds))
            ->values()
            ->toArray();

        return response()->json([
            'posts' => $feed,
        ]);
    }

    /**
     * Return all users who liked a post, newest first, including whether the
     * authenticated user already follows each liker.
     */
    public function getLikes(int $id)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $post = Post::findOrFail($id);

        $followingIds = $user->following()->pluck('users.id')->toArray();

        $likes = Like::query()
            ->where('post_id', $post->id)
            ->with('user:id,name,image')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($like) use ($user, $followingIds) {
                $likedUser = $like->user;
                $imageValue = $likedUser?->image;
                $avatar = null;

                if ($imageValue) {
                    $imagePath = ltrim((string) $imageValue, '/');
                    $avatar = str_contains($imagePath, 'img/profile/')
                        ? url('storage/' . $imagePath)
                        : url('storage/img/profile/' . $imagePath);
                }

                $likedUserId = (int) ($likedUser?->id ?? 0);

                return [
                    'id' => (int) $likedUserId,
                    'name' => $likedUser?->name ?? 'User',
                    'avatar' => $avatar,
                    'is_me' => $likedUserId === (int) $user->id,
                    'is_following' => $likedUserId ? in_array($likedUserId, $followingIds, true) : false,
                ];
            })
            ->values();

        return response()->json(['likes' => $likes]);
    }

    public function repost(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'post_id' => 'required|integer|exists:posts,id',
            'description' => 'nullable|string|max:5000',
        ]);

        $post = Post::with(['user', 'likes', 'comments'])->withCount(['reposts'])->findOrFail((int) $validated['post_id']);
        $interactionPost = $this->resolveInteractionPost($post);

        $alreadyReposted = DB::table('reposts_posts')
            ->where('user_id', $user->id)
            ->where('post_id', $interactionPost->id)
            ->exists();

        if ($alreadyReposted) {
            $repostsCount = (int) $interactionPost->reposts()->count();
            return response()->json([
                'message' => 'Already reposted',
                'reposted' => true,
                'reposts_count' => $repostsCount,
            ], 200);
        }

        $description = (string) ($validated['description'] ?? '');

        $repostId = DB::transaction(function () use ($user, $interactionPost, $description) {
            return DB::table('reposts_posts')->insertGetId([
                'user_id' => $user->id,
                'post_id' => $interactionPost->id,
                'description' => $description !== '' ? $description : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        $repostsCount = (int) $interactionPost->reposts()->count();

        $repostRow = (object) [
            'id' => $repostId,
            'user_id' => $user->id,
            'post_id' => $interactionPost->id,
            'description' => $description !== '' ? $description : null,
            'created_at' => now()->toDateTimeString(),
        ];

        return response()->json([
            'message' => 'Post reposted successfully',
            'reposted' => true,
            'reposts_count' => $repostsCount,
            'post' => $this->mapRepostForMobileFeed($repostRow, $interactionPost, $user, $user, []),
        ], 201);
    }

    public function unrepost(Request $request)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'post_id' => 'required|integer|exists:posts,id',
        ]);

        $post = Post::findOrFail((int) $validated['post_id']);
        $interactionPost = $this->resolveInteractionPost($post);

        $repostPivot = DB::table('reposts_posts')
            ->where('user_id', $user->id)
            ->where('post_id', $interactionPost->id)
            ->first();

        if (!$repostPivot) {
            $repostsCount = (int) $interactionPost->reposts()->count();
            return response()->json([
                'message' => 'Not reposted',
                'reposted' => false,
                'reposts_count' => $repostsCount,
            ], 200);
        }

        DB::transaction(function () use ($user, $interactionPost) {
            DB::table('reposts_posts')
                ->where('user_id', $user->id)
                ->where('post_id', $interactionPost->id)
                ->delete();
        });

        $repostsCount = (int) $interactionPost->reposts()->count();

        return response()->json([
            'message' => 'Repost removed',
            'reposted' => false,
            'reposts_count' => $repostsCount,
        ], 200);
    }
}

