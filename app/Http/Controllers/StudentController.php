<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user()->load('formation');
        $userController = new UsersController();
        $posts = $userController->getPosts($user, $request);
        return Inertia::render('student/feed/index', [
            'user' => $user,
            'posts' => $posts,
        ]);
    }
}
