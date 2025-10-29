<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            DB::table('users')->whereNotIn('role', [
                'admin',
                'student',
                'coworker',
                'coach',
                'pro',
                'moderator',
                'recruiter',
            ])->update(['role' => 'student']);

            $table->enum('role', [
                'admin',
                'student',
                'coworker',
                'coach',
                'pro',
                'moderator',
                'recruiter',
            ])->default('student')->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('student')->change();
        });
    }
};
