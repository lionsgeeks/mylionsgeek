<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('role_has_permissions')) {
            Schema::create('role_has_permissions', function (Blueprint $table) {
			$table->integer('permission_id');
			$table->integer('role_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('role_has_permissions');
    }
};