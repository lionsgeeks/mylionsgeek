<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'certificate_code')) {
                $table->string('certificate_code', 32)->nullable()->unique()->after('certificate_pdf_path');
            }
        });

        if (! Schema::hasTable('certificate_counters')) {
            Schema::create('certificate_counters', function (Blueprint $table) {
                $table->string('name', 64)->primary();
                $table->unsignedInteger('last_number')->default(0);
                $table->timestamps();
            });
        }

        if (! DB::table('certificate_counters')->where('name', 'geeklab')->exists()) {
            DB::table('certificate_counters')->insert([
                'name' => 'geeklab',
                'last_number' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'certificate_code')) {
                $table->dropUnique(['certificate_code']);
                $table->dropColumn('certificate_code');
            }
        });

        Schema::dropIfExists('certificate_counters');
    }
};
