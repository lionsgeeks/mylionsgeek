<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ImportActivityLog extends Command
{
    protected $signature = 'activity-log:import 
        {--dry-run : Do not write to DB} 
        {--limit=0 : Limit number of rows} 
        {--from-id=0 : Start from activity_log.id} 
        {--only= : Only import a type: reservations,computer_histories,all}
        {--analyze : Only analyze and print summary of activity_log rows}
        {--id=0 : Analyze a specific activity_log id}
        {--verify : Verify reservation imports and pivots against activity_log}
        {--verify-computers : Verify computer history imports against activity_log}';

    protected $description = 'Import data from activity_log into domain tables (reservations, pivots, computer_histories)';

    public function handle()
    {
        $dryRun = (bool) $this->option('dry-run');
        $limit = (int) $this->option('limit');
        $fromId = (int) $this->option('from-id');
        $only = $this->option('only') ?: 'all';
        $analyze = (bool) $this->option('analyze');
        $verify = (bool) $this->option('verify');
        $verifyComputers = (bool) $this->option('verify-computers');

        $this->info('Starting activity_log import...');

        $query = DB::table('activity_log')->orderBy('id');
        if ($fromId > 0) {
            $query->where('id', '>=', $fromId);
        }
        if ($limit > 0) {
            $query->limit($limit);
        }

        if ($analyze) {
            $this->analyze($query);
            return Command::SUCCESS;
        }

        if ($verify) {
            $this->verifyReservations();
            return Command::SUCCESS;
        }

        if ($verifyComputers) {
            $this->verifyComputerHistories();
            return Command::SUCCESS;
        }

        $processed = 0;
        $imported = 0;
        $skipped = 0;

        $hasReservationMirror = Schema::hasTable('reservation_activity_log');
        $hasComputerMirror = Schema::hasTable('computer_activity_log');

        $query->chunkById(300, function ($rows) use (&$processed, &$imported, &$skipped, $dryRun, $only, $hasReservationMirror, $hasComputerMirror) {
            foreach ($rows as $row) {
                $processed++;

                $props = $this->decodeProperties($row->properties);

                $handled = false;

                if ($only === 'all' || $only === 'reservations') {
                    $handled = $this->importReservationLike($row, $props, $dryRun) || $handled;
                }
                if ($only === 'all' || $only === 'computer_histories') {
                    $handled = $this->importComputerHistoryLike($row, $props, $dryRun) || $handled;
                }

                // Mirror rows only if mirror tables exist
                if (!$dryRun && ($hasReservationMirror || $hasComputerMirror)) {
                    $mirror = [
                        'log_name' => $row->log_name,
                        'description' => $row->description,
                        'subject_type' => $row->subject_type,
                        'subject_id' => $row->subject_id,
                        'causer_type' => $row->causer_type,
                        'causer_id' => $row->causer_id,
                        'properties' => is_string($row->properties) ? $row->properties : json_encode($row->properties),
                        'event' => $row->event,
                        'batch_uuid' => $row->batch_uuid,
                        'created_at' => $row->created_at,
                        'updated_at' => $row->updated_at,
                    ];
                    if ($hasReservationMirror && is_string($row->subject_type) && str_contains($row->subject_type, 'Reservation')) {
                        DB::table('reservation_activity_log')->insert($mirror);
                    } elseif ($hasComputerMirror && is_string($row->subject_type) && str_contains($row->subject_type, 'Computer')) {
                        DB::table('computer_activity_log')->insert($mirror);
                    }
                }

                if ($handled) {
                    $imported++;
                } else {
                    $skipped++;
                    $this->line("SKIP [{$row->id}] {$row->description} ({$row->event}) subject: {$row->subject_type}#{$row->subject_id}");
                }
            }
        }, 'id');

        $this->info("Processed {$processed} activity_log rows. Imported: {$imported}, Skipped: {$skipped}");

        return Command::SUCCESS;
    }

    private function verifyReservations(): void
    {
        $this->info('Verifying reservation activity_log against reservations and pivots...');

        $rows = DB::table('activity_log')
            ->where('subject_type', 'like', '%Reservation%')
            ->orderBy('id')
            ->get();

        $total = 0;
        $okReservations = 0;
        $missingReservations = 0;
        $pivotIssues = 0;

        $missingExamples = [];
        $pivotIssueExamples = [];

        foreach ($rows as $row) {
            $total++;
            $props = $this->decodeProperties($row->properties);

            $res = DB::table('reservations')->where('id', $row->subject_id)->first();
            if (!$res) {
                $missingReservations++;
                if (count($missingExamples) < 10) {
                    $missingExamples[] = "activity_log id {$row->id} missing reservation id {$row->subject_id}";
                }
                continue;
            }

            $allGood = true;

            $team = $this->get($props, ['team_members'], $this->get($props, ['team'], []));
            if (is_array($team)) {
                foreach ($team as $userId) {
                    $exists = DB::table('reservation_teams')
                        ->where('reservation_id', $res->id)
                        ->where('user_id', (int) $userId)
                        ->exists();
                    if (!$exists) {
                        $allGood = false;
                        if (count($pivotIssueExamples) < 10) {
                            $pivotIssueExamples[] = "reservation_team missing: reservation {$res->id}, user {$userId} (activity_log {$row->id})";
                        }
                    }
                }
            }

            $equipment = $this->get($props, ['equipment'], []);
            if (is_array($equipment)) {
                foreach ($equipment as $eq) {
                    $equipmentId = is_array($eq) ? ($eq['equipment_id'] ?? ($eq['id'] ?? null)) : (int) $eq;
                    if (!$equipmentId) {
                        continue;
                    }
                    $exists = DB::table('reservation_equipment')
                        ->where('reservation_id', $res->id)
                        ->where('equipment_id', (int) $equipmentId)
                        ->exists();
                    if (!$exists) {
                        $allGood = false;
                        if (count($pivotIssueExamples) < 10) {
                            $pivotIssueExamples[] = "reservation_equipment missing: reservation {$res->id}, equipment {$equipmentId} (activity_log {$row->id})";
                        }
                    }
                }
            }

            if ($allGood) {
                $okReservations++;
            } else {
                $pivotIssues++;
            }
        }

        $this->line("Total reservation activity_log rows: {$total}");
        $this->line("Reservations present: {$okReservations}");
        $this->line("Missing reservations: {$missingReservations}");
        $this->line("Reservations with pivot issues: {$pivotIssues}");

        if (!empty($missingExamples)) {
            $this->line('Examples of missing reservations:');
            foreach ($missingExamples as $ex) {
                $this->line('  - ' . $ex);
            }
        }
        if (!empty($pivotIssueExamples)) {
            $this->line('Examples of pivot issues:');
            foreach ($pivotIssueExamples as $ex) {
                $this->line('  - ' . $ex);
            }
        }
    }

    private function verifyComputerHistories(): void
    {
        $this->info('Verifying computer activity_log against computer_histories...');

        $rows = DB::table('activity_log')
            ->where('subject_type', 'like', '%Computer%')
            ->orderBy('id')
            ->get();

        $total = 0;
        $ok = 0;
        $missing = 0;
        $examples = [];

        foreach ($rows as $row) {
            $total++;
            $props = $this->decodeProperties($row->properties);
            $computerId = $row->subject_id;
            $userId = $row->causer_id; // who performed the action
            $start = $props['start'] ?? null;
            $end = $props['end'] ?? null;

            if (!$computerId || !$userId || !$start || !$end) {
                // not a complete history record; treat as missing
                $missing++;
                if (count($examples) < 10) {
                    $examples[] = "activity_log {$row->id} incomplete props for computer history (computer={$computerId}, user={$userId}, start={$start}, end={$end})";
                }
                continue;
            }

            $exists = DB::table('computer_histories')
                ->where('computer_id', (int) $computerId)
                ->where('user_id', (int) $userId)
                ->where('start', (string) $start)
                ->where('end', (string) $end)
                ->exists();

            if ($exists) {
                $ok++;
            } else {
                $missing++;
                if (count($examples) < 10) {
                    $examples[] = "missing computer_history for activity_log {$row->id} (computer={$computerId}, user={$userId}, start={$start}, end={$end})";
                }
            }
        }

        $this->line("Total computer activity_log rows: {$total}");
        $this->line("Histories present: {$ok}");
        $this->line("Missing/incomplete: {$missing}");
        if (!empty($examples)) {
            $this->line('Examples:');
            foreach ($examples as $ex) {
                $this->line('  - ' . $ex);
            }
        }
    }

    private function analyze($baseQuery): void
    {
        $this->info('Analyzing activity_log...');
        $summaryRows = DB::table('activity_log')
            ->select('subject_type', 'event', DB::raw('COUNT(*) as c'))
            ->groupBy('subject_type', 'event')
            ->orderByDesc('c')
            ->limit(50)
            ->get();

        foreach ($summaryRows as $r) {
            $key = (($r->subject_type ?: 'null')) . ' | ' . (($r->event ?: 'null'));
            $this->line(str_pad((string) $r->c, 7, ' ', STR_PAD_LEFT) . '  ' . $key);
        }

        $id = (int) $this->option('id');
        if ($id > 0) {
            $this->line('Inspecting specific row id=' . $id);
            $row = DB::table('activity_log')->where('id', $id)->first();
            if ($row) {
                $this->line("[{$row->id}] {$row->description} | {$row->subject_type}#{$row->subject_id} | {$row->event}");
                $this->line('  raw properties: ' . (string) $row->properties);
                $props = $this->decodeProperties($row->properties);
                $this->line('  decoded: ' . $this->stringifyShort($props));
            } else {
                $this->warn('Row not found');
            }
        } else {
            $this->line('Sample rows:');
            $samples = DB::table('activity_log')->orderBy('id')->limit(10)->get();
            foreach ($samples as $row) {
                $this->line("[{$row->id}] {$row->description} | {$row->subject_type}#{$row->subject_id} | {$row->event}");
                $props = $this->decodeProperties($row->properties);
                $this->line('  properties: ' . $this->stringifyShort($props));
            }
        }
    }

    private function decodeProperties($raw)
    {
        if (is_null($raw)) {
            return [];
        }
        // Some rows might have serialized or JSON strings stored as text
        if (is_string($raw)) {
            $decoded = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded ?? [];
            }
        }
        if (is_array($raw)) {
            return $raw;
        }
        return [];
    }

    private function get(array $arr, array $path, $default = null)
    {
        $cur = $arr;
        foreach ($path as $segment) {
            if (!is_array($cur) || !array_key_exists($segment, $cur)) {
                return $default;
            }
            $cur = $cur[$segment];
        }
        return $cur;
    }

    private function stringifyShort($val): string
    {
        $json = json_encode($val, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        return mb_strimwidth((string) $json, 0, 240, '…');
    }

    private function importReservationLike($row, array $props, bool $dryRun): bool
    {
        $subjectType = (string) ($row->subject_type ?? '');
        $desc = strtolower((string) ($row->description ?? ''));

        $looksLike = str_contains(strtolower($subjectType), 'reservation') || str_contains($desc, 'reservation');
        if (!$looksLike) {
            return false;
        }

        // We enrich existing reservation using props (type/team/equipment)
        $reservationId = (int) ($row->subject_id ?? 0);
        if ($reservationId <= 0) {
            return false;
        }

        $existing = DB::table('reservations')->where('id', $reservationId)->first();
        if (!$existing) {
            // Create a minimal reservation using available info
            $createdAt = $row->created_at ?: now()->toDateTimeString();
            $day = substr((string) $createdAt, 0, 10);
            $newReservation = [
                'id' => $reservationId,
                'title' => 'Reservation #' . (string) $reservationId,
                'description' => (string) ($row->description ?? ''),
                'day' => (string) $day,
                'start' => '00:00:00',
                'end' => '00:00:00',
                'user_id' => (int) ($row->causer_id ?? 0),
                'studio_id' => null,
                'type' => isset($props['type']) ? (string) $props['type'] : 'default',
                'approved' => str_contains(strtolower((string) $row->description), 'approved') ? 1 : 0,
                'canceled' => str_contains(strtolower((string) $row->description), 'canceled') || str_contains(strtolower((string) $row->description), 'cancelled') ? 1 : 0,
                'passed' => 0,
                'start_signed' => 0,
                'end_signed' => 0,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];
            if ($dryRun) {
                $this->line('DRY-RUN create minimal reservation: ' . $this->stringifyShort($newReservation));
            } else {
                DB::table('reservations')->insert($newReservation);
            }
            $existing = (object) $newReservation;
        }

        // Update reservation type if provided
        if (isset($props['type']) && $props['type'] !== null && $props['type'] !== '') {
            if ($dryRun) {
                $this->line('DRY-RUN update reservation type: id=' . $reservationId . ' type=' . (string) $props['type']);
            } else {
                DB::table('reservations')->where('id', $reservationId)->update(['type' => (string) $props['type']]);
            }
        }

        // Set flags based on description text
        $descLower = strtolower((string) $row->description);
        if (str_contains($descLower, 'approved')) {
            if ($dryRun) {
                $this->line('DRY-RUN mark reservation approved: id=' . $reservationId);
            } else {
                DB::table('reservations')->where('id', $reservationId)->update(['approved' => 1, 'canceled' => 0]);
            }
        }
        if (str_contains($descLower, 'canceled') || str_contains($descLower, 'cancelled')) {
            if ($dryRun) {
                $this->line('DRY-RUN mark reservation canceled: id=' . $reservationId);
            } else {
                DB::table('reservations')->where('id', $reservationId)->update(['canceled' => 1]);
            }
        }

        // Team pivots
        $teamMembers = $this->get($props, ['team_members'], $this->get($props, ['team'], []));
        if (is_array($teamMembers) && !empty($teamMembers)) {
            foreach ($teamMembers as $userId) {
                $pivot = ['user_id' => (int) $userId, 'reservation_id' => $reservationId];
                if ($dryRun) {
                    $this->line('  DRY-RUN add team member pivot: ' . $this->stringifyShort($pivot));
                } else {
                    DB::table('reservation_teams')->updateOrInsert($pivot, $pivot);
                }
            }
        }

        // Equipment pivots
        $equipmentList = $this->get($props, ['equipment'], []);
        if (is_array($equipmentList) && !empty($equipmentList)) {
            foreach ($equipmentList as $eq) {
                if (is_array($eq)) {
                    $equipmentId = $eq['equipment_id'] ?? $eq['id'] ?? null;
                    $day = $eq['day'] ?? $existing->day;
                    $start = $eq['start'] ?? $existing->start;
                    $end = $eq['end'] ?? $existing->end;
                } else {
                    $equipmentId = (int) $eq;
                    $day = $existing->day;
                    $start = $existing->start;
                    $end = $existing->end;
                }

                if (!$equipmentId) {
                    continue;
                }

                $pivot = [
                    'reservation_id' => $reservationId,
                    'equipment_id' => (int) $equipmentId,
                    'day' => (string) $day,
                    'start' => (string) $start,
                    'end' => (string) $end,
                ];

                if ($dryRun) {
                    $this->line('  DRY-RUN add equipment pivot: ' . $this->stringifyShort($pivot));
                } else {
                    DB::table('reservation_equipment')->updateOrInsert([
                        'reservation_id' => $pivot['reservation_id'],
                        'equipment_id' => $pivot['equipment_id'],
                        'day' => $pivot['day'],
                        'start' => $pivot['start'],
                        'end' => $pivot['end'],
                    ], $pivot);
                }
            }
        }

        return true;
    }

    private function importComputerHistoryLike($row, array $props, bool $dryRun): bool
    {
        $subjectType = (string) ($row->subject_type ?? '');
        $desc = strtolower((string) ($row->description ?? ''));

        $looksLike = str_contains(strtolower($subjectType), 'computer') || str_contains($desc, 'computer');
        if (!$looksLike) {
            return false;
        }

        $history = [
            'computer_id' => $row->subject_id ?? null,
            'user_id' => $row->causer_id ?? null,
            'start' => $props['start'] ?? null,
            'end' => $props['end'] ?? null,
        ];

        // Backfill rule: if start is missing but end exists, default start to activity_log.created_at
        if (!$history['start'] && $history['end']) {
            $createdAt = (string) ($row->created_at ?? '');
            if ($createdAt !== '') {
                // Use full timestamp if available; otherwise fallback to date part
                $history['start'] = $createdAt;
            }
        }

        if (!$history['computer_id'] || !$history['user_id'] || !$history['start'] || !$history['end']) {
            return false;
        }

        if ($dryRun) {
            $this->line('DRY-RUN add computer history: ' . $this->stringifyShort($history));
        } else {
            // Try to avoid duplicates
            DB::table('computer_histories')->updateOrInsert([
                'computer_id' => (int) $history['computer_id'],
                'user_id' => (int) $history['user_id'],
                'start' => (string) $history['start'],
                'end' => (string) $history['end'],
            ], $history);
        }

        return true;
    }
}


