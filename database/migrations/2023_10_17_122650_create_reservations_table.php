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
            $table->string("title");
            $table->longText("description");
            $table->date("day");
            $table->time("start");
            $table->time("end");
            $table->boolean("canceled")->default(false);
            $table->boolean("passed")->default(false);
            $table->boolean("approved")->default(false);
            $table->foreignId("user_id")->constrained();
            $table->foreignId("studio_id")->nullable()->constrained()->default(null);
            $table->boolean("start_signed")->default(false);
            $table->boolean("end_signed")->default(false);
            $table->string("type");
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
