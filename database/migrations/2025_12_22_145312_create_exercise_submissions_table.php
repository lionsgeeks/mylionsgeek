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
        Schema::create('exercise_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exercice_id')->constrained('exercices')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('submission_link');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure one submission per user per exercise
            $table->unique(['exercice_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercise_submissions');
    }
};
