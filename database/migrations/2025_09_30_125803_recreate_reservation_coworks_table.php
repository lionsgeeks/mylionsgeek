<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('reservation_coworks')) {
            Schema::create('reservation_coworks', function (Blueprint $table) {
			$table->id();
			$table->integer('table');
			$table->string('day');
			$table->string('start');
			$table->string('end');
			$table->integer('canceled')->default('0');
			$table->integer('passed')->default('0');
			$table->integer('approved')->default('0');
			$table->integer('user_id');
			$table->string('created_at')->nullable()->default('NULL');
			$table->string('updated_at')->nullable()->default('NULL');
			$table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_coworks');
    }
};