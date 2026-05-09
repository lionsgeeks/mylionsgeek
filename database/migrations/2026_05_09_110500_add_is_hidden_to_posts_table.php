<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'is_hidden')) {
                // 0 = visible, 1 = hidden (after report accepted)
                $table->boolean('is_hidden')->default(false)->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (Schema::hasColumn('posts', 'is_hidden')) {
                $table->dropIndex(['is_hidden']);
                $table->dropColumn('is_hidden');
            }
        });
    }
};

