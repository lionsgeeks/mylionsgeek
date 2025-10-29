<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('studios')) {
            Schema::create('studios', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->integer('state');
                $table->string('created_at')->nullable()->default('NULL');
                $table->string('updated_at')->nullable()->default('NULL');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('studios');
    }
};
