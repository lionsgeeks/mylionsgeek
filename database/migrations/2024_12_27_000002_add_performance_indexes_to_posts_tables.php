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
        Schema::table('comments', function (Blueprint $table) {
            // Add indexes for better performance
            $table->index(['post_id', 'created_at']);
            $table->index(['user_id']);
        });

        Schema::table('likes', function (Blueprint $table) {
            // Add indexes for better performance
            $table->index(['post_id', 'user_id']);
            $table->index(['post_id', 'created_at']);
        });

        Schema::table('comment_likes', function (Blueprint $table) {
            // Add indexes for better performance
            $table->index(['comment_id', 'user_id']);
            $table->index(['comment_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndex(['post_id', 'created_at']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->dropIndex(['post_id', 'user_id']);
            $table->dropIndex(['post_id', 'created_at']);
        });

        Schema::table('comment_likes', function (Blueprint $table) {
            $table->dropIndex(['comment_id', 'user_id']);
            $table->dropIndex(['comment_id', 'created_at']);
        });
    }
};
