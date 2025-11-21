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
        if ($driver !== 'sqlite') {
            return; 
        }

        Schema::disableForeignKeyConstraints();

        // Backup existing data if table exists
        if (Schema::hasTable('computer_histories')) {
            DB::statement('DROP TABLE IF EXISTS computer_histories_backup');
            DB::statement('CREATE TABLE computer_histories_backup AS SELECT * FROM computer_histories');
            Schema::drop('computer_histories');
        }

        // Recreate with clean SQLite-compatible schema 
        Schema::create('computer_histories', function (Blueprint $table) {
            $table->id();
            $table->integer('computer_id'); 
            $table->integer('user_id')->nullable(); 
            $table->timestamp('start');
            $table->timestamp('end')->nullable();
            $table->timestamps();
        });

        // Restore data where possible (casting values)
        if (Schema::hasTable('computer_histories_backup')) {
            DB::statement('INSERT INTO computer_histories (id, computer_id, user_id, start, end, created_at, updated_at)
                           SELECT id,
                                  CAST(computer_id AS INTEGER),
                                  CASE WHEN user_id IS NULL OR user_id = 0 OR user_id = "NULL" THEN NULL ELSE CAST(user_id AS INTEGER) END,
                                  CASE WHEN start IS NULL OR start = "NULL" THEN CURRENT_TIMESTAMP ELSE start END,
                                  CASE WHEN end IS NULL OR end = "NULL" THEN NULL ELSE end END,
                                  COALESCE(created_at, CURRENT_TIMESTAMP),
                                  COALESCE(updated_at, CURRENT_TIMESTAMP)
                           FROM computer_histories_backup');
            Schema::drop('computer_histories_backup');
        }

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        
    }
};


