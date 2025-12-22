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

        foreach ($users as $user) {
            // Pick random users except himself
            $toFollow = $users
                ->where('id', '!=', $user->id)
                ->random(rand(0, 5))
                ->pluck('id')
                ->toArray();
            $user->following()->syncWithoutDetaching($toFollow);
        }
    }
}
