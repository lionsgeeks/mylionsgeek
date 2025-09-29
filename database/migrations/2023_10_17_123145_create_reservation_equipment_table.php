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
        Schema::create('reservation_equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId("reservation_id")->constrained();
            $table->foreignId("equipment_id")->constrained();
            $table->date("day");
            $table->time("start");
            $table->time("end");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservation_equipment');
    }
};
