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
        Schema::create('project_message_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('project_messages')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('reaction'); // e.g., '👍', '❤️', '😂', '😮', '😢', '🙏'
            $table->timestamps();
            
            // Prevent duplicate reactions from same user on same message
            $table->unique(['message_id', 'user_id', 'reaction']);
            $table->index(['message_id', 'reaction']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_message_reactions');
    }
};
