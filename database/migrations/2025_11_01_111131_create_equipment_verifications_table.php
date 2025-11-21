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
        Schema::create('equipment_verifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reservation_id');
            $table->unsignedBigInteger('equipment_id')->nullable();
            $table->boolean('good_condition')->default(false);
            $table->boolean('bad_condition')->default(false);
            $table->boolean('not_returned')->default(false);
            $table->text('equipment_notes')->nullable(); // Notes specific to this equipment
            $table->timestamps();
            
            $table->index('reservation_id');
            $table->index('equipment_id');
        });
        
        // Also add notes column to reservations table for general verification notes
        if (Schema::hasTable('reservations') && !Schema::hasColumn('reservations', 'verification_notes')) {
            Schema::table('reservations', function (Blueprint $table) {
                $table->text('verification_notes')->nullable()->after('end_signed');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_verifications');
        
        // Remove verification_notes column from reservations if it exists
        if (Schema::hasTable('reservations') && Schema::hasColumn('reservations', 'verification_notes')) {
            Schema::table('reservations', function (Blueprint $table) {
                $table->dropColumn('verification_notes');
            });
        }
    }
};
