<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->foreignId('account_user_id')->nullable()->after('invited_by')->constrained('users')->nullOnDelete();
        });

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

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('organization_id');
            $table->dropColumn('is_organization_owner');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('organization_id')->nullable()->after('role')->constrained('organizations')->nullOnDelete();
            $table->boolean('is_organization_owner')->default(false)->after('organization_id');
        });

        $orgs = DB::table('organizations')->whereNotNull('account_user_id')->get(['id', 'account_user_id']);
        foreach ($orgs as $org) {
            DB::table('users')->where('id', $org->account_user_id)->update([
                'organization_id' => $org->id,
                'is_organization_owner' => true,
            ]);
        }

        $pivotRows = DB::table('organization_user')->get(['organization_id', 'user_id']);
        foreach ($pivotRows as $row) {
            DB::table('users')->where('id', $row->user_id)->update([
                'organization_id' => $row->organization_id,
                'is_organization_owner' => false,
            ]);
        }

        Schema::dropIfExists('organization_user');

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_user_id');
        });
    }
};
