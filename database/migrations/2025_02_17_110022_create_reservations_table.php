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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('date');
            $table->string('start');
            $table->string('end');
            $table->boolean('canceled')->default(0);
            $table->boolean('passed')->default(0);
            $table->boolean('approved')->default(0);
            $table->foreignId('user_id')->constrained();
            $table->boolean('start_signed')->default(0);
            $table->boolean('end_signed')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
