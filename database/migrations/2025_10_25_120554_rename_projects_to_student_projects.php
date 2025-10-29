<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Rename the existing projects table to student_projects
        if (Schema::hasTable('projects')) {
            Schema::rename('projects', 'student_projects');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename back to projects
        if (Schema::hasTable('student_projects')) {
            Schema::rename('student_projects', 'projects');
        }
    }
};
