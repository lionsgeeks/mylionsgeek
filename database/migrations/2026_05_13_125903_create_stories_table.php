<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('media_path');                      // relative path under storage/app/public
            $table->enum('media_type', ['image', 'video']);
            $table->unsignedInteger('duration_ms')->default(5000); // image default 5s; video uses real length
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->timestamp('expires_at')->index();
            $table->timestamps();

            $table->index(['user_id', 'expires_at']);
            $table->index(['expires_at', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stories');
    }
};
