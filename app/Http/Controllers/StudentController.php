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
        $posts = $userController->getPosts();
        $user = Auth::user();
        // dd($posts);
        return Inertia::render('students/user/index', [
            'posts' => $posts,
            'user' => $user
        ]);
    }
}
