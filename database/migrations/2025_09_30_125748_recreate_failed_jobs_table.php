<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('failed_jobs')) {
            Schema::create('failed_jobs', function (Blueprint $table) {
			$table->id();
			$table->string('uuid');
			$table->string('connection');
			$table->string('queue');
			$table->string('payload');
			$table->string('exception');
			$table->string('failed_at')->default('CURRENT_TIMESTAMP');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('failed_jobs');
    }
};