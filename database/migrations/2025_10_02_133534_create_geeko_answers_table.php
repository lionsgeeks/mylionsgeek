<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geeko_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('session_id');
            $table->unsignedBigInteger('question_id');
            $table->unsignedBigInteger('user_id'); // Student who answered
            $table->json('selected_answer'); // The answer(s) selected by student
            $table->boolean('is_correct')->default(false);
            $table->integer('points_earned')->default(0);
            $table->integer('time_taken')->nullable(); // Time in seconds to answer
            $table->timestamp('answered_at');
            $table->timestamps();
            
            $table->unique(['session_id', 'question_id', 'user_id']); // One answer per user per question
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geeko_answers');
    }
};