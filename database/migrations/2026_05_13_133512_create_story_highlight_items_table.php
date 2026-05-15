<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('story_highlight_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('highlight_id')->constrained('story_highlights')->cascadeOnDelete();
            $table->foreignId('story_id')->constrained('stories')->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->unique(['highlight_id', 'story_id']);
            $table->index(['highlight_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('story_highlight_items');
    }
};
