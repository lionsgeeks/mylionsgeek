<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('access_request_response_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('access_request_notification_id')->constrained('access_request_notifications')->onDelete('cascade');
            $table->string('status'); // 'approved' or 'denied'
            $table->text('denial_reason')->nullable(); // Only for denied requests
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('message_notification');
            $table->string('path')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('access_request_response_notifications');
    }
};
