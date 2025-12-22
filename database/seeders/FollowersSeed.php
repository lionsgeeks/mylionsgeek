<?php

namespace Database\Seeders;

use App\Models\Follower;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FollowersSeed extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $users = User::all();
        $user202 = User::find(202);

        // --- Step 1: Set user 202 following 50 random users ---
        $usersExcept202 = $users->where('id', '!=', 202);
        $toFollowBy202 = $usersExcept202->random(50)->pluck('id')->toArray();
        $user202->following()->sync($toFollowBy202);  // user 202 following 50 users

        // --- Step 2: Set 50 random users following user 202 ---
        $followersFor202 = $usersExcept202->random(50)->pluck('id')->toArray();
        $user202->followers()->sync($followersFor202); // 50 followers for user 202

        // --- Step 3: For every other user, set 10 following and 10 followers ---
        foreach ($usersExcept202 as $user) {
            // Following: pick 10 random users excluding current user
            $following = $usersExcept202->where('id', '!=', $user->id)->random(10)->pluck('id')->toArray();
            $user->following()->sync($following);

            // Followers: pick 10 random users excluding current user
            $followers = $usersExcept202->where('id', '!=', $user->id)->random(10)->pluck('id')->toArray();
            $user->followers()->sync($followers);
        }
    }
}
