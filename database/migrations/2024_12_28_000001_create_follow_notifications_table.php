<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('follow_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User being followed
            $table->foreignId('follower_id')->constrained('users')->onDelete('cascade'); // User who followed
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index(['user_id', 'created_at']);
            $table->index(['follower_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('follow_notifications');
    }
};
