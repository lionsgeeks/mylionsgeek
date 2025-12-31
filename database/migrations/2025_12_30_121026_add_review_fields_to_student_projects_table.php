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
            if (!Schema::hasColumn('student_projects', 'review_ratings')) {
                $table->json('review_ratings')->nullable()->after('rejection_reason');
            }
            if (!Schema::hasColumn('student_projects', 'review_notes')) {
                $table->text('review_notes')->nullable()->after('review_ratings');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_projects', function (Blueprint $table) {
            if (Schema::hasColumn('student_projects', 'review_ratings')) {
                $table->dropColumn('review_ratings');
            }
            if (Schema::hasColumn('student_projects', 'review_notes')) {
                $table->dropColumn('review_notes');
            }
        });
    }
};
