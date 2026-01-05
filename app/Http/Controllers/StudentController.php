<?php

namespace App\Http\Controllers;

use App\Models\Education;
use App\Models\Experience;
use App\Models\Follower;
use App\Models\FollowNotification;
use App\Models\Like;
use App\Models\Post;
use App\Models\UserSocialLink;
use App\Models\User;
use Ably\AblyRest;
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
        $userExperience = User::with('experiences')->findOrFail($id);
        $userEducation = User::with('educations')->findOrFail($id);
        $userSocialLinks = User::with(['socialLinks' => function ($query) {
            $query->ordered();
        }])->findOrFail($id);
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
                'phone' => $user->phone,
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
                'experiences' => $userExperience->experiences,
                'educations' => $userEducation->educations,
                'social_links' => $userSocialLinks->socialLinks,
            ],
        ];
    }

    public function createSocialLink(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return back()->with('error', 'Unauthorized');
        }

        $data = $request->validate([
            'title' => 'required|string|max:80',
            'url' => 'required|string|max:2048',
        ]);

        UserSocialLink::create([
            'user_id' => $user->id,
            'title' => $data['title'],
            'url' => $data['url'],
            'sort_order' => UserSocialLink::where('user_id', $user->id)->max('sort_order') + 1,
        ]);

        return redirect()->back()->with('success', 'Social link added');
    }

    public function updateSocialLink(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user) {
            return back()->with('error', 'Unauthorized');
        }

        $link = UserSocialLink::findOrFail($id);
        if ((int) $link->user_id !== (int) $user->id) {
            return back()->with('error', "You can't edit this link");
        }

        $data = $request->validate([
            'title' => 'required|string|max:80',
            'url' => 'required|string|max:2048',
        ]);

        $link->update($data);

        return redirect()->back()->with('success', 'Social link updated');
    }

    public function deleteSocialLink($id)
    {
        $user = Auth::user();
        if (!$user) {
            return back()->with('error', 'Unauthorized');
        }

        $link = UserSocialLink::findOrFail($id);
        if ((int) $link->user_id !== (int) $user->id) {
            return back()->with('error', "You can't delete this link");
        }

        $link->delete();
        return redirect()->back()->with('success', 'Social link deleted');
    }

    public function reorderSocialLinks(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'links' => 'required|array',
            'links.*' => 'integer|exists:user_social_links,id',
        ]);

        $linkIds = $request->input('links');

        // Verify all links belong to the authenticated user
        $userLinks = UserSocialLink::where('user_id', $user->id)
            ->whereIn('id', $linkIds)
            ->pluck('id')
            ->toArray();

        if (count($userLinks) !== count($linkIds)) {
            return response()->json(['error' => 'Invalid link IDs'], 403);
        }

        // Update the order
        foreach ($linkIds as $index => $linkId) {
            UserSocialLink::where('id', $linkId)
                ->where('user_id', $user->id)
                ->update(['sort_order' => $index]);
        }

        return response()->json(['success' => true]);
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

        // Check if already following
        $alreadyFollowing = $follower->following()->where('followed_id', $followed->id)->exists();
        if ($alreadyFollowing) {
            return back()->with('error', "You are already following this user.");
        }

        // Attach the followed user without duplicates
        $follower->following()->syncWithoutDetaching([$followed->id]);

        // Create follow notification
        $notification = FollowNotification::createNotification($followed->id, $follower->id);

        // Broadcast follow notification via Ably
        $this->broadcastFollowNotification($notification, $follower, $followed);

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
        if (Auth::id() !== (int) $id) {
            abort(403);
        }

        $request->validate([
            'about' => 'nullable|string|max:500',
        ]);

        $user = User::findOrFail($id);

        $user->update([
            'about' => $request->about,
        ]);

        return back()->with('success', 'About updated successfully');
    }

    private function broadcastFollowNotification($notification, $follower, $followed): void
    {
        try {
            $ablyKey = config('services.ably.key');
            if (!$ablyKey) {
                return;
            }

            $ably = new AblyRest($ablyKey);
            $channel = $ably->channels->get("notifications:{$notification->user_id}");

            $message = "{$follower->name} started following you";

            $channel->publish('new_notification', [
                'id' => 'follow-' . $notification->id,
                'type' => 'follow',
                'sender_name' => $follower->name,
                'sender_image' => $follower->image,
                'message' => $message,
                'link' => "/student/{$follower->id}",
                'icon_type' => 'user',
                'created_at' => $notification->created_at->toISOString(),
                'follower_id' => $follower->id,
                'followed_id' => $followed->id,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to broadcast follow notification: ' . $e->getMessage());
        }
    }
    //! create experience
    public function createExperience(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'title' => 'string|required',
            'description' => 'string|nullable',
            'employment_type' => 'string|nullable',
            'company' => 'string|nullable',
            'start_month' => 'string|required',
            'start_year' => 'string|required',
            'end_month' => 'string|nullable',
            'end_year' => 'string|nullable',
            'location' => 'string|nullable',
        ]);
        $experience = Experience::create([
            'title' => $request->title,
            'description' => $request->description,
            'employement_type' => $request->employment_type,
            'company' => $request->company,
            'start_month' => $request->start_month,
            'start_year' => $request->start_year,
            'end_month' => $request->end_month,
            'end_year' => $request->end_year,
            'location' => $request->location,
        ]);

        $user->experiences()->attach($experience->id);
        return redirect()->back()->with('success', 'Experience created successfuly');
    }
    public function editExperience(Request $request, $id)
    {
        $user = Auth::user();
        $experience = Experience::find($id);

        // Check if user owns this experience
        if (!$user->experiences()->where('experience_id', $id)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'string|required',
            'description' => 'string|nullable',
            'company' => 'string|nullable',
            'employment_type' => 'string|nullable',
            'start_month' => 'string|required',
            'start_year' => 'string|required',
            'end_month' => 'string|nullable',
            'end_year' => 'string|nullable',
            'location' => 'string|nullable',
        ]);
        $experience->update([
            'title' => $request->title,
            'description' => $request->description,
            'employement_type' => $request->employment_type,
            'company' => $request->company,
            'start_month' => $request->start_month,
            'start_year' => $request->start_year,
            'end_month' => $request->end_month,
            'end_year' => $request->end_year,
            'location' => $request->location,
        ]);
        return redirect()->back()->with('success', 'Experience Updated successfuly');
    }
    public function deleteExperience($id)
    {
        $user = Auth::user();
        $experience = Experience::find($id);

        // Check if user owns this experience
        if (!$user->experiences()->where('experience_id', $id)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $experience->delete();
        return redirect()->back()->with('success', 'Experience Deleted successfuly');
    }
    public function createEducation(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'school' => 'string|required',
            'degree' => 'string|nullable',
            'fieldOfStudy' => 'string|nullable',
            'startMonth' => 'string|required',
            'startYear' => 'string|required',
            'endMonth' => 'string|nullable',
            'endYear' => 'string|nullable',
            'description' => 'string|nullable',
        ]);

        $education = Education::create([
            'user_id' => $user->id,
            'school' => $request->school,
            'degree' => $request->degree,
            'field_of_study' => $request->fieldOfStudy,
            'start_month' => $request->startMonth,
            'start_year' => $request->startYear,
            'end_month' => $request->endMonth,
            'end_year' => $request->endYear,
            'description' => $request->description,
        ]);
        $user->educations()->attach($education->id);
        return redirect()->back()->with('success', 'Experience created successfuly');
    }
    public function editEducation(Request $request, $id)
    {
        $user = Auth::user();
        $education = Education::find($id);

        // Check if user owns this education
        if (!$user->educations()->where('education_id', $id)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'school' => 'string|required',
            'degree' => 'string|nullable',
            'fieldOfStudy' => 'string|nullable',
            'start_month' => 'string|required',
            'start_year' => 'string|required',
            'end_month' => 'string|nullable',
            'endYear' => 'string|nullable',
            'description' => 'string|nullable',
        ]);

        $education->update([
            'school' => $request->school,
            'degree' => $request->degree,
            'field_of_study' => $request->fieldOfStudy,
            'start_month' => $request->start_month,
            'start_year' => $request->start_year,
            'end_month' => $request->end_month,
            'end_year' => $request->endYear,
            'description' => $request->description,
        ]);
        return redirect()->back()->with('success', 'Experience Updated successfuly');
    }
    public function deleteEducation($id)
    {
        $user = Auth::user();
        $education = Education::find($id);

        // Check if user owns this education
        if (!$user->educations()->where('education_id', $id)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $education->delete();
        return redirect()->back()->with('success', 'Experience Deleted successfuly');
    }
}
