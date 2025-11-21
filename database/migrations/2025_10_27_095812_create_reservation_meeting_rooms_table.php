<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservation_meeting_rooms', function (Blueprint $table) {
            $table->id();
            $table->integer('meeting_room_id');
            $table->string('day');
            $table->string('start');
            $table->string('end');
            $table->integer('canceled')->default(0);
            $table->integer('passed')->default(0);
            $table->integer('approved')->default(0);
            $table->integer('user_id');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_meeting_rooms');
    }
};
