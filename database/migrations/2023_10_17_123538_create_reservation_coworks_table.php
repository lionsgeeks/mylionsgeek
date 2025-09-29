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
        Schema::create('reservation_coworks', function (Blueprint $table) {
            $table->id();
            $table->integer("table");
            $table->date("day");
            $table->time("start");
            $table->time("end");
            $table->boolean("canceled")->default(false);
            $table->boolean("passed")->default(false);
            $table->boolean("approved")->default(false);
            $table->foreignId("user_id")->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservation_coworks');
    }
};
