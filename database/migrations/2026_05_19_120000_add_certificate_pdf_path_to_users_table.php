<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Stores the relative public-disk path to the student's certificate PDF.
            // e.g. "certificates/42.pdf"
            $table->string('certificate_pdf_path')->nullable()->after('certificate_share_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('certificate_pdf_path');
        });
    }
};
