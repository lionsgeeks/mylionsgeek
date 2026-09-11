<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reported_user_id')->constrained('users')->cascadeOnDelete();
            $table->text('reason')->nullable();
            $table->string('status', 20)->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['reporter_id', 'reported_user_id']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('user_report_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notified_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_report_id')->constrained('user_reports')->cascadeOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['notified_user_id', 'read_at']);
            $table->index(['user_report_id']);
        });

        Schema::create('user_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blocker_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('blocked_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['blocker_id', 'blocked_id']);
            $table->index(['blocker_id']);
            $table->index(['blocked_id']);
        });

        Schema::create('user_block_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notified_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_block_id')->constrained('user_blocks')->cascadeOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['notified_user_id', 'read_at']);
            $table->index(['user_block_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_block_notifications');
        Schema::dropIfExists('user_blocks');
        Schema::dropIfExists('user_report_notifications');
        Schema::dropIfExists('user_reports');
    }
};
