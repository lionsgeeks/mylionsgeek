<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('enterprise_name')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('sector', 120)->nullable();
            $table->string('location')->nullable();
            $table->string('linkedin_url', 500)->nullable();
            $table->string('phone', 30)->nullable();
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('onboarding_completed_at')->nullable();
            $table->unsignedTinyInteger('account_state')->default(0);
            $table->timestamps();

            $table->index('onboarding_completed_at');
            $table->index('account_state');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
