<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('test')) {
            Schema::create('test', function (Blueprint $table) {
                $table->string('test1')->nullable()->default('NULL');
                $table->string('test2')->default('studying');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('test');
    }
};
