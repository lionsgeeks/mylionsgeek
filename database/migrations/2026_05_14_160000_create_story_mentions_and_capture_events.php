<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('story_mentions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained('stories')->cascadeOnDelete();
            $table->foreignId('mentioned_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['story_id', 'mentioned_user_id']);
        });

        Schema::create('story_capture_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained('stories')->cascadeOnDelete();
            $table->foreignId('viewer_id')->constrained('users')->cascadeOnDelete();
            $table->string('kind', 32);
            $table->timestamps();
            $table->index(['story_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('story_capture_events');
        Schema::dropIfExists('story_mentions');
    }
};
