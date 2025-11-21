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
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('room_id')->unique(); // Unique room identifier (e.g., ttt-abc123)
            $table->string('game_type'); // tictactoe, rockpaperscissors, etc.
            $table->json('game_state'); // Full game state (board, scores, etc.)
            $table->timestamp('last_activity')->useCurrent(); // Track last move/update
            $table->timestamps();
            
            $table->index('room_id');
            $table->index('last_activity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};
