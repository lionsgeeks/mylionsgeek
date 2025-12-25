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
        Schema::table('badges', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');
            $table->foreignId('model_id')->nullable()->after('user_id')->constrained('models')->onDelete('cascade');
            $table->integer('exp')->default(0)->after('model_id');
            
            // Ensure one record per user per model
            $table->unique(['user_id', 'model_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'model_id']);
            $table->dropForeign(['user_id']);
            $table->dropForeign(['model_id']);
            $table->dropColumn(['user_id', 'model_id', 'exp']);
        });
    }
};
