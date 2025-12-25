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
        Schema::table('exercices', function (Blueprint $table) {
            if (!Schema::hasColumn('exercices', 'title')) {
                $table->string('title')->after('id');
            }
            if (!Schema::hasColumn('exercices', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
            if (!Schema::hasColumn('exercices', 'file')) {
                $table->string('file')->nullable()->after('description');
            }
            if (!Schema::hasColumn('exercices', 'file_type')) {
                $table->string('file_type')->nullable()->after('file');
            }
            if (!Schema::hasColumn('exercices', 'training_id')) {
                $table->foreignId('training_id')->after('file_type')->constrained('formations')->onDelete('cascade');
            }
            if (!Schema::hasColumn('exercices', 'model_id')) {
                $table->foreignId('model_id')->nullable()->after('training_id')->constrained('models')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exercices', function (Blueprint $table) {
            if (Schema::hasColumn('exercices', 'model_id')) {
                $table->dropForeign(['model_id']);
                $table->dropColumn('model_id');
            }
            if (Schema::hasColumn('exercices', 'training_id')) {
                $table->dropForeign(['training_id']);
                $table->dropColumn('training_id');
            }
            if (Schema::hasColumn('exercices', 'file_type')) {
                $table->dropColumn('file_type');
            }
            if (Schema::hasColumn('exercices', 'file')) {
                $table->dropColumn('file');
            }
            if (Schema::hasColumn('exercices', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('exercices', 'title')) {
                $table->dropColumn('title');
            }
        });
    }
};
