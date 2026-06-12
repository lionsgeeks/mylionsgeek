<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_postings', function (Blueprint $table) {
            if (! Schema::hasColumn('job_postings', 'application_deadline')) {
                $table->date('application_deadline')->nullable()->after('is_published');
            }
        });

        $fallbackDeadline = now()->addDays(90)->toDateString();

        foreach (DB::table('job_postings')->whereNull('application_deadline')->get(['id', 'created_at']) as $row) {
            $created = $row->created_at ?? now()->toDateTimeString();
            $deadline = \Illuminate\Support\Carbon::parse($created)->addDays(90)->toDateString();

            DB::table('job_postings')->where('id', $row->id)->update(['application_deadline' => $deadline]);
        }

        DB::table('job_postings')
            ->whereNull('application_deadline')
            ->update(['application_deadline' => $fallbackDeadline]);

        DB::table('job_postings')
            ->where('is_published', true)
            ->whereDate('application_deadline', '<', now()->toDateString())
            ->update(['is_published' => false]);
    }

    public function down(): void
    {
        Schema::table('job_postings', function (Blueprint $table) {
            if (Schema::hasColumn('job_postings', 'application_deadline')) {
                $table->dropColumn('application_deadline');
            }
        });
    }
};
