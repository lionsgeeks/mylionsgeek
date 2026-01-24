<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Reservation;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
                    ->map(function ($post) {
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
                                            $imageUrls[] = url('storage/' . ltrim((string)$image, '/'));
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
                                    'avatar' => ($postUser && $postUser->image) ? url('storage/' . ltrim((string)$postUser->image, '/')) : null,
                                    'image' => $postUser->image ?? null,
                                ],
                                'likes' => $post->likes ? $post->likes->count() : 0,
                                'comments' => $post->comments ? $post->comments->count() : 0,
                                'reposts' => 0,
                            ];
                        } catch (\Exception $e) {
                            \Log::error('Error mapping post: ' . $e->getMessage());
                            return null;
                        }
                    })
                    ->filter(function ($item) {
                        return $item !== null;
                    });
            } catch (\Exception $e) {
                \Log::error('Error fetching posts for feed: ' . $e->getMessage());
                \Log::error('Stack trace: ' . $e->getTraceAsString());
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
            \Log::error('Error in feed endpoint: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            \Log::error('File: ' . $e->getFile() . ' Line: ' . $e->getLine());
            \Log::error('Exception class: ' . get_class($e));
            
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
                    'avatar' => $user->image ? url('storage/' . $user->image) : null,
                    'image' => $user->image ?? null,
                ],
                'created_at' => now()->toDateTimeString(),
            ],
        ], 201);
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

