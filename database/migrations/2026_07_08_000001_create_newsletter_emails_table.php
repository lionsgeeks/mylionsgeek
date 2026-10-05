<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_emails', function (Blueprint $table) {
            $table->id();
            $table->string('subject');
            $table->text('body')->nullable();
            $table->text('body_fr')->nullable();
            $table->text('body_ar')->nullable();
            $table->text('body_en')->nullable();
            $table->unsignedInteger('recipients_count')->default(0);
            $table->foreignId('sent_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_emails');
    }
};
