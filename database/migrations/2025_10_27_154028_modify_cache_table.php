<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Modify the existing cache table
        Schema::table('cache', function (Blueprint $table) {
            // Change value to text
            $table->text('value')->change();

            // Add unique index on key
            $table->unique('key');
        });
    }

    public function down(): void
    {
        Schema::table('cache', function (Blueprint $table) {
            // Revert value to string
            $table->string('value')->change();

            // Drop the unique index
            $table->dropUnique(['key']);
        });
    }
};
