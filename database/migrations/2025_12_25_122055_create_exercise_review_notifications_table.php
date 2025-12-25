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
        Schema::create('exercise_review_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('exercise_submissions')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Student who requested review
            $table->foreignId('coach_id')->constrained('users')->onDelete('cascade'); // Coach who should receive notification
            $table->foreignId('exercice_id')->constrained('exercices')->onDelete('cascade');
            $table->string('message_notification');
            $table->string('path')->nullable(); // Link to view the submission
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('coach_id');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercise_review_notifications');
    }
};
