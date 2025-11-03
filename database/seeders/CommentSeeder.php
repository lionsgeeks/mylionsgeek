<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Faker\Factory as Faker;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $faker = Faker::create();

        $posts = Post::all();
        $users = User::all();

        if ($posts->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠️ Please seed users and posts first.');
            return;
        }

        foreach ($posts as $post) {
            foreach (range(1, rand(2, 6)) as $i) {
                Comment::create([
                    'post_id' => $post->id,
                    'user_id' => $users->random()->id,
                    'comment' => $faker->sentence(rand(6, 12)),
                ]);
            }
        }

        $this->command->info('✅ Comments created for all posts!');
    }
}
