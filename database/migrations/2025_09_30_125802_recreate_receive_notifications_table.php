<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('receive_notifications')) {
            Schema::create('receive_notifications', function (Blueprint $table) {
                $table->id();
                $table->integer('student');
                $table->integer('cowork');
                $table->integer('moderator');
                $table->integer('coach');
                $table->integer('user_id');
                $table->string('created_at')->nullable()->default('NULL');
                $table->string('updated_at')->nullable()->default('NULL');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('receive_notifications');
    }
};
