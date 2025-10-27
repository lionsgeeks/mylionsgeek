<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('equipment_types')) {
            return;
        }

        // Disable FK checks for SQLite
        DB::statement('PRAGMA foreign_keys = OFF;');

        // Drop leftover temp table if exists
        Schema::dropIfExists('equipment_types_tmp');

        Schema::create('equipment_types_tmp', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // Copy old data
        $existing = DB::table('equipment_types')->select('name', 'created_at', 'updated_at')->get();
        foreach ($existing as $row) {
            DB::table('equipment_types_tmp')->updateOrInsert(
                ['name' => strtolower(trim($row->name))],
                ['created_at' => $row->created_at, 'updated_at' => $row->updated_at]
            );
        }

        // Seed defaults if empty
        if (DB::table('equipment_types_tmp')->count() === 0) {
            $now = now();
            DB::table('equipment_types_tmp')->insert([
                ['name' => 'camera', 'created_at' => $now, 'updated_at' => $now],
                ['name' => 'sound', 'created_at' => $now, 'updated_at' => $now],
                ['name' => 'lighting', 'created_at' => $now, 'updated_at' => $now],
                ['name' => 'data/storage', 'created_at' => $now, 'updated_at' => $now],
                ['name' => 'podcast', 'created_at' => $now, 'updated_at' => $now],
                ['name' => 'other', 'created_at' => $now, 'updated_at' => $now],
            ]);
        }

        // Replace old table safely
        Schema::drop('equipment_types');
        Schema::rename('equipment_types_tmp', 'equipment_types');

        // Re-enable FK checks
        DB::statement('PRAGMA foreign_keys = ON;');
    }

    public function down(): void
    {
        // no rollback
    }
};
