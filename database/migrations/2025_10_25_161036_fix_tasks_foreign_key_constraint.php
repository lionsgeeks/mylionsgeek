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
        // For SQLite, we need to recreate the table to fix foreign key constraints
        if (DB::getDriverName() === 'sqlite') {
            // Disable foreign key checks
            DB::statement('PRAGMA foreign_keys=OFF');
            
            // Create a new tasks table with correct foreign key
            Schema::create('tasks_new', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
                $table->enum('status', ['todo', 'in_progress', 'review', 'completed'])->default('todo');
                $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
                $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
                $table->date('due_date')->nullable();
                $table->integer('sort_order')->default(0);
                $table->json('subtasks')->nullable();
                $table->json('assignees')->nullable();
                $table->boolean('is_pinned')->default(false);
                $table->boolean('is_editable')->default(true);
                $table->integer('progress')->default(0);
                $table->json('tags')->nullable();
                $table->timestamp('started_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                // $table->integer('estimated_hours')->nullable();
                // $table->integer('actual_hours')->nullable();
                $table->timestamps();
            });
            
            // Copy data from old table to new table with proper defaults
            DB::statement('INSERT INTO tasks_new (id, title, description, priority, status, project_id, created_by, due_date, sort_order, subtasks, assignees, is_pinned, is_editable, progress, tags, started_at, completed_at, created_at, updated_at) 
                SELECT id, title, description, COALESCE(priority, "medium"), COALESCE(status, "todo"), project_id, created_by, due_date, COALESCE(sort_order, 0), subtasks, assignees, COALESCE(is_pinned, 0), COALESCE(is_editable, 1), COALESCE(progress, 0), tags, started_at, completed_at, created_at, updated_at FROM tasks');
            
            // Drop old table
            Schema::dropIfExists('tasks');
            
            // Rename new table to tasks
            DB::statement('ALTER TABLE tasks_new RENAME TO tasks');
            
            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not easily reversible
        // You would need to manually restore the old foreign key constraint
    }
};