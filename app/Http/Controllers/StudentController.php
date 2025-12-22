<?php

namespace App\Http\Controllers;

use App\Models\Follower;
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
        $userId = Auth::user()->id;
        $user = $this->getUserInfo($userId);
        return Inertia::render('students/user/index', [
            'posts' => $posts,
            'user' => $user
        ]);
    }
    public function userProfile($id)
    {
        $user = $this->getUserInfo($id);
        return Inertia::render('students/user/partials/StudentProfile', [
            'user' => $user
        ]);
    }
    public function getUserInfo($id)
    {
        $user = User::find($id);
        $isFollowing = Auth::user()
            ->following()
            ->where('followed_id', $id)
            ->exists();
        // dd($isFollowing);
        $followers = User::find($id)
            ->followers()
            ->select('users.id', 'users.name', 'users.image')
            ->get();
        $following = User::find($id)
            ->following()
            ->select('users.id', 'users.name', 'users.image')
            ->get();
        return  [
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
                'formation' => $user->formation_id != Null ? $user->formation->name : '',
                'formation_id' => $user->formation_id,
                'cin' => $user->cin,
                'access_studio' => $user->access_studio,
                'access_cowork' => $user->access_cowork,
                'role' => $user->role,
                'followers' => $followers,
                'following' => $following,
                'isFollowing' => $isFollowing,
            ],
        ];
    }
    public function changeProfileImage(Request $request, $id)
    {
        $user = User::find($id);
        if (Auth::user()->id == $user->id) {
            # code...
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
        };
    }
    public function changeCover(Request $request, $id)
    {
        $user = User::find($id);
        if (Auth::user()->id == $user->id) {
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
        };
    }
    public function addToFollow($id)
    {
        $follower = Auth::user();      // the logged-in user
        $followed = User::findOrFail($id);  // the user to follow

        // Prevent self-follow
        if ($follower->id === $followed->id) {
            return back()->with('error', "You can't follow yourself.");
        }

        // Attach the followed user without duplicates
        $follower->following()->syncWithoutDetaching([$followed->id]);

        return back()->with('success', 'You are now following this user.');
    }

    public function unFollow($id)
    {
        $follower = Auth::user();               // logged-in user
        $followed = User::findOrFail($id);     // user to unfollow

        // Detach the followed user from the pivot table
        $follower->following()->detach($followed->id);

        return back()->with('success', 'You have unfollowed this user.');
    }
    public function updateAbout(Request $request, $id)
    {
        if (Auth::user()->id == $id) {
            $user = User::find($id);
            $request->validate([
                'about' => 'nullable|string'
            ]);

            $user->update([
                'about' => $request->about  
            ]);
            return redirect()->back()->with('success', 'About updated succefully');
        }
    }
}
