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
        Schema::create('task_assignment_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('assigned_to_user_id')->constrained('users')->onDelete('cascade'); // User who is assigned the task (receives notification)
            $table->foreignId('assigned_by_user_id')->constrained('users')->onDelete('cascade'); // User who assigned the task (sender)
            $table->string('message_notification');
            $table->string('path')->nullable(); // Link to view the task
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('assigned_to_user_id');
            $table->index('assigned_by_user_id');
            $table->index('task_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_assignment_notifications');
    }
};
