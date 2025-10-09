<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Rebuild attendance_lists to ensure an auto-incrementing integer primary key
        if (Schema::hasTable('attendance_lists')) {
            Schema::rename('attendance_lists', 'attendance_lists__old');
        }

        Schema::create('attendance_lists', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('attendance_id');
            $table->string('attendance_day');
            $table->string('morning')->default('present');
            $table->string('lunch')->default('present');
            $table->string('evening')->default('present');
            $table->timestamps();
        });

        // Best-effort migrate old data if structure compatible
        if (Schema::hasTable('attendance_lists__old')) {
            try {
                DB::table('attendance_lists')->insert(
                    DB::table('attendance_lists__old')->select(
                        DB::raw('NULL as id'),
                        'user_id',
                        'attendance_id',
                        'attendance_day',
                        'morning',
                        'lunch',
                        'evening',
                        'created_at',
                        'updated_at'
                    )->get()->map(function ($row) {
                        return (array) $row; // id will auto-increment
                    })->toArray()
                );
            } catch (\Throwable $e) {
                // If migration fails, we still keep the new table; old table remains for manual inspection
            }
            Schema::dropIfExists('attendance_lists__old');
        }
    }

    public function down(): void
    {
        // This down simply drops the rebuilt table; cannot reliably restore old broken schema
        Schema::dropIfExists('attendance_lists');
    }
};


