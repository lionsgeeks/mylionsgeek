<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // Seed default types if table exists
        if (Schema::hasTable('equipment_types')) {
            DB::table('equipment_types')->insert([
                ['name' => 'camera', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'sound', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'lighting', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'data/storage', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'podcast', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'other', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment_types');
    }
};


