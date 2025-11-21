<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'about')) {
            Schema::table('users', function (Blueprint $table) {
                $table->text('about')->nullable()->after('cover');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'about')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('about');
            });
        }
    }
};
