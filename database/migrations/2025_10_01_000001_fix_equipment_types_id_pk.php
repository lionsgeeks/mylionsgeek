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

        // Create a correct table structure with autoincrement PK and unique name
        Schema::create('equipment_types_tmp', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // Copy distinct existing data if any
        $existing = DB::table('equipment_types')->select('name', 'created_at', 'updated_at')->get();
        foreach ($existing as $row) {
            // Will assign new autoincrement id
            DB::table('equipment_types_tmp')->updateOrInsert(
                ['name' => strtolower(trim($row->name))],
                ['created_at' => $row->created_at, 'updated_at' => $row->updated_at]
            );
        }

        // If empty, seed defaults in a deterministic order so ids are stable
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

        // Replace old table
        Schema::drop('equipment_types');
        Schema::rename('equipment_types_tmp', 'equipment_types');
    }

    public function down(): void
    {
        // No-op rollback; keeping the corrected structure
    }
};


