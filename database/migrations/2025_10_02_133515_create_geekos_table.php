<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geekos', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('formation_id'); // Link to training/formation
            $table->unsignedBigInteger('created_by'); // Admin/coach who created it
            $table->string('cover_image')->nullable();
            $table->integer('time_limit')->default(20); // seconds per question
            $table->boolean('show_correct_answers')->default(true);
            $table->enum('status', ['draft', 'ready', 'published'])->default('draft');
            $table->json('settings')->nullable(); // Additional settings as JSON
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geekos');
    }
};