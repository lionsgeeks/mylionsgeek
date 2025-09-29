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
            $table->string('reference');
            $table->string('cpu');
            $table->string('gpu');
            $table->enum('state', ['working', 'not_working', 'damaged']);
            $table->unsignedBigInteger('user_id')->nullable();
            $table->date('start');
            $table->date('end')->nullable();
            $table->string('mark')->nullable();
            $table->timestamps();
            $table->uuid('uuid')->nullable(false)->change();
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
