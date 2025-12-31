<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Handle exercices table
        Schema::table('exercices', function (Blueprint $table) {
            // First add the new course_id column
            if (!Schema::hasColumn('exercices', 'course_id')) {
                $table->foreignId('course_id')->nullable()->after('training_id');
            }
        });

        // Copy data from model_id to course_id if model_id exists
        if (Schema::hasColumn('exercices', 'model_id')) {
            DB::statement('UPDATE exercices SET course_id = model_id WHERE model_id IS NOT NULL');
            
            // Drop the old foreign key and column
            Schema::table('exercices', function (Blueprint $table) {
                try {
                    $table->dropForeign(['model_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist
                }
                $table->dropColumn('model_id');
            });
        }

        // Add the foreign key constraint for course_id
        Schema::table('exercices', function (Blueprint $table) {
            $table->foreign('course_id')->nullable()->references('id')->on('courses')->onDelete('set null');
        });

        // Handle badges table
        Schema::table('badges', function (Blueprint $table) {
            // First add the new course_id column
            if (!Schema::hasColumn('badges', 'course_id')) {
                $table->foreignId('course_id')->nullable()->after('user_id');
            }
        });

        // Copy data from model_id to course_id if model_id exists
        if (Schema::hasColumn('badges', 'model_id')) {
            DB::statement('UPDATE badges SET course_id = model_id WHERE model_id IS NOT NULL');
            
            // Drop the old foreign key, unique constraint, and column
            Schema::table('badges', function (Blueprint $table) {
                try {
                    $table->dropForeign(['model_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist
                }
                try {
                    $table->dropUnique(['user_id', 'model_id']);
                } catch (\Exception $e) {
                    // Unique constraint might not exist
                }
                $table->dropColumn('model_id');
            });
        }

        // Add the foreign key constraint and unique constraint for course_id
        Schema::table('badges', function (Blueprint $table) {
            $table->foreign('course_id')->nullable()->references('id')->on('courses')->onDelete('cascade');
            $table->unique(['user_id', 'course_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse exercices table changes
        Schema::table('exercices', function (Blueprint $table) {
            if (!Schema::hasColumn('exercices', 'model_id')) {
                $table->foreignId('model_id')->nullable()->after('training_id');
            }
        });

        // Copy data back
        if (Schema::hasColumn('exercices', 'course_id')) {
            DB::statement('UPDATE exercices SET model_id = course_id WHERE course_id IS NOT NULL');
            
            Schema::table('exercices', function (Blueprint $table) {
                $table->dropForeign(['course_id']);
                $table->dropColumn('course_id');
            });
        }

        Schema::table('exercices', function (Blueprint $table) {
            $table->foreign('model_id')->nullable()->references('id')->on('models')->onDelete('set null');
        });

        // Reverse badges table changes
        Schema::table('badges', function (Blueprint $table) {
            if (!Schema::hasColumn('badges', 'model_id')) {
                $table->foreignId('model_id')->nullable()->after('user_id');
            }
        });

        // Copy data back
        if (Schema::hasColumn('badges', 'course_id')) {
            DB::statement('UPDATE badges SET model_id = course_id WHERE course_id IS NOT NULL');
            
            Schema::table('badges', function (Blueprint $table) {
                $table->dropForeign(['course_id']);
                $table->dropUnique(['user_id', 'course_id']);
                $table->dropColumn('course_id');
            });
        }

        Schema::table('badges', function (Blueprint $table) {
            $table->foreign('model_id')->nullable()->references('id')->on('models')->onDelete('cascade');
            $table->unique(['user_id', 'model_id']);
        });
    }
};
