<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('model_has_permissions')) {
            Schema::create('model_has_permissions', function (Blueprint $table) {
                $table->integer('permission_id');
                $table->string('model_type');
                $table->integer('model_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('model_has_permissions');
    }
};
