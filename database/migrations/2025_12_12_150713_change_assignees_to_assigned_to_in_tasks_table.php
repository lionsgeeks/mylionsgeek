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

        // Step 1: Add assigned_to column first if it doesn't exist
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'assigned_to')) {
                // For SQLite, we add the column first without foreign key, then add the constraint separately
                $table->unsignedBigInteger('assigned_to')->nullable()->after('project_id');
            }
        });

        // Add foreign key constraint separately for SQLite compatibility
        // Note: SQLite doesn't support adding foreign keys to existing tables easily,
        // so we'll just add the column and let the application handle referential integrity

        // Step 2: Migrate data from task_assignees pivot table to assigned_to column
        if (Schema::hasTable('task_assignees')) {
            // Get the first assignee for each task
            $assignees = DB::table('task_assignees')
                ->select('task_id', 'user_id')
                ->orderBy('task_id')
                ->orderBy('id')
                ->get()
                ->groupBy('task_id')
                ->map(function ($group) {
                    return $group->first()->user_id;
                });

            // Update tasks with assigned_to from task_assignees
            foreach ($assignees as $taskId => $userId) {
                DB::table('tasks')
                    ->where('id', $taskId)
                    ->update(['assigned_to' => $userId]);
            }
        }

        // Step 3: Also migrate from JSON assignees column if it exists and assigned_to is null
        if (Schema::hasColumn('tasks', 'assignees')) {
            $tasksWithJsonAssignees = DB::table('tasks')
                ->whereNull('assigned_to')
                ->whereNotNull('assignees')
                ->get();

            foreach ($tasksWithJsonAssignees as $task) {
                $assigneesArray = json_decode($task->assignees, true);
                if (is_array($assigneesArray) && count($assigneesArray) > 0) {
                    // Get first assignee ID (handle both object and array formats)
                    $firstAssigneeId = null;
                    if (isset($assigneesArray[0])) {
                        $firstAssignee = $assigneesArray[0];
                        $firstAssigneeId = is_array($firstAssignee) && isset($firstAssignee['id']) 
                            ? $firstAssignee['id'] 
                            : (is_numeric($firstAssignee) ? $firstAssignee : null);
                    }

                    if ($firstAssigneeId) {
                        DB::table('tasks')
                            ->where('id', $task->id)
                            ->update(['assigned_to' => $firstAssigneeId]);
                    }
                }
            }
        }

        // Step 4: Remove assignees JSON column if it exists
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'assignees')) {
                $table->dropColumn('assignees');
            }
        });

        // Step 5: Drop task_assignees pivot table if it exists
        if (Schema::hasTable('task_assignees')) {
            Schema::dropIfExists('task_assignees');
        }

        // Re-enable FK checks
        DB::statement('PRAGMA foreign_keys = ON;');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('PRAGMA foreign_keys = OFF;');

        // Recreate task_assignees table
        if (!Schema::hasTable('task_assignees')) {
            Schema::create('task_assignees', function (Blueprint $table) {
                $table->id();
                $table->foreignId('task_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->timestamp('assigned_at')->useCurrent();
                $table->timestamps();
                $table->unique(['task_id', 'user_id']);
            });
        }

        // Migrate assigned_to back to task_assignees
        $tasksWithAssignee = DB::table('tasks')
            ->whereNotNull('assigned_to')
            ->get();

        foreach ($tasksWithAssignee as $task) {
            DB::table('task_assignees')->insert([
                'task_id' => $task->id,
                'user_id' => $task->assigned_to,
                'assigned_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        Schema::table('tasks', function (Blueprint $table) {
            // Add assignees JSON column back
            if (!Schema::hasColumn('tasks', 'assignees')) {
                $table->json('assignees')->nullable()->after('subtasks');
            }

            // Drop assigned_to column
            if (Schema::hasColumn('tasks', 'assigned_to')) {
                $table->dropForeign(['assigned_to']);
                $table->dropColumn('assigned_to');
            }
        });

        DB::statement('PRAGMA foreign_keys = ON;');
    }
};
