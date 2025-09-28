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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string("phone")->nullable();
            $table->string("cin");
            $table->string("status")->default("Studying");
            $table->string("entreprise")->nullable();
            $table->string("image")->default("pdp.png");
            $table->boolean("access_studio")->default(false);
            $table->boolean("access_cowork")->default(false);
            $table->boolean("double_auth")->default(true);
            $table->boolean("auth_activation")->default(true);
            $table->boolean("password_reset")->default(false);
            $table->foreignId("formation_id")->nullable()->constrained();
            $table->boolean("account_state")->default(false);
            $table->boolean("darkmode")->default(false);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
