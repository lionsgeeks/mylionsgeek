<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservation_coworks', function (Blueprint $table) {
            $table->integer('seats')->default(1)->after('table');
        });
    }

    public function down(): void
    {
        Schema::table('reservation_coworks', function (Blueprint $table) {
            $table->dropColumn('seats');
        });
    }
};
