<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geeko_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('geeko_id');
            $table->string('session_code', 8)->unique(); // 8-character game PIN
            $table->unsignedBigInteger('started_by'); // Admin who started the session
            $table->enum('status', ['waiting', 'in_progress', 'completed', 'cancelled'])->default('waiting');
            $table->integer('current_question_index')->default(0);
            $table->timestamp('current_question_started_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->json('settings')->nullable(); // Session-specific settings
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geeko_sessions');
    }
};
