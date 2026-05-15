<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stories', function (Blueprint $table) {
            // JSON column holding the creative overlays applied on top of the
            // media. Schema (each entry):
            //   { id, type: 'text'|'sticker', x, y, scale, rotation, ... }
            //   - text:    { text, color, font, has_bg, bg_color }
            //   - sticker: { emoji }
            // x/y/scale/rotation are screen-space coordinates with x,y in
            // [0,1] (relative to media bounds) so renderers can scale them
            // to any viewport.
            $table->json('overlays')->nullable()->after('audience');
        });
    }

    public function down(): void
    {
        Schema::table('stories', function (Blueprint $table) {
            $table->dropColumn('overlays');
        });
    }
};
