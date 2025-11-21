<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop reservation_places if exists
        if (Schema::hasTable('reservation_places')) {
            Schema::drop('reservation_places');
        }
        // Drop places if exists
        if (Schema::hasTable('places')) {
            Schema::drop('places');
        }

        // Add image columns to studios and meeting_rooms if missing
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
        // Down intentionally left minimal: cannot recreate dropped tables without full schema
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







