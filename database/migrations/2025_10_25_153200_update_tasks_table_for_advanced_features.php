<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Add new columns for advanced features
            $table->json('subtasks')->nullable(); // Store subtasks as JSON
            $table->boolean('is_pinned')->default(false); // Pin functionality
            $table->boolean('is_editable')->default(true); // Edit permissions
            $table->text('notes')->nullable(); // Task notes
            $table->json('tags')->nullable(); // Task tags
            $table->integer('progress')->default(0); // Task progress percentage
            $table->timestamp('started_at')->nullable(); // When task was started
            $table->timestamp('completed_at')->nullable(); // When task was completed
            $table->json('attachments')->nullable(); // File attachments as JSON
            $table->json('comments')->nullable(); // Comments as JSON
            $table->json('assignees')->nullable(); // Multiple assignees as JSON array of user IDs
            
            // Remove single assignee constraint since we'll use JSON
            $table->dropForeign(['assigned_to']);
            $table->dropColumn('assigned_to');
        });

        // Create task_assignees pivot table for better relationship management
        Schema::create('task_assignees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
            
            $table->unique(['task_id', 'user_id']);
        });

        // Create task_comments table for better comment management
        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->json('mentions')->nullable(); // JSON array of mentioned user IDs
            $table->json('attachments')->nullable(); // JSON array of attachment IDs
            $table->timestamps();
        });

        // Create task_attachments table for file management
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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_attachments');
        Schema::dropIfExists('task_comments');
        Schema::dropIfExists('task_assignees');
        
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'subtasks', 'is_pinned', 'is_editable', 'notes', 'tags', 
                'progress', 'started_at', 'completed_at', 'attachments', 
                'comments', 'assignees'
            ]);
            
            // Restore single assignee
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
        });
    }
};