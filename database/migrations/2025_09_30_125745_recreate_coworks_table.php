<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('coworks')) {
            Schema::create('coworks', function (Blueprint $table) {
                $table->id();
                $table->string('image');
                $table->integer('table');
                $table->integer('state');
                $table->string('created_at')->nullable()->default('NULL');
                $table->string('updated_at')->nullable()->default('NULL');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('coworks');
    }
};
