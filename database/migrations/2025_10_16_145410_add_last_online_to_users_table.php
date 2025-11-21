<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('users', function ($table) {
        $table->timestamp('last_online')->nullable()->after('remember_token');
    });
}

public function down()
{
    Schema::table('users', function ($table) {
        $table->dropColumn('last_online');
    });
}
};
