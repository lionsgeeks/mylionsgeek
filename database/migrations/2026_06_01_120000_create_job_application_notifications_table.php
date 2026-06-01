<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_application_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notified_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('job_application_id')->constrained('job_applications')->cascadeOnDelete();
            $table->foreignId('applicant_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['notified_user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_application_notifications');
    }
};
