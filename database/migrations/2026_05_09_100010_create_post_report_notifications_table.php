<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('post_report_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notified_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('post_report_id')->constrained('post_reports')->cascadeOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['notified_user_id', 'read_at']);
            $table->index(['post_report_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_report_notifications');
    }
};

