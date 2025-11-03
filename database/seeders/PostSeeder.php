<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠️ No users found. Seed users first.');
            return;
        }

        foreach (range(1, 50) as $i) {
            Post::create([
                'user_id' => $users->random()->id,
                'description' => $faker->paragraph(2),
                'image' => '/posts/post.jpg',
                'hashTags' => '#' . implode(' #', $faker->words(3)),
                'status' => $faker->boolean(80),
            ]);
        }

        $this->command->info('✅ 50 posts created!');
    }
}
