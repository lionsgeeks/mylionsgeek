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
        Schema::create('project_message_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('message_id')->constrained('project_messages')->onDelete('cascade');
            $table->foreignId('notified_user_id')->constrained('users')->onDelete('cascade'); // User who receives the notification
            $table->foreignId('sender_user_id')->constrained('users')->onDelete('cascade'); // User who sent the message
            $table->string('message_notification');
            $table->string('path')->nullable(); // Link to view the message/project
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('notified_user_id');
            $table->index('sender_user_id');
            $table->index('project_id');
            $table->index('message_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_message_notifications');
    }
};
