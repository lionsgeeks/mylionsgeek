<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('projects')) {
            Schema::create('projects', function (Blueprint $table) {
			$table->id();
			$table->integer('user_id');
			$table->string('description');
			$table->string('project');
			$table->string('created_at')->nullable()->default('NULL');
			$table->string('updated_at')->nullable()->default('NULL');
			$table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};