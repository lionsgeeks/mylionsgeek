<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('email')->nullable()->change();
                $table->string('password')->nullable()->change();
                if (! Schema::hasColumn('users', 'is_external')) {
                    $table->boolean('is_external')->default(false);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users')) {
            $nullEmailCount = DB::table('users')->whereNull('email')->count();
            $nullPasswordCount = DB::table('users')->whereNull('password')->count();

            if ($nullEmailCount > 0 || $nullPasswordCount > 0) {
                throw new \RuntimeException(
                    "Cannot rollback migration [2026_09_22_100000_make_user_email_nullable_and_add_is_external]: " .
                    "{$nullEmailCount} user(s) have a null email and {$nullPasswordCount} user(s) have a null password (e.g. external coaches). " .
                    "Restoring the NOT NULL constraint would fail or cause data loss. " .
                    "To protect existing user records, rollback has been safely aborted. " .
                    "Please reassign or update these records before reverting non-nullable constraints."
                );
            }

            Schema::table('users', function (Blueprint $table) {
                $table->string('password')->nullable(false)->change();
                $table->string('email')->nullable(false)->change();
                if (Schema::hasColumn('users', 'is_external')) {
                    $table->dropColumn('is_external');
                }
            });
        }
    }
};
