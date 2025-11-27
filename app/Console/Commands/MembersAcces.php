<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MembersAcces extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'membersacces';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign cowork/studio access based on the student field (coding vs media).';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Assigning access based on user field (coding/media)…');

        $studentsQuery = User::query()->where(function ($query) {
            $query->where('role', 'student')
                ->orWhereJsonContains('role', 'student');
        });

        // Normalize comparisons using LOWER(field)
        $codingQuery = (clone $studentsQuery)
            ->whereNotNull('field')
            ->whereRaw('LOWER(TRIM(field)) = ?', ['coding']);

        $mediaQuery = (clone $studentsQuery)
            ->whereNotNull('field')
            ->whereRaw('LOWER(TRIM(field)) = ?', ['media']);

        $otherQuery = (clone $studentsQuery)
            ->where(function ($query) {
                $query->whereNull('field')
                    ->orWhereRaw('LOWER(TRIM(field)) NOT IN (?, ?)', ['coding', 'media']);
            });

        $codingUpdated = $codingQuery->update([
            'access_cowork' => 1,
            'access_studio' => 0,
        ]);
        $this->info("Coding students updated: {$codingUpdated} (cowork only).");

        $mediaUpdated = $mediaQuery->update([
            'access_cowork' => 1,
            'access_studio' => 1,
        ]);
        $this->info("Media students updated: {$mediaUpdated} (cowork + studio).");

        $otherUpdated = $otherQuery->update([
            'access_cowork' => 0,
            'access_studio' => 0,
        ]);
        if ($otherUpdated > 0) {
            $this->warn("Other students with unknown field reset: {$otherUpdated}.");
        }

        $this->info('membersacces command completed.');

        return self::SUCCESS;
    }
}

