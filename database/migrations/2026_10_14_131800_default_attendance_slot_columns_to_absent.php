<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('attendance_lists')) {
            return;
        }

        Schema::table('attendance_lists', function (Blueprint $table) {
            $table->string('morning')->default('absent')->change();
            $table->string('lunch')->default('absent')->change();
            $table->string('evening')->default('absent')->change();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('attendance_lists')) {
            return;
        }

        Schema::table('attendance_lists', function (Blueprint $table) {
            $table->string('morning')->default('Present')->change();
            $table->string('lunch')->default('Present')->change();
            $table->string('evening')->default('Present')->change();
        });
    }
};
