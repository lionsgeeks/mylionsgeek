<?php

namespace App\Http\Controllers;

use App\Models\FollowNotification;
use App\Models\User;
use Illuminate\Http\Request;
use Ably\AblyRest;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    //
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
                'link' => "/students/{$follower->id}",
                'icon_type' => 'user',
                'created_at' => $notification->created_at->toISOString(),
                'follower_id' => $follower->id,
                'followed_id' => $followed->id,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to broadcast follow notification: ' . $e->getMessage());
        }
    }
    public function create($id)
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

    public function delete($id)
    {
        $follower = Auth::user();               // logged-in user
        $followed = User::findOrFail($id);     // user to unfollow

        // Detach the followed user from the pivot table
        $follower->following()->detach($followed->id);

        return back()->with('success', 'You have unfollowed this user.');
    }
}
