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
        Schema::create('computers', function (Blueprint $table) {
            $table->id();
            $table->string("reference");
            $table->string("cpu")->nullable();
            $table->string("gpu");
            $table->boolean("state");
            $table->bigInteger("user_id")->default(0);
            $table->date("start")->nullable();
            $table->date("end")->nullable();
            $table->string("mark");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('computers');
    }
};
