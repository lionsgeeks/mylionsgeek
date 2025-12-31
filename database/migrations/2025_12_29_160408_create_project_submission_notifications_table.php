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
        Schema::create('project_submission_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('student_projects')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade'); // Student who submitted
            $table->foreignId('notified_user_id')->constrained('users')->onDelete('cascade'); // Admin or Coach who should receive notification
            $table->string('message_notification');
            $table->string('path')->nullable(); // Link to view the project
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('notified_user_id');
            $table->index('student_id');
            $table->index('project_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_submission_notifications');
    }
};
