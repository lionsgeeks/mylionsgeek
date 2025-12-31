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
        Schema::table('student_projects', function (Blueprint $table) {
            if (!Schema::hasColumn('student_projects', 'model_id')) {
                $table->unsignedBigInteger('model_id')->nullable()->after('user_id');
                $table->foreign('model_id')
                    ->references('id')
                    ->on('models')
                    ->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_projects', function (Blueprint $table) {
            if (Schema::hasColumn('student_projects', 'model_id')) {
                $table->dropForeign(['model_id']);
                $table->dropColumn('model_id');
            }
        });
    }
};
