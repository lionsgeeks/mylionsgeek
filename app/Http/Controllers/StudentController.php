<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;
use App\Models\User;
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
    public function userProfile($id)
    {
        $user = User::find($id);
        return Inertia::render('students/user/partials/StudentProfile', [
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'image' => $user->image,
                'online' => $user->last_online,
                'Gp' => $user->GP,
                'Xp' => $user->XP,
                'about' => $user->about,
                'socials' => $user->socials,
                'level' => $user->level,
                'promo' => $user->promo,
                'cover' => $user->cover,
                'name' => $user->name,
                'status' => $user->status,
                'created_at' => $user->created_at->format('Y-m-d'),
                'formation' => $user->formation_id != Null ? $user->formation->name : 'jfdsl',
                'formation_id' => $user->formation_id,
                'cin' => $user->cin,
                'access_studio' => $user->access_studio,
                'access_cowork' => $user->access_cowork,
                'role' => $user->role,
            ],
        ]);
    }
    public function changeProfileImage(Request $request, $id)
    {
        $user = User::find($id);
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $file = $request->file('image');
            $path = $file->store('img/profile', 'public');
            $request->image = basename($path);
            $user->update([
                'image' => $request->image,
            ]);

            return redirect()->back()->with('success', 'image changed successfully');
        }

        return redirect()->back()->with('error', 'There was an error changing the image.');
    }
    public function changeCover(Request $request, $id)
    {
        $user = User::find($id);
        $request->validate([
            'cover' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
        if ($request->hasFile('cover') && $request->file('cover')->isValid()) {
            $path = $request->file('cover')->store('img/cover', 'public');
            $user->update([
                'cover' => $path,
            ]);

            return redirect()->back()->with('success', 'Cover changed successfully');
        }

        return redirect()->back()->with('error', 'There was an error changing the cover.');
    }
}
