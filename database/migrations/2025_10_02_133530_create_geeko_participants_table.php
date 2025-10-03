<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geeko_participants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('session_id');
            $table->unsignedBigInteger('user_id'); // Student participant
            $table->string('nickname')->nullable(); // Display name during game
            $table->integer('total_score')->default(0);
            $table->integer('correct_answers')->default(0);
            $table->integer('wrong_answers')->default(0);
            $table->timestamp('joined_at');
            $table->timestamp('last_activity')->nullable();
            $table->json('question_scores')->nullable(); // Score per question as JSON
            $table->timestamps();
            
            $table->unique(['session_id', 'user_id']); // Prevent duplicate participants
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geeko_participants');
    }
};