<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;
use Throwable;

class PostController extends Controller
{
    public function getPostComments($postId)
    {
        $post = Post::findOrFail($postId);
        $comments = $post->comments()
            ->with(['user:id,name,image'])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'user_id' => $c->user_id,
                    'user_name' => $c->user->name,
                    'user_lastActivity' => $c->user->last_online,
                    'user_image' => $c->user->image,
                    'comment' => $c->comment,
                    'created_at' => $c->created_at->toDateTimeString(),
                ];
            });
        return response()->json(['comments' => $comments]);
    }

    public function getPostLikes($postId)
    {
        $post = Post::findOrFail($postId);
        $Likes = $post->likes()
            ->with(['user:id,name,image'])
            ->orderBy('created_at', 'desc')->get()
            ->map(function ($l) {
                return [
                    'id' => $l->id,
                    'user_id' => $l->user_id,
                    'user_name' => $l->user->name,
                    'user_image' => $l->user->image ?? null,
                    'user_status' => $l->user->status,
                    'created_at' => $l->created_at->toDateTimeString(),
                ];
            });
        return response()->json(['likes' => $Likes]);
    }

    public function addPostComment(Request $request, $postId)
    {
        $request->validate([
            'comment' => 'required|string|max:2000',
        ]);
        $post = Post::findOrFail($postId);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $comment = $post->comments()->create([
            'user_id' => $user->id,
            'comment' => $request->comment,
        ]);
        $comment->load('user:id,name,image');
        return response()->json([
            'id' => $comment->id,
            'user_id' => $comment->user_id,
            'user_name' => $comment->user->name,
            'user_image' => $comment->user->image ?? null,
            'comment' => $comment->comment,
            'created_at' => $comment->created_at->toDateTimeString(),
        ]);
    }

    public function AddLike($id)
    {
        $user = Auth::user();
        $post = Post::findOrFail($id);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $like = $post->likes()->where('user_id', $user->id)->first();
        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            $post->likes()->create(['user_id' => $user->id]);
            $liked = true;
        }

        $count = $post->likes()->count();

        return response()->json([
            'liked' => $liked,
            'likes_count' => $count,
        ]);
    }

    public function deleteComment($id)
    {
        $comment = Comment::find($id);
        $comment->delete();
        return response()->json(['message' => 'Comment Deleted Succesfully']);
    }

    public function updateComment(Request $request, $id)
    {
        $request->validate([
            'comment' => 'required|string',
        ]);

        $comment = Comment::find($id);
        $comment->update([
            'comment' => $request->comment
        ]);
        return response()->json(['message' => 'Comment edited succesfully']);
    }

    public function deletePost(Request $request, $id)
    {
        $post = Post::with(['comments', 'likes'])->find($id);

        if (!$post) {
            return $this->respondWithMessage($request, 'Post not found', false, 404);
        }

        if (Auth::id() !== $post->user_id) {
            return $this->respondWithMessage($request, "You can't delete this post", false, 403);
        }

        $images = $this->collectPostImages($post->images);

        DB::transaction(function () use ($post, $images) {
            if ($images->isNotEmpty()) {
                $this->deleteStoredImages($images);
            }

            $this->clearPostImages($post);
            $post->comments()->delete();
            $post->likes()->delete();
            $post->delete();
        });

        return $this->respondWithMessage($request, 'Post deleted successfully');
    }

    public function editPost(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        if (Auth::id() !== $post->user_id) {
            abort(403);
        }

        $request->validate([
            'description' => 'nullable|string',
            'keep_images' => 'array',
            'keep_images.*' => 'string',
            'removed_images' => 'array',
            'removed_images.*' => 'string',
            'new_images' => 'array',
            'new_images.*' => 'nullable|image|mimes:png,jpg,jpeg,webp',
        ]);

        $ownedImages = collect($post->images ?? []);

        $removedImages = collect($request->input('removed_images', []))
            ->filter(fn($image) => $ownedImages->contains($image))
            ->unique()
            ->values();

        $keepImages = collect($request->input('keep_images', []))
            ->filter(fn($image) => $ownedImages->contains($image))
            ->unique()
            ->values();

        if ($keepImages->isEmpty()) {
            $keepImages = $ownedImages->diff($removedImages)->values();
        }

        $incomingFiles = $request->file('new_images', []);
        if ($keepImages->count() + count($incomingFiles) > Post::MAX_IMAGES) {
            return back()->withErrors([
                'new_images' => "You can keep or upload up to " . Post::MAX_IMAGES . " images per post.",
            ])->withInput($request->except(['new_images']));
        }

        if ($removedImages->isNotEmpty()) {
            $this->deleteStoredImages($removedImages->all());
        }

        $newUploads = $this->persistUploadedImages($incomingFiles);

        $finalImages = $this->sanitizeImageNames(
            array_merge($keepImages->all(), $newUploads)
        );

        $post->update([
            'description' => $request->input('description', $post->description),
            'images' => $finalImages,
        ]);

        return back()->with('success', 'Post Updated Successfully');
    }

    public function storePost(Request $request)
    {
        $request->validate([
            'description' => 'nullable|string',
            'images' => 'array|max:' . Post::MAX_IMAGES,
            'images.*' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:10240', // 10MB max
        ]);

        $uploadedFiles = $request->file('images', []);
        if (count($uploadedFiles) > Post::MAX_IMAGES) {
            return back()->withErrors([
                'images' => "You can upload up to " . Post::MAX_IMAGES . " images per post."
            ])->withInput($request->except(['images']));
        }

        $imagesArray = $this->sanitizeImageNames($this->persistUploadedImages($uploadedFiles));

        Post::create([
            'user_id' => Auth::id(),
            'description' => $request->description,
            'images' => $imagesArray,
        ]);

        $posts = Post::withCount(['likes', 'comments'])->latest()->get();

        return back()->with([
            'success' => 'Post Created Successfully',
            'posts' => $posts
        ]);
    }

    private function persistUploadedImages(array $files = []): array
    {
        $stored = [];
        $disk = $this->postImagesDisk();
        $this->ensurePostImagesDirectoryExists($disk);

        foreach ($files as $image) {
            if (!$image || !$image->isValid()) continue;

            try {
                $path = $image->store('img/posts', $disk);
                if ($path) $stored[] = basename($path);
            } catch (Throwable $e) {
                \Log::error("Failed to store image: " . $e->getMessage());
                report($e);
            }
        }

        return $stored;
    }

    private function deleteStoredImages(iterable $filenames = []): void
    {
        $defaultDisk = $this->postImagesDisk();

        foreach ($this->uniqueImageDescriptors($filenames) as $descriptor) {
            $path = $descriptor['path'];
            $disk = $descriptor['disk'] ?? $defaultDisk;
            $publicId = $descriptor['public_id'];

            if ($publicId) {
                $this->deleteFileFromDisk($publicId, $disk);
            }

            if ($path) {
                $this->deleteFileFromDisk($path, $disk);
            }
        }
    }

    private function uniqueImageDescriptors(iterable $filenames): array
    {
        $unique = [];
        $seen = [];

        foreach ($filenames as $fileName) {
            if (!$fileName) {
                continue;
            }

            $descriptor = $this->normalizeImageDescriptor($fileName);

            if (!$descriptor['path'] && !$descriptor['public_id']) {
                continue;
            }

            $key = implode('|', [
                $descriptor['disk'] ?? $this->postImagesDisk(),
                $descriptor['public_id'] ?? '',
                $descriptor['path'] ?? '',
            ]);

            if (isset($seen[$key])) {
                continue;
            }

            $seen[$key] = true;
            $unique[] = $descriptor;
        }

        return $unique;
    }

    private function collectPostImages($images): Collection
    {
        if (blank($images)) {
            return collect();
        }

        if (is_string($images)) {
            $decoded = json_decode($images, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $images = $decoded;
            } else {
                $images = [$images];
            }
        }

        if ($images instanceof Collection) {
            return $images->filter(fn($image) => !blank($image))->values();
        }

        if (!is_array($images)) {
            return collect();
        }

        return collect($images)
            ->filter(fn($image) => !blank($image))
            ->values();
    }

    private function sanitizeImageNames(iterable $images): array
    {
        $names = [];

        foreach ($images as $image) {
            $name = $this->extractImageName($image);

            if ($name) {
                $names[] = $name;
            }
        }

        return array_values(array_unique($names));
    }

    private function extractImageName($image): ?string
    {
        $value = null;

        if (is_array($image)) {
            $value = $image['name']
                ?? $image['path']
                ?? $image['url']
                ?? $image['preview']
                ?? $image['id']
                ?? null;
        } else {
            $value = $image;
        }

        if (!$value) {
            return null;
        }

        $trimmed = trim((string) $value);

        if ($trimmed === '') {
            return null;
        }

        $withoutQuery = preg_split('/[?#]/', $trimmed, 2)[0];
        $basename = basename($withoutQuery);

        if ($basename === '' || $basename === '.' || $basename === '..') {
            return null;
        }

        return $basename;
    }

    private function normalizeImageDescriptor($image): array
    {
        if (is_array($image)) {
            return [
                'path' => $this->normalizeImagePath($image['path'] ?? $image['url'] ?? $image['preview'] ?? $image['id'] ?? null),
                'disk' => $image['disk'] ?? $image['storage_disk'] ?? null,
                'public_id' => $image['public_id'] ?? $image['provider_public_id'] ?? null,
            ];
        }

        return [
            'path' => $this->normalizeImagePath($image),
            'disk' => null,
            'public_id' => null,
        ];
    }

    private function normalizeImagePath($path): ?string
    {
        if (!$path) {
            return null;
        }

        $value = trim((string) $path);

        if ($value === '') {
            return null;
        }

        if (preg_match('/^https?:\/\//i', $value)) {
            return null;
        }

        $value = ltrim($value, '/');

        if (str_starts_with($value, 'storage/')) {
            $value = substr($value, strlen('storage/'));
        }

        if (str_starts_with($value, 'public/')) {
            $value = substr($value, strlen('public/'));
        }

        if (!str_contains($value, '/')) {
            $value = 'img/posts/' . $value;
        }

        return $value;
    }

    private function deleteFileFromDisk(string $path, ?string $disk = null): void
    {
        $trimmed = ltrim($path, '/');
        $diskName = $disk ?? $this->postImagesDisk();

        try {
            $storage = Storage::disk($diskName);
            if ($storage->exists($trimmed)) {
                $storage->delete($trimmed);
                return;
            }
        } catch (Throwable $exception) {
            report($exception);
        }

        if ($diskName === 'public') {
            $publicStoragePath = public_path('storage/' . $trimmed);
            if (file_exists($publicStoragePath)) {
                @unlink($publicStoragePath);
                return;
            }

            $absolutePath = public_path($trimmed);
            if (file_exists($absolutePath)) {
                @unlink($absolutePath);
            }
        }
    }

    private function respondWithMessage(Request $request, string $message, bool $success = true, int $status = 200)
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => $message], $status);
        }

        $flashKey = $success ? 'success' : 'error';

        return redirect()->back()->with($flashKey, $message);
    }

    private function clearPostImages(Post $post): void
    {
        $post->forceFill(['images' => []]);

        if (method_exists($post, 'saveQuietly')) {
            $post->saveQuietly();
            return;
        }

        $originalTimestamps = $post->timestamps;
        $post->timestamps = false;
        $post->save();
        $post->timestamps = $originalTimestamps;
    }

    private function postImagesDisk(): string
    {
        // Always fallback to public
        $configured = config('filesystems.post_images_disk')
            ?? env('POST_IMAGES_DISK')
            ?? 'public';

        $disks = config('filesystems.disks', []);

        return array_key_exists($configured, $disks) ? $configured : 'public';
    }

    private function ensurePostImagesDirectoryExists(string $disk): void
    {
        $directory = 'img/posts';
        $storage = Storage::disk($disk);

        // Make directory if it doesn't exist
        if (!$storage->exists($directory)) {
            try {
                $storage->makeDirectory($directory, 0755, true);
            } catch (Throwable $e) {
                // fallback to manual creation for public disk
                if ($disk === 'public') {
                    $fullPath = storage_path('app/public/' . $directory);
                    if (!file_exists($fullPath)) {
                        mkdir($fullPath, 0755, true);
                    }
                }
                report($e);
            }
        }
    }
}
