<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_projects', function (Blueprint $table) {
            if (Schema::hasColumn('student_projects', 'title')) {
                $table->string('title')->nullable()->change();
            } else {
                $table->string('title')->nullable();
            }
            
            if (Schema::hasColumn('student_projects', 'description')) {
                $table->text('description')->nullable()->change();
            } else {
                $table->text('description')->nullable();
            }
            
            if (Schema::hasColumn('student_projects', 'image')) {
                $table->string('image')->nullable()->change();
            } else {
                $table->string('image')->nullable();
            }
            
            if (Schema::hasColumn('student_projects', 'project')) {
                $table->string('project')->nullable()->change();
            } else {
                $table->string('project')->nullable();
            }

            if (Schema::hasColumn('student_projects', 'url')) {
                $table->renameColumn('url', 'project');
            }

            if (!Schema::hasColumn('student_projects', 'status')) {
                $table->enum('status', ['pending', 'approved', 'rejected'])
                    ->default('pending')
                    ->after('project');
            }

            if (!Schema::hasColumn('student_projects', 'approved_by')) {
                $table->uuid('approved_by')->nullable()->after('status');
                $table->foreign('approved_by')
                    ->references('id')
                    ->on('users')
                    ->onDelete('set null');
            }

            if (!Schema::hasColumn('student_projects', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }

            if (!Schema::hasColumn('student_projects', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('approved_at');
            }

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('student_projects', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'title',
                'image',
                'project',
                'status',
                'approved_by',
                'approved_at',
                'rejection_reason'
            ]);
        });
    }
};
