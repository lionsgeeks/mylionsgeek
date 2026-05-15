<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('organizations', 'account_user_id')) {
            Schema::table('organizations', function (Blueprint $table) {
                $table->foreignId('account_user_id')->nullable()->after('invited_by')->constrained('users')->nullOnDelete();
            });
        }

        if (! Schema::hasTable('organization_user')) {
            Schema::create('organization_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('member_role', 32)->default('employer');
                $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->unique(['organization_id', 'user_id']);
                $table->index(['user_id', 'member_role']);
            });
        }

        if (Schema::hasColumn('users', 'organization_id')) {
            $ownerRows = DB::table('users')
                ->whereNotNull('organization_id')
                ->where('is_organization_owner', true)
                ->get(['id', 'organization_id']);

            foreach ($ownerRows as $row) {
                DB::table('organizations')
                    ->where('id', $row->organization_id)
                    ->whereNull('account_user_id')
                    ->update(['account_user_id' => $row->id]);
            }

            $fallbackOwners = DB::table('users')
                ->whereNotNull('organization_id')
                ->orderBy('id')
                ->get(['id', 'organization_id']);

            foreach ($fallbackOwners as $row) {
                DB::table('organizations')
                    ->where('id', $row->organization_id)
                    ->whereNull('account_user_id')
                    ->update(['account_user_id' => $row->id]);
            }

            $employerRows = DB::table('users')
                ->whereNotNull('organization_id')
                ->where(function ($query): void {
                    $query->where('is_organization_owner', false)->orWhereNull('is_organization_owner');
                })
                ->get(['id', 'organization_id']);

            $now = now();
            foreach ($employerRows as $row) {
                $isAccountUser = DB::table('organizations')
                    ->where('id', $row->organization_id)
                    ->where('account_user_id', $row->id)
                    ->exists();

                if ($isAccountUser) {
                    continue;
                }

                DB::table('organization_user')->insertOrIgnore([
                    'organization_id' => $row->organization_id,
                    'user_id' => $row->id,
                    'member_role' => 'employer',
                    'invited_by' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // Link org accounts created after a failed invite (org row without account_user_id).
        $orphanOrgs = DB::table('organizations')
            ->whereNull('account_user_id')
            ->get(['id', 'email']);

        foreach ($orphanOrgs as $org) {
            $userId = DB::table('users')
                ->where('email', $org->email)
                ->whereJsonContains('role', 'recruiter')
                ->value('id');

            if ($userId) {
                DB::table('organizations')
                    ->where('id', $org->id)
                    ->update(['account_user_id' => $userId]);
            }
        }

        if (Schema::hasColumn('users', 'organization_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }

        if (Schema::hasColumn('users', 'is_organization_owner')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('is_organization_owner');
            });
        }
    }

    public function down(): void
    {
        // Intentionally empty — do not revert a repair migration.
    }
};
