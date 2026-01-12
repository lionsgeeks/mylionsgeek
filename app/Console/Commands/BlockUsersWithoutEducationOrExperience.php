<?php

namespace App\Console\Commands;

use App\Http\Controllers\ReservationsController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BlockUsersWithoutEducationOrExperience extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:block-without-education-or-experience';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Block access (set access_studio and access_cowork to 0) for users who don\'t have education OR experience. User must have at least one of them.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking users for education or experience...');

        if (!Schema::hasTable('users')) {
            $this->error('Users table does not exist');
            return self::FAILURE;
        }

        try {
            // Get all users who have bypass roles (they should keep their access)
            $bypassRoleUsers = DB::table('users')
                ->get()
                ->filter(function ($user) {
                    $roles = $this->normalizeRolesList($user->role ?? null);
                    $accessBypassRoles = ['admin', 'super_admin', 'moderateur', 'coach', 'studio_responsable'];
                    return !empty(array_intersect($roles, $accessBypassRoles));
                })
                ->pluck('id')
                ->toArray();

            $this->info('Bypass role users (will be skipped): ' . count($bypassRoleUsers));

            // Get all user IDs that have education
            $usersWithEducation = [];
            if (Schema::hasTable('education_user')) {
                $usersWithEducation = DB::table('education_user')
                    ->distinct()
                    ->pluck('user_id')
                    ->toArray();
            }

            $this->info('Users with education: ' . count($usersWithEducation));

            // Get all user IDs that have experience
            $usersWithExperience = [];
            if (Schema::hasTable('experience_user')) {
                $usersWithExperience = DB::table('experience_user')
                    ->distinct()
                    ->pluck('user_id')
                    ->toArray();
            }

            $this->info('Users with experience: ' . count($usersWithExperience));

            // Users who have at least one (education OR experience)
            $usersWithEducationOrExperience = ($usersWithEducation + $usersWithExperience);


            // Get all users who don't have education AND don't have experience, and are not in bypass roles
            $usersToBlock = DB::table('users')
                ->whereNotIn('id', $usersWithEducationOrExperience)
                ->whereNotIn('id', $bypassRoleUsers)
                ->pluck('id')
                ->toArray();

            $this->info('Users to block (no education AND no experience): ' . count($usersToBlock));

            // Update access for users without education or experience
            $updatedCount = 0;
            if (!empty($usersToBlock)) {
                $updatedCount = DB::table('users')
                    ->whereIn('id', $usersToBlock)
                    ->update([
                        'access_studio' => 0,
                        'updated_at' => now()->toDateTimeString(),
                    ]);

                $this->info("Successfully blocked access for {$updatedCount} user(s).");
            } else {
                $this->info('No users to block.');
            }

            $totalUsers = DB::table('users')->count();
            $this->info("Total users checked: {$totalUsers}");

            $this->info('Command completed successfully.');

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to block users: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return self::FAILURE;
        }
    }

    /**
     * Normalize roles list from various formats
     */
    private function normalizeRolesList($roles): array
    {
        if (is_array($roles)) {
            $list = $roles;
        } elseif (is_string($roles) && $roles !== '') {
            $decoded = json_decode($roles, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $list = $decoded;
            } else {
                $list = array_map('trim', explode(',', $roles));
            }
        } else {
            $list = [];
        }

        return array_filter(array_map(fn($role) => strtolower((string) $role), $list));
    }
}

