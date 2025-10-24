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
        Schema::table('projects', function (Blueprint $table) {
            // Add new columns for project management
            if (!Schema::hasColumn('projects', 'name')) {
                $table->string('name')->default('Untitled Project')->after('id');
            }
            if (!Schema::hasColumn('projects', 'photo')) {
                $table->string('photo')->nullable()->after('name');
            }
            if (!Schema::hasColumn('projects', 'status')) {
                $table->enum('status', ['active', 'completed', 'on_hold', 'cancelled'])->default('active')->after('photo');
            }
            if (!Schema::hasColumn('projects', 'start_date')) {
                $table->date('start_date')->nullable()->after('status');
            }
            if (!Schema::hasColumn('projects', 'end_date')) {
                $table->date('end_date')->nullable()->after('start_date');
            }
            if (!Schema::hasColumn('projects', 'created_by')) {
                $table->unsignedBigInteger('created_by')->default(1)->after('end_date');
            }
            if (!Schema::hasColumn('projects', 'is_updated')) {
                $table->boolean('is_updated')->default(false)->after('created_by');
            }
            if (!Schema::hasColumn('projects', 'last_activity')) {
                $table->timestamp('last_activity')->nullable()->after('is_updated');
            }
        });
        
        // Add foreign key constraint if it doesn't exist
        try {
            Schema::table('projects', function (Blueprint $table) {
                $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            });
        } catch (Exception $e) {
            // Foreign key might already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'name', 'description', 'photo', 'status', 'start_date', 
                'end_date', 'created_by', 'is_updated', 'last_activity'
            ]);
            
            $table->integer('user_id');
            $table->string('description');
            $table->string('project');
        });
    }
};
