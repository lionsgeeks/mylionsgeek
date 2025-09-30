<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('studios') && !Schema::hasColumn('studios', 'image')) {
            Schema::table('studios', function (Blueprint $table) {
                $table->string('image')->nullable()->after('state');
            });
        }

        if (Schema::hasTable('meeting_rooms') && !Schema::hasColumn('meeting_rooms', 'image')) {
            Schema::table('meeting_rooms', function (Blueprint $table) {
                $table->string('image')->nullable()->after('state');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('studios') && Schema::hasColumn('studios', 'image')) {
            Schema::table('studios', function (Blueprint $table) {
                $table->dropColumn('image');
            });
        }

        if (Schema::hasTable('meeting_rooms') && Schema::hasColumn('meeting_rooms', 'image')) {
            Schema::table('meeting_rooms', function (Blueprint $table) {
                $table->dropColumn('image');
            });
        }
    }
};


