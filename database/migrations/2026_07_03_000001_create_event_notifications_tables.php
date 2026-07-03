<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lionsgeek_event_id')->unique();
            $table->string('title');
            $table->text('message');
            $table->timestamps();
        });

        Schema::create('event_notification_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_notification_id')->constrained()->cascadeOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'event_notification_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_notification_reads');
        Schema::dropIfExists('event_notifications');
    }
};
