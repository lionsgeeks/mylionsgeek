<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geeko_questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('geeko_id');
            $table->text('question');
            $table->string('question_image')->nullable();
            $table->enum('type', ['multiple_choice', 'true_false', 'type_answer'])->default('multiple_choice');
            $table->json('options'); // Store answer options as JSON
            $table->json('correct_answers'); // Store correct answer(s) as JSON
            $table->integer('points')->default(1000);
            $table->integer('time_limit')->nullable(); // Override global time limit if needed
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geeko_questions');
    }
};
