<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Disable FK checks for SQLite
        DB::statement('PRAGMA foreign_keys = OFF;');

        // Modify tasks table safely
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'subtasks')) {
                $table->json('subtasks')->nullable();
            }
            if (!Schema::hasColumn('tasks', 'is_pinned')) {
                $table->boolean('is_pinned')->default(false);
            }
            if (!Schema::hasColumn('tasks', 'is_editable')) {
                $table->boolean('is_editable')->default(true);
            }
            if (!Schema::hasColumn('tasks', 'notes')) {
                $table->text('notes')->nullable();
            }
            if (!Schema::hasColumn('tasks', 'tags')) {
                $table->json('tags')->nullable();
            }
            if (!Schema::hasColumn('tasks', 'progress')) {
                $table->integer('progress')->default(0);
            }
            if (!Schema::hasColumn('tasks', 'started_at')) {
                $table->timestamp('started_at')->nullable();
            }
            if (!Schema::hasColumn('tasks', 'completed_at')) {
                $table->timestamp('completed_at')->nullable();
            }
            if (!Schema::hasColumn('tasks', 'attachments')) {
                $table->json('attachments')->nullable();
            }
            if (!Schema::hasColumn('tasks', 'comments')) {
                $table->json('comments')->nullable();
            }
            if (!Schema::hasColumn('tasks', 'assignees')) {
                $table->json('assignees')->nullable();
            }

            // Drop single assigned_to column safely
            if (Schema::hasColumn('tasks', 'assigned_to')) {
                $foreigns = DB::select("PRAGMA foreign_key_list('tasks')");
                foreach ($foreigns as $fk) {
                    if ($fk->from === 'assigned_to') {
                        $table->dropForeign([$fk->from]);
                    }
                }
                $table->dropColumn('assigned_to');
            }
        });

        // Create pivot and related tables if they don’t exist
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

        if (!Schema::hasTable('task_comments')) {
            Schema::create('task_comments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('task_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->text('content');
                $table->json('mentions')->nullable();
                $table->json('attachments')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('task_attachments')) {
            Schema::create('task_attachments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('task_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('filename');
                $table->string('original_name');
                $table->string('file_path');
                $table->string('mime_type');
                $table->bigInteger('file_size');
                $table->timestamps();
            });
        }

        // Re-enable FK checks
        DB::statement('PRAGMA foreign_keys = ON;');
    }

    public function down(): void
    {
        Schema::dropIfExists('task_attachments');
        Schema::dropIfExists('task_comments');
        Schema::dropIfExists('task_assignees');

        Schema::table('tasks', function (Blueprint $table) {
            $columnsToDrop = [
                'subtasks',
                'is_pinned',
                'is_editable',
                'notes',
                'tags',
                'progress',
                'started_at',
                'completed_at',
                'attachments',
                'comments',
                'assignees'
            ];

            foreach ($columnsToDrop as $column) {
                if (Schema::hasColumn('tasks', $column)) {
                    $table->dropColumn($column);
                }
            }

            // Restore single assigned_to column if missing
            if (!Schema::hasColumn('tasks', 'assigned_to')) {
                $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            }
        });
    }
};
