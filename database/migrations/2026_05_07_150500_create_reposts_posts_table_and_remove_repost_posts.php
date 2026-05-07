<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reposts_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained('posts')->cascadeOnDelete();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'post_id']);
            $table->index(['post_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        // Backfill pivot rows from legacy repost posts (posts.repost_of_post_id).
        if (Schema::hasColumn('posts', 'repost_of_post_id')) {
            $legacyReposts = DB::table('posts')
                ->select(['id', 'user_id', 'repost_of_post_id', 'description', 'created_at', 'updated_at'])
                ->whereNotNull('repost_of_post_id')
                ->get();

            foreach ($legacyReposts as $row) {
                if (!$row->user_id || !$row->repost_of_post_id) {
                    continue;
                }

                DB::table('reposts_posts')->updateOrInsert(
                    [
                        'user_id' => (int) $row->user_id,
                        'post_id' => (int) $row->repost_of_post_id,
                    ],
                    [
                        'description' => $row->description,
                        'created_at' => $row->created_at ?? now(),
                        'updated_at' => $row->updated_at ?? now(),
                    ]
                );
            }

            // Remove legacy repost rows after migration (feed will be built from pivot).
            DB::table('posts')->whereNotNull('repost_of_post_id')->delete();

            Schema::table('posts', function (Blueprint $table) {
                $table->dropConstrainedForeignId('repost_of_post_id');
            });
        }
    }

    public function down(): void
    {
        // Best-effort rollback: restore the column, but repost rows deleted in up() cannot be reconstructed.
        if (!Schema::hasColumn('posts', 'repost_of_post_id')) {
            Schema::table('posts', function (Blueprint $table) {
                $table
                    ->foreignId('repost_of_post_id')
                    ->nullable()
                    ->constrained('posts')
                    ->cascadeOnDelete()
                    ->after('user_id');
            });
        }

        Schema::dropIfExists('reposts_posts');
    }
};

