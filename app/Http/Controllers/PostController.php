<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
        // dd($Likes);
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
        // eager load user info for response
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

        // See if this user already liked this post
        $like = $post->likes()->where('user_id', $user->id)->first();
        if ($like) {
            // Unlike (remove like)
            $like->delete();
            $liked = false;
        } else {
            // Add like
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
    public function deletePost($id)
    {
        $post = Post::find($id);
        if (!$post) {
            return redirect()->back()->with('error', 'Post not found');
        } else if (Auth::user()->id != $post->user_id) {
            return redirect()->back()->with('error', "You can't delete this post");
        }
        $post->delete();
        return redirect()->back()->with('success', 'Post must be deleted');
    }
    //! edit post function
    public function editPost(Request $request, $id)
    {
        $request->validate([
            'description' => 'nullable|string',
            'image' => 'nullable|mimes:png,jpg,gif,jpeg'
        ]);
        $post = Post::find($id);
        if ($request->hasFile('image')) {
            # code...
            $file = $request->file('image');
            $fileName = $file->hashName();
            $file->move(public_path('/storage/img/posts'), $fileName);
            $request->image = $fileName;
        };
        $post->update([
            'description' => $request->description,
            'image' => $request->image
        ]);
        return redirect()->back()->with('success', 'Post Updated SuccesFully');
    }
}
