<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users') && ! Schema::hasColumn('users', 'invite_source')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('invite_source')->nullable()->after('activation_token');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'invite_source')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('invite_source');
            });
        }
    }
};
