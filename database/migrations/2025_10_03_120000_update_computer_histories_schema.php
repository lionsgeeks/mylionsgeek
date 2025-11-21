<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('computer_histories')) {
            Schema::create('computer_histories', function (Blueprint $table) {
                $table->id();
                $table->uuid('computer_id');
                $table->foreign('computer_id')->references('id')->on('computers')->cascadeOnDelete();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
                $table->timestamp('start');
                $table->timestamp('end')->nullable();
                $table->timestamps();
                $table->index(['computer_id', 'start']);
            });
            return;
        }

        Schema::table('computer_histories', function (Blueprint $table) {
            if (Schema::hasColumn('computer_histories', 'computer_id')) {
                $table->uuid('computer_id')->change();
            } else {
                $table->uuid('computer_id')->after('id');
            }

            if (Schema::hasColumn('computer_histories', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->change();
            } else {
                $table->unsignedBigInteger('user_id')->nullable()->after('computer_id');
            }

            if (Schema::hasColumn('computer_histories', 'start')) {
                $table->timestamp('start')->change();
            } else {
                $table->timestamp('start')->after('user_id');
            }

            if (Schema::hasColumn('computer_histories', 'end')) {
                $table->timestamp('end')->nullable()->change();
            } else {
                $table->timestamp('end')->nullable()->after('start');
            }

            if (Schema::hasColumn('computer_histories', 'created_at') && Schema::hasColumn('computer_histories', 'updated_at')) {
                $table->dropColumn(['created_at', 'updated_at']);
            }

            $table->timestamps();
        });

        Schema::table('computer_histories', function (Blueprint $table) {
            // Add foreign keys after column type changes to avoid issues
            $table->foreign('computer_id')->references('id')->on('computers')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->index(['computer_id', 'start']);
        });
    }

    public function down(): void
    {
        Schema::table('computer_histories', function (Blueprint $table) {
            $table->dropForeign(['computer_id']);
            $table->dropForeign(['user_id']);
            $table->dropIndex(['computer_id', 'start']);
        });
        
    }
};


