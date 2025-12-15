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
        $isSqlite = DB::getDriverName() === 'sqlite';

        if ($isSqlite) {
            // SQLite doesn't support adding foreign keys to existing tables
            // We need to recreate the table with the foreign key constraint
            
            DB::statement('PRAGMA foreign_keys = OFF;');

            // Get all data from tasks table
            $tasks = DB::table('tasks')->get()->toArray();

            // Get the table structure to preserve all columns
            $columns = DB::select("PRAGMA table_info(tasks)");
            
            // Drop the old table
            Schema::dropIfExists('tasks');

            // Recreate tasks table with proper foreign key
            Schema::create('tasks', function (Blueprint $table) use ($columns) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
                $table->enum('status', ['todo', 'in_progress', 'review', 'completed'])->default('todo');
                $table->foreignId('project_id')->constrained()->onDelete('cascade');
                // Use foreignId for assigned_to with proper foreign key constraint
                $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
                $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
                $table->date('due_date')->nullable();
                $table->integer('sort_order')->default(0);
                $table->json('subtasks')->nullable();
                $table->boolean('is_pinned')->default(false);
                $table->boolean('is_editable')->default(true);
                $table->json('tags')->nullable();
                $table->integer('progress')->default(0);
                $table->timestamp('started_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->json('attachments')->nullable();
                $table->json('comments')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });

            // Restore data with preserved IDs
            foreach ($tasks as $task) {
                $taskArray = (array) $task;
                // Insert with explicit ID to preserve original IDs
                DB::table('tasks')->insert($taskArray);
            }
            
            // Reset the sequence to continue from the highest ID
            $maxId = DB::table('tasks')->max('id');
            if ($maxId) {
                DB::statement("UPDATE sqlite_sequence SET seq = {$maxId} WHERE name = 'tasks'");
            }

            DB::statement('PRAGMA foreign_keys = ON;');
        } else {
            // For MySQL/PostgreSQL, add the foreign key constraint
            Schema::table('tasks', function (Blueprint $table) {
                // Drop the existing column and recreate with foreign key
                $table->dropColumn('assigned_to');
            });
            
        Schema::table('tasks', function (Blueprint $table) {
                $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null')->after('project_id');
        });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $isSqlite = DB::getDriverName() === 'sqlite';

        if ($isSqlite) {
            // For SQLite rollback, we'd need to recreate without foreign key
            // This is complex - you may need to manually handle this
            DB::statement('PRAGMA foreign_keys = OFF;');
            
            $tasks = DB::table('tasks')->get()->toArray();
            Schema::dropIfExists('tasks');
            
            Schema::create('tasks', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
                $table->enum('status', ['todo', 'in_progress', 'review', 'completed'])->default('todo');
                $table->foreignId('project_id')->constrained()->onDelete('cascade');
                $table->unsignedBigInteger('assigned_to')->nullable()->after('project_id');
                $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
                $table->date('due_date')->nullable();
                $table->integer('sort_order')->default(0);
                $table->json('subtasks')->nullable();
                $table->boolean('is_pinned')->default(false);
                $table->boolean('is_editable')->default(true);
                $table->json('tags')->nullable();
                $table->integer('progress')->default(0);
                $table->timestamp('started_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->json('attachments')->nullable();
                $table->json('comments')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
            
            foreach ($tasks as $task) {
                $taskArray = (array) $task;
                DB::table('tasks')->insert($taskArray);
            }
            
            $maxId = DB::table('tasks')->max('id');
            if ($maxId) {
                DB::statement("UPDATE sqlite_sequence SET seq = {$maxId} WHERE name = 'tasks'");
            }
            
            DB::statement('PRAGMA foreign_keys = ON;');
        } else {
            Schema::table('tasks', function (Blueprint $table) {
                $table->dropForeign(['assigned_to']);
                $table->dropColumn('assigned_to');
            });
            
        Schema::table('tasks', function (Blueprint $table) {
                $table->unsignedBigInteger('assigned_to')->nullable()->after('project_id');
        });
        }
    }
};
