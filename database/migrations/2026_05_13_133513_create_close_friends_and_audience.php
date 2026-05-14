<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // user_id  → the person who owns the close-friends list
        // friend_id → the user who is ON that list
        // Asymmetric (Instagram-style): A having B as close friend does NOT
        // imply B has A.
        Schema::create('close_friends', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('friend_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'friend_id']);
            $table->index('friend_id');
        });

        // Stories now have an audience selector. Default 'public' keeps the
        // current behaviour for existing rows.
        Schema::table('stories', function (Blueprint $table) {
            $table->string('audience', 24)->default('public')->after('media_type');
            $table->index('audience');
        });
    }

    public function down(): void
    {
        Schema::table('stories', function (Blueprint $table) {
            $table->dropIndex(['audience']);
            $table->dropColumn('audience');
        });
        Schema::dropIfExists('close_friends');
    }
};
