<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DeduplicateAttendanceNotes extends Command
{
    protected $signature = 'attendance:dedupe-notes {--force : Delete duplicate rows after displaying counts}';

    protected $description = 'Remove duplicate attendance notes (same user_id, attendance_id, note), keeping the oldest row per group';

    public function handle(): int
    {
        if (! Schema::hasTable('notes')) {
            $this->error('The notes table does not exist.');

            return self::FAILURE;
        }

        $duplicateGroups = DB::table('notes')
            ->select('user_id', 'attendance_id', 'note', DB::raw('COUNT(*) as row_count'), DB::raw('MIN(id) as keep_id'))
            ->whereNotNull('attendance_id')
            ->groupBy('user_id', 'attendance_id', 'note')
            ->having('row_count', '>', 1)
            ->get();

        if ($duplicateGroups->isEmpty()) {
            $this->info('No duplicate attendance notes found.');

            return self::SUCCESS;
        }

        $rowsToDelete = 0;
        foreach ($duplicateGroups as $group) {
            $extra = (int) $group->row_count - 1;
            $rowsToDelete += $extra;
            $this->line(sprintf(
                'user_id=%d attendance_id=%d note=%s → %d rows (%d duplicate%s to remove, keep id=%d)',
                $group->user_id,
                $group->attendance_id,
                json_encode($group->note),
                $group->row_count,
                $extra,
                $extra === 1 ? '' : 's',
                $group->keep_id,
            ));
        }

        $this->newLine();
        $this->info(sprintf(
            'Summary: %d duplicate group(s), %d row(s) would be deleted.',
            $duplicateGroups->count(),
            $rowsToDelete,
        ));

        if (! $this->option('force')) {
            $this->warn('Dry run only. Re-run with --force to delete the duplicate rows.');

            return self::SUCCESS;
        }

        $deleted = 0;
        foreach ($duplicateGroups as $group) {
            $deleted += DB::table('notes')
                ->where('user_id', $group->user_id)
                ->where('attendance_id', $group->attendance_id)
                ->where('note', $group->note)
                ->where('id', '!=', $group->keep_id)
                ->delete();
        }

        $this->info("Deleted {$deleted} duplicate note row(s).");

        return self::SUCCESS;
    }
}
