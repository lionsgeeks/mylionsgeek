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

        foreach (range(0, $users->count()) as $i) {
            # code...
            Follower::create([
                'follower_id' => $users->random()->id,
                'followed_id' => $users->random()->id,
            ]);
        }
    }
}
