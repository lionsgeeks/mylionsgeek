<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('trainings')) {
            Schema::create('trainings', function (Blueprint $table) {
			$table->id();
			$table->string('name');
			$table->string('category');
			$table->date('starting_day');
			$table->string('promo')->nullable();
			$table->string('coach_id');
			$table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('trainings');
    }
};