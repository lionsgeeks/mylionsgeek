<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;

class LikeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $posts = Post::all();
        $users = User::all();

        if ($posts->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠️ Please seed users and posts first.');
            return;
        }

        foreach ($posts as $post) {
            // Random number of likes per post
            $likeUsers = $users->random(rand(1, $users->count()));
            foreach ($likeUsers as $user) {
                Like::create([
                    'post_id' => $post->id,
                    'user_id' => $user->id,
                ]);
            }
        }

        $this->command->info('✅ Likes created for all posts!');
    }
}
