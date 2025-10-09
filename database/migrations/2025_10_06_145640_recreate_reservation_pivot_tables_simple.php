<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop old tables if they exist
        Schema::dropIfExists('reservation_teams');
        Schema::dropIfExists('reservation_equipment');
        
        // Create reservation_teams (simple, no foreign keys)
        Schema::create('reservation_teams', function (Blueprint $table) {
            $table->id();
            $table->integer('reservation_id');
            $table->integer('user_id');
            $table->timestamps();
        });
        
        // Create reservation_equipment (simple, no foreign keys)
        Schema::create('reservation_equipment', function (Blueprint $table) {
            $table->id();
            $table->integer('reservation_id');
            $table->integer('equipment_id');
            $table->string('day');
            $table->string('start');
            $table->string('end');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_teams');
        Schema::dropIfExists('reservation_equipment');
    }
};
