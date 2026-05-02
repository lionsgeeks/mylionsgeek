<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSocialLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Handle roles - ensure it's always an array
        $roles = [];
        if (isset($user->role)) {
            $roles = is_array($user->role) ? $user->role : (is_string($user->role) ? json_decode($user->role, true) ?? [$user->role] : [$user->role]);
        }
        if (empty($roles) && isset($user->roles)) {
            $roles = is_array($user->roles) ? $user->roles : (is_string($user->roles) ? json_decode($user->roles, true) ?? [] : []);
        }

        // Check if user is admin
        $isAdmin = in_array('admin', array_map('strtolower', $roles)) || in_array('coach', array_map('strtolower', $roles));

        // Base user data (always returned)
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            // 'avatar' => $user->image,
            'image' => $user->image,
            'cover' => $user->cover,
            'roles' => $roles,
            'role' => $roles,
            'promo' => $user->promo,
            'status' => $user->status,
            'created_at' => $user->created_at ? (is_string($user->created_at) ? $user->created_at : $user->created_at->toDateTimeString()) : null,
            'updated_at' => $user->updated_at ? (is_string($user->updated_at) ? $user->updated_at : $user->updated_at->toDateTimeString()) : null,
        ];

        // Sensitive fields - only for admins
        if ($isAdmin) {
            $userData['phone'] = $user->phone ?? null;
            $userData['cin'] = $user->cin ?? null;
            $userData['formation_id'] = $user->formation_id ?? null;
            $userData['account_state'] = $user->account_state ?? 0;
            $userData['state'] = $user->account_state ?? 0;
            $userData['access_cowork'] = $user->access_cowork ?? 0;
            $userData['access_studio'] = $user->access_studio ?? 0;
            $userData['wakatime_api_key'] = $user->wakatime_api_key ? substr($user->wakatime_api_key, 0, 10).'...' : null;
        }

        // Always include last_online for profile display
        $userData['last_online'] = $user->last_online ? (is_string($user->last_online) ? $user->last_online : $user->last_online->format('Y-m-d H:i:s')) : null;

        // Always expose own editable fields
        $userData['phone']  = $user->phone ?? null;
        $userData['status'] = $user->status ?? null;
        $userData['resume'] = $user->resume ?? null;
        $userData['social_links'] = $user->socialLinks()->ordered()->get(['id', 'title', 'url'])->toArray();

        // Add followers and following counts
        $userData['followers_count'] = $user->followers()->count();
        $userData['following_count'] = $user->following()->count();

        // Add posts count
        $userData['posts_count'] = $user->posts()->count();

        return response()->json($userData);
    }

    public function show(Request $request, $userId)
    {
        $currentUser = Auth::guard('sanctum')->user();

        if (! $currentUser) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $currentUserRoles = [];
        if (isset($currentUser->role)) {
            $currentUserRoles = is_array($currentUser->role) ? $currentUser->role : (is_string($currentUser->role) ? json_decode($currentUser->role, true) ?? [$currentUser->role] : [$currentUser->role]);
        }
        $currentUserRolesLower = array_map('strtolower', $currentUserRoles);
        $isRecruiter = in_array('recruiter', $currentUserRolesLower, true);
        if ($isRecruiter && (int) $userId !== (int) $currentUser->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::where('id', $userId)->where('account_state', 0)->first();

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Handle roles
        $roles = [];
        if (isset($user->role)) {
            $roles = is_array($user->role) ? $user->role : (is_string($user->role) ? json_decode($user->role, true) ?? [$user->role] : [$user->role]);
        }

        $isAdmin = in_array('admin', $currentUserRolesLower, true) || in_array('coach', $currentUserRolesLower, true);

        // Base user data
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            // 'avatar' => $user->image ? url('storage/'.$user->image) : null,
            'cover' => $user->cover,
            'image' => $user->image,
            'roles' => $roles,
            'role' => $roles,
            'promo' => $user->promo,
            'status' => $user->status,
            'created_at' => $user->created_at ? (is_string($user->created_at) ? $user->created_at : $user->created_at->toDateTimeString()) : null,
            'updated_at' => $user->updated_at ? (is_string($user->updated_at) ? $user->updated_at : $user->updated_at->toDateTimeString()) : null,
        ];

        // Always include last_online
        $userData['last_online'] = $user->last_online ? (is_string($user->last_online) ? $user->last_online : $user->last_online->format('Y-m-d H:i:s')) : null;

        // Add followers and following counts
        $userData['followers_count'] = $user->followers()->count();
        $userData['following_count'] = $user->following()->count();

        // Add posts count
        $userData['posts_count'] = $user->posts()->count();

        // Whether the current authenticated viewer follows this user
        $userData['is_following'] = $currentUser
            ? $currentUser->following()->where('followed_id', $user->id)->exists()
            : false;

        // Sensitive fields - only for admins
        if ($isAdmin) {
            $userData['phone'] = $user->phone ?? null;
            $userData['cin'] = $user->cin ?? null;
            $userData['formation_id'] = $user->formation_id ?? null;
            $userData['account_state'] = $user->account_state ?? 0;
            $userData['access_cowork'] = $user->access_cowork ?? 0;
            $userData['access_studio'] = $user->access_studio ?? 0;
            $userData['wakatime_api_key'] = $user->wakatime_api_key ? substr($user->wakatime_api_key, 0, 10).'...' : null;
        }

        return response()->json($userData);
    }

    /**
     * Update the authenticated user's own profile (name, email, phone, status, avatar, resume).
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::guard('sanctum')->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'name'   => 'sometimes|string|max:255',
            'email'  => 'sometimes|email|max:255',
            'phone'  => 'sometimes|nullable|string|max:30',
            'status' => 'sometimes|nullable|string|max:255',
            'image'  => 'sometimes|file|image|max:4096',
            'resume' => 'sometimes|file|mimes:pdf,doc,docx|max:10240',
        ]);

        if ($request->hasFile('image')) {
            $file     = $request->file('image');
            $filename = $file->hashName();
            $file->move(public_path('/storage/img/profile'), $filename);
            $data['image'] = $filename;
        }

        if ($request->hasFile('resume')) {
            $file     = $request->file('resume');
            $filename = $file->hashName();
            $file->move(public_path('/storage/resume'), $filename);
            $data['resume'] = $filename;
        }

        $allowed = ['name', 'email', 'phone', 'status', 'image', 'resume'];
        User::where('id', $user->id)->update(array_intersect_key($data, array_flip($allowed)));

        $fresh = User::find($user->id);

        return response()->json([
            'message' => 'Profile updated',
            'data'    => [
                'id'     => $fresh->id,
                'name'   => $fresh->name,
                'email'  => $fresh->email,
                'phone'  => $fresh->phone,
                'status' => $fresh->status,
                'image'  => $fresh->image,
                'resume' => $fresh->resume,
            ],
        ]);
    }

    /**
     * List the authenticated user's social links.
     */
    public function listSocialLinks(Request $request)
    {
        $user = Auth::guard('sanctum')->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $links = $user->socialLinks()->ordered()->get(['id', 'title', 'url']);

        return response()->json(['data' => $links]);
    }

    /**
     * Add a social link for the authenticated user.
     */
    public function addSocialLink(Request $request)
    {
        $user = Auth::guard('sanctum')->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'title' => 'required|string|max:80',
            'url'   => 'required|string|max:2048',
        ]);

        $link = UserSocialLink::create([
            'user_id'    => $user->id,
            'title'      => $data['title'],
            'url'        => $data['url'],
            'sort_order' => UserSocialLink::where('user_id', $user->id)->max('sort_order') + 1,
        ]);

        return response()->json(['data' => $link], 201);
    }

    /**
     * Delete a social link belonging to the authenticated user.
     */
    public function deleteSocialLink(Request $request, int $id)
    {
        $user = Auth::guard('sanctum')->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $link = UserSocialLink::where('id', $id)->where('user_id', $user->id)->first();

        if (! $link) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $link->delete();

        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Return the list of users who follow the given user.
     * Each entry includes `is_following` — whether the authenticated viewer already follows that user.
     */
    public function listFollowers(Request $request, int $userId)
    {
        $currentUser = Auth::guard('sanctum')->user();

        if (! $currentUser) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user = User::findOrFail($userId);

        // Pre-fetch the IDs the current viewer already follows to avoid N+1 queries.
        $viewerFollowingIds = $currentUser->following()->pluck('users.id')->toArray();

        $followers = $user->followers()
            ->select('users.id', 'users.name', 'users.image', 'users.promo', 'users.status')
            ->get()
            ->map(fn ($u) => [
                'id'           => $u->id,
                'name'         => $u->name,
                'image'        => $u->image,
                'promo'        => $u->promo,
                'status'       => $u->status,
                'is_following' => in_array($u->id, $viewerFollowingIds),
            ]);

        return response()->json(['data' => $followers]);
    }

    /**
     * Return the list of users the given user is following.
     * Each entry includes `is_following` — whether the authenticated viewer already follows that user.
     */
    public function listFollowing(Request $request, int $userId)
    {
        $currentUser = Auth::guard('sanctum')->user();

        if (! $currentUser) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user = User::findOrFail($userId);

        $viewerFollowingIds = $currentUser->following()->pluck('users.id')->toArray();

        $following = $user->following()
            ->select('users.id', 'users.name', 'users.image', 'users.promo', 'users.status')
            ->get()
            ->map(fn ($u) => [
                'id'           => $u->id,
                'name'         => $u->name,
                'image'        => $u->image,
                'promo'        => $u->promo,
                'status'       => $u->status,
                'is_following' => in_array($u->id, $viewerFollowingIds),
            ]);

        return response()->json(['data' => $following]);
    }

    /**
     * Follow a user (mobile). If already followed, this is a no-op.
     */
    public function follow(Request $request, int $userId)
    {
        $currentUser = Auth::guard('sanctum')->user();

        if (! $currentUser) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ((int) $currentUser->id === (int) $userId) {
            return response()->json(['message' => 'You cannot follow yourself'], 400);
        }

        $target = User::findOrFail($userId);

        $already = $currentUser->following()->where('followed_id', $target->id)->exists();

        if ($already) {
            $currentUser->following()->detach($target->id);
        } else {
            $currentUser->following()->syncWithoutDetaching([$target->id]);
        }

        return response()->json([
            'followed' => ! $already,
            'user_id'  => (int) $target->id,
        ]);
    }
}
