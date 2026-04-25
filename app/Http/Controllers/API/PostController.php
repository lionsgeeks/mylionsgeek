<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\Project;
use App\Models\Reservation;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PostController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $feed = [];
            $recentPosts = collect([]);

            // Get recent posts
            try {
                $recentPosts = Post::with(['user', 'likes', 'comments'])
                    ->whereNotNull('created_at')
                    ->orderBy('created_at', 'desc')
                    ->limit(20)
                    ->get()
                    ->filter(function ($post) {
                        return $post !== null;
                    })
                    ->map(function ($post) use ($user) {
                        try {
                            $postUser = $post->user ?? null;
                            $images = $post->images ?? [];
                            $imageUrls = [];
                            
                            if (is_array($images) && count($images) > 0) {
                                foreach ($images as $image) {
                                    if ($image) {
                                        if (strpos($image, 'http') === 0) {
                                            $imageUrls[] = $image;
                                        } else {
                                            // Check if image path already includes img/posts
                                            $imagePath = ltrim((string)$image, '/');
                                            if (strpos($imagePath, 'img/posts/') !== false) {
                                                $imageUrls[] = url('storage/' . $imagePath);
                                            } else {
                                                // If it's just a filename, use /storage/img/posts/
                                                $imageUrls[] = url('storage/img/posts/' . $imagePath);
                                            }
                                        }
                                    }
                                }
                            }
                            
                            $createdAt = null;
                            if ($post->created_at) {
                                $createdAt = is_string($post->created_at) 
                                    ? $post->created_at 
                                    : $post->created_at->toDateTimeString();
                            }
                            
                            return [
                                'id' => $post->id ?? null,
                                'type' => 'post',
                                'content' => $post->description ?? '',
                                'description' => $post->description ?? '',
                                'images' => $imageUrls,
                                'image' => count($imageUrls) > 0 ? $imageUrls[0] : null,
                                'hashtags' => $post->hashTags ?? [],
                                'created_at' => $createdAt,
                                'user' => [
                                    'id' => $postUser->id ?? null,
                                    'name' => $postUser->name ?? 'User',
                                    'avatar' => ($postUser && $postUser->image) ? (function() use ($postUser) {
                                        $imagePath = ltrim((string)$postUser->image, '/');
                                        // Check if image path already includes img/profile
                                        if (strpos($imagePath, 'img/profile/') !== false) {
                                            return url('storage/' . $imagePath);
                                        } else {
                                            // If it's just a filename, use /storage/img/profile/
                                            return url('storage/img/profile/' . $imagePath);
                                        }
                                    })() : null,
                                    'image' => $postUser->image ?? null,
                                ],
                                'likes' => $post->likes ? $post->likes->count() : 0,
                                'is_liked_by_user' => $post->likes ? $post->likes->contains('user_id', $user->id) : false,
                                'comments' => $post->comments ? $post->comments->count() : 0,
                                'reposts' => 0,
                            ];
                        } catch (\Exception $e) {
                            Log::error('Error mapping post: ' . $e->getMessage());
                            return null;
                        }
                    })
                    ->filter(function ($item) {
                        return $item !== null;
                    });
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
            'content' => 'required|string|max:5000',
            'type' => 'nullable|in:post,photo,video,article',
        ]);

        // TODO: Create post in database
        // For now, return success
        return response()->json([
            'message' => 'Post created successfully',
            'post' => [
                'id' => uniqid(),
                'content' => $request->content,
                'type' => $request->type ?? 'post',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $user->image ? (function() use ($user) {
                        $imagePath = ltrim((string)$user->image, '/');
                        // Check if image path already includes img/profile
                        if (strpos($imagePath, 'img/profile/') !== false) {
                            return url('storage/' . $imagePath);
                        } else {
                            // If it's just a filename, use /storage/img/profile/
                            return url('storage/img/profile/' . $imagePath);
                        }
                    })() : null,
                    'image' => $user->image ?? null,
                ],
                'created_at' => now()->toDateTimeString(),
            ],
        ], 201);
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

        $existing = CommentLike::where('comment_id', $commentId)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            CommentLike::create(['comment_id' => $commentId, 'user_id' => $user->id]);
            $liked = true;
        }

        $count = CommentLike::where('comment_id', $commentId)->count();

        return response()->json([
            'liked'       => $liked,
            'likes_count' => $count,
        ]);
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

    public function repost(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'post_id' => 'required|string',
        ]);

        // TODO: Create repost in database
        // For now, return success
        return response()->json([
            'message' => 'Post reposted successfully',
            'repost' => [
                'post_id' => $request->post_id,
                'user_id' => $user->id,
                'created_at' => now()->toDateTimeString(),
            ],
        ], 201);
    }
}

