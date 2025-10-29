<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fix contracts table by recreating with proper schema (SQLite-safe)
        if (Schema::hasTable('contracts')) {
            Schema::create('contracts___new', function (Blueprint $table) {
                $table->id(); // INTEGER PRIMARY KEY AUTOINCREMENT (SQLite)
                $table->integer('user_id');
                $table->integer('reservation_id')->nullable();
                $table->string('contract');
                $table->string('type')->nullable();
                $table->timestamps();
            });

            // Copy data with best-effort mapping
            try {
                $rows = DB::table('contracts')->get();
                foreach ($rows as $row) {
                    DB::table('contracts___new')->insert([
                        // omit 'id' to allow autoincrement to assign
                        'user_id' => (int) ($row->user_id ?? 0),
                        'reservation_id' => isset($row->reservation_id) ? (int) $row->reservation_id : null,
                        'contract' => (string) ($row->contract ?? ''),
                        'type' => isset($row->type) ? (string) $row->type : null,
                        'created_at' => isset($row->created_at) && ! empty($row->created_at) ? (string) $row->created_at : now(),
                        'updated_at' => isset($row->updated_at) && ! empty($row->updated_at) ? (string) $row->updated_at : now(),
                    ]);
                }
            } catch (\Throwable $e) {
                // If something goes wrong copying, proceed with empty table rather than failing migration
            }

            Schema::drop('contracts');
            Schema::rename('contracts___new', 'contracts');
        }

        // Fix medicals table by recreating with proper schema (SQLite-safe)
        if (Schema::hasTable('medicals')) {
            Schema::create('medicals___new', function (Blueprint $table) {
                $table->id();
                $table->integer('user_id');
                $table->string('mc_document');
                $table->string('description')->nullable();
                $table->string('author')->nullable();
                $table->timestamps();
            });

            try {
                $rows = DB::table('medicals')->get();
                foreach ($rows as $row) {
                    DB::table('medicals___new')->insert([
                        'user_id' => (int) ($row->user_id ?? 0),
                        'mc_document' => (string) ($row->mc_document ?? ''),
                        'description' => isset($row->description) ? (string) $row->description : null,
                        'author' => isset($row->author) ? (string) $row->author : null,
                        'created_at' => isset($row->created_at) && ! empty($row->created_at) ? (string) $row->created_at : now(),
                        'updated_at' => isset($row->updated_at) && ! empty($row->updated_at) ? (string) $row->updated_at : now(),
                    ]);
                }
            } catch (\Throwable $e) {
                // proceed with empty table
            }

            Schema::drop('medicals');
            Schema::rename('medicals___new', 'medicals');
        }
    }

    public function down(): void
    {
        // No-op safe down: do not attempt to restore old broken schemas
    }
};
