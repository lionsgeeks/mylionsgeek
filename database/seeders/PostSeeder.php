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
        // $faker = Faker::create();

        // // Ensure there are users to attach posts to
        // $users = User::all();

        // if ($users->isEmpty()) {
        //     $this->command->warn('⚠️ No users found. Run UserSeeder first or create users manually.');
        //     return;
        // }

        // // Generate 50 fake posts
        // foreach (range(1, 50) as $i) {
        //     Post::create([
        //         'user_id'     => $users->random()->id,
        //         'description' => $faker->paragraph(3),
        //         'image'       => 'https://picsum.photos/seed/' . $i . '/600/400',
        //         'hash_tags'   => '#' . implode(' #', $faker->words(3)),
        //         'likes'       => $faker->numberBetween(0, 500),
        //         'comments'    => json_encode([
        //             ['user' => $faker->name, 'comment' => $faker->sentence()],
        //             ['user' => $faker->name, 'comment' => $faker->sentence()],
        //         ]),
        //         'status'      => $faker->boolean(80), // 80% active
        //     ]);
        // }

        // $this->command->info('✅ 50 fake posts successfully created!');
    }
}
