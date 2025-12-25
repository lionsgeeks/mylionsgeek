<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discipline_notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('message_notification')->nullable();
            $table->decimal('discipline_change', 5, 2)->nullable(); // Store the discipline value at threshold (e.g., 95.22)
            $table->string('path')->nullable();
            $table->string('type')->nullable(); // 'increase' or 'decrease'
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discipline_notifications');
    }
};

