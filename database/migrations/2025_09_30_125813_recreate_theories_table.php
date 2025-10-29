<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('theories')) {
            Schema::create('theories', function (Blueprint $table) {
                $table->id();
                $table->integer('user_id');
                $table->string('title');
                $table->string('content');
                $table->string('excerpt')->nullable();
                $table->string('tags')->nullable();
                $table->string('category')->default('general');
                $table->boolean('is_published')->default('0');
                $table->boolean('is_featured')->default('0');
                $table->integer('views_count')->default('0');
                $table->integer('likes_count')->default('0');
                $table->string('slug');
                $table->string('attachments')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('theories');
    }
};
