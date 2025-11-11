<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use function PHPSTORM_META\map;

class StudentController extends Controller
{
    public function index()
    {
        $userController = new UsersController();
        $data = $userController->getPosts();
        $posts = collect($data['posts']);

        $posts = $posts->map(function ($post) {
            return [
                'user_id' => $post->user_id,
                'user_name' => $post->user->name,
                'user_image' => $post->user->image,
                'user_last_online' => $post->user->last_online,
                'user_status' => $post->user->status,
                'user_formation' => $post->user->formation?->name,
                'id' => $post->id,
                'description' => $post->description,
                'image' => $post->image,
                'likes_count' => $post->likes->count(),
                'comments_count' => $post->comments->count(),
                'created_at' => $post->created_at,
            ];
        });
        $user = Auth::user();
        // dd($posts);
        return Inertia::render('student/feed/index', [
            'posts' => $posts,
            'user' => $user
        ]);
    }
}
