<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_repository_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->default('github');
            $table->string('event_type');
            $table->string('action')->nullable();
            $table->string('actor_name')->nullable();
            $table->string('actor_avatar')->nullable();
            $table->string('repository_name')->nullable();
            $table->string('repository_url')->nullable();
            $table->string('branch')->nullable();
            $table->string('commit_sha')->nullable();
            $table->string('title')->nullable();
            $table->string('url')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'event_type']);
            $table->index('occurred_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_repository_events');
    }
};
