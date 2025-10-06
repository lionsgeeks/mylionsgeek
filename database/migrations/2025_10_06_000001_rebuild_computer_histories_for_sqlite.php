<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (!Schema::hasTable('computer_histories')) {
            Schema::create('computer_histories', function (Blueprint $table) {
                $table->id();
                $table->integer('computer_id');
                $table->integer('user_id')->nullable();
                $table->timestamp('start');
                $table->timestamp('end')->nullable();
                $table->timestamps();
            });

            
            Schema::table('computer_histories', function (Blueprint $table) use ($driver) {
                $table->foreign('computer_id')->references('id')->on('computers')->onDelete('cascade');
                if ($driver !== 'sqlite') {
                    $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
                }
            });
            
        }

        Schema::disableForeignKeyConstraints();

        // Proactively drop old index if it exists
        DB::statement('DROP INDEX IF EXISTS computer_histories_computer_id_start_index');

        // Ensure leftover temp table from a previous failed run is gone
        DB::statement('DROP TABLE IF EXISTS computer_histories_old');

        // Rename existing table and recreate with correct types
        Schema::rename('computer_histories', 'computer_histories_old');

        Schema::create('computer_histories', function (Blueprint $table) {
            $table->id();
            $table->integer('computer_id');
            $table->integer('user_id')->nullable();
            $table->timestamp('start');
            $table->timestamp('end')->nullable();
            $table->timestamps();
        });

        // Copy data over with best-effort casts
        DB::statement('INSERT INTO computer_histories (id, computer_id, user_id, start, end, created_at, updated_at)
                       SELECT id,
                              CAST(computer_id AS INTEGER),
                              NULLIF(user_id, 0),
                              CASE WHEN start IS NULL OR start = "NULL" THEN CURRENT_TIMESTAMP ELSE start END,
                              CASE WHEN end IS NULL OR end = "NULL" THEN NULL ELSE end END,
                              CURRENT_TIMESTAMP,
                              CURRENT_TIMESTAMP
                       FROM computer_histories_old');

        // Add FKs
        Schema::table('computer_histories', function (Blueprint $table) use ($driver) {
            $table->foreign('computer_id')->references('id')->on('computers')->onDelete('cascade');
            if ($driver !== 'sqlite') {
                $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            }
        });

        

        Schema::drop('computer_histories_old');
        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        
    }
};


