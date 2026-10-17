<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('training_sessions') && ! Schema::hasColumn('training_sessions', 'external_coach_name')) {
            Schema::table('training_sessions', function (Blueprint $table) {
                $table->string('external_coach_name')->nullable()->after('title');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('training_sessions') && Schema::hasColumn('training_sessions', 'external_coach_name')) {
            Schema::table('training_sessions', function (Blueprint $table) {
                $table->dropColumn('external_coach_name');
            });
        }
    }
};
