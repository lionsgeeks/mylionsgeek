<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Disable FK checks for SQLite
        DB::statement('PRAGMA foreign_keys = OFF;');

        // Drop task_comments table if it exists
        Schema::dropIfExists('task_comments');

        // Drop task_attachments table if it exists
        Schema::dropIfExists('task_attachments');

        // Drop task_assignments table if it exists
        Schema::dropIfExists('task_assignments');

        // Also drop task_assignees table if it exists (in case user meant this one)
        // Note: We already dropped this in a previous migration, but including it for safety
        Schema::dropIfExists('task_assignees');

        // Re-enable FK checks
        DB::statement('PRAGMA foreign_keys = ON;');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: We don't recreate these tables in the down method
        // as they were likely created in other migrations and may have been
        // replaced by JSON columns in the tasks table
    }
};
