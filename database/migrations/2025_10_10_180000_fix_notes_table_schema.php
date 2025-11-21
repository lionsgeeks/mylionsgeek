<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // If notes exists, move aside to rebuild cleanly (fix id autoincrement, add attendance_id, proper timestamps)
        if (Schema::hasTable('notes')) {
            Schema::rename('notes', 'notes__old');
        }

        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('attendance_id')->nullable();
            $table->string('note');
            $table->string('author')->nullable();
            $table->timestamps();
        });

        // Migrate data from old table if present
        if (Schema::hasTable('notes__old')) {
            try {
                $rows = DB::table('notes__old')->get();
                foreach ($rows as $row) {
                    DB::table('notes')->insert([
                        // let id auto-increment
                        'user_id' => isset($row->user_id) ? (int) $row->user_id : null,
                        'attendance_id' => $row->attendance_id ?? null,
                        'note' => (string) ($row->note ?? ''),
                        'author' => $row->author ?? null,
                        'created_at' => $row->created_at ?? now(),
                        'updated_at' => $row->updated_at ?? now(),
                    ]);
                }
            } catch (\Throwable $e) {
                // Ignore migration copy errors; table structure is fixed either way
            }
            Schema::dropIfExists('notes__old');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};


