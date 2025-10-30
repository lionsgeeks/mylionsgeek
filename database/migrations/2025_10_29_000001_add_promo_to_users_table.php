<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users') && ! Schema::hasColumn('users', 'promo')) {
            Schema::table('users', function (Blueprint $table) {
                $table->integer('promo')->nullable()->after('formation_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'promo')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('promo');
            });
        }
    }
};
