<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('appointments')) {
            Schema::create('appointments', function (Blueprint $table) {
                $table->id();
                $table->integer('user_id'); // Requester
                $table->string('person_name'); // Mahdi Bouziane, Hamid Boumehraz, or Amina Khabab
                $table->string('person_email'); // Email of the person
                $table->string('day'); // Date
                $table->string('start'); // Start time
                $table->string('end'); // End time
                $table->string('status')->default('pending'); // pending, approved, canceled, suggested
                $table->string('suggested_day')->nullable(); // If time was suggested
                $table->string('suggested_start')->nullable();
                $table->string('suggested_end')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};

