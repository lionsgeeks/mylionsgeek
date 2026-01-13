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
        Schema::table('reservations', function (Blueprint $table) {
            $table->boolean('studio_responsable_approved')->default(false)->after('approved');
            $table->unsignedBigInteger('studio_responsable_approve_id')->nullable()->after('studio_responsable_approved');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['studio_responsable_approved', 'studio_responsable_approve_id']);
        });
    }
};
