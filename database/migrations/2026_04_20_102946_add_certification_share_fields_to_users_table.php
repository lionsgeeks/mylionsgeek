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
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('certified_at')->nullable()->after('status');
            $table->unsignedBigInteger('certified_training_id')->nullable()->after('certified_at');

            // LinkedIn share prompt lifecycle
            $table->timestamp('linkedin_share_prompted_at')->nullable()->after('certified_training_id');
            $table->timestamp('linkedin_share_dismissed_at')->nullable()->after('linkedin_share_prompted_at');
            $table->timestamp('linkedin_shared_at')->nullable()->after('linkedin_share_dismissed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'certified_at',
                'certified_training_id',
                'linkedin_share_prompted_at',
                'linkedin_share_dismissed_at',
                'linkedin_shared_at',
            ]);
        });
    }
};
