<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('attendance_lists')) {
            // Change user_id to string to support UUID user IDs without data loss
            Schema::table('attendance_lists', function (Blueprint $table) {
                // Requires doctrine/dbal in some databases to change column type
                $table->string('user_id', 64)->change();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('attendance_lists')) {
            Schema::table('attendance_lists', function (Blueprint $table) {
                // Best-effort revert to integer; may fail if non-numeric values exist
                $table->integer('user_id')->change();
            });
        }
    }
};


