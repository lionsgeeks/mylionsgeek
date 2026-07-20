<?php

namespace Database\Seeders;

use App\Models\Formation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GeekLabStudentSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->command?->warn('GeekLabStudentSeeder is intended for local/testing only. Skipping.');

            return;
        }

        $mediaFormation = Formation::find(24);
        $codingFormation = Formation::find(25);

        if (! $mediaFormation || ! $codingFormation) {
            $this->command?->error('Formations 24 (media) and/or 25 (coding) were not found. Aborting.');

            return;
        }

        $password = Hash::make('password');
        $createdMedia = 0;
        $createdCoding = 0;

        for ($i = 1; $i <= 50; $i++) {
            $email = sprintf('geeklab.media.%02d@example.com', $i);
            $user = User::firstOrNew(['email' => $email]);
            $user->forceFill([
                'name' => sprintf('GeekLab Media Student %02d', $i),
                'password' => $password,
                'role' => ['student'],
                'status' => 'Studying',
                'formation_id' => 24,
                'field' => 'media',
                'promo' => null,
                'account_state' => 0,
                'access_studio' => 0,
                'access_cowork' => 0,
                'image' => 'pdp.png',
                'email_verified_at' => now(),
            ])->save();
            $createdMedia++;
        }

        for ($i = 1; $i <= 50; $i++) {
            $email = sprintf('geeklab.coding.%02d@example.com', $i);
            $user = User::firstOrNew(['email' => $email]);
            $user->forceFill([
                'name' => sprintf('GeekLab Coding Student %02d', $i),
                'password' => $password,
                'role' => ['student'],
                'status' => 'Studying',
                'formation_id' => 25,
                'field' => 'coding',
                'promo' => null,
                'account_state' => 0,
                'access_studio' => 0,
                'access_cowork' => 0,
                'image' => 'pdp.png',
                'email_verified_at' => now(),
            ])->save();
            $createdCoding++;
        }

        $this->command?->info("✅ {$createdMedia} media students → formation #24 \"{$mediaFormation->name}\"");
        $this->command?->info("✅ {$createdCoding} coding students → formation #25 \"{$codingFormation->name}\"");
        $this->command?->info('   Login password for all: password');
        $this->command?->info('   Emails: geeklab.media.01@example.com … geeklab.coding.50@example.com');
    }
}
