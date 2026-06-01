<?php

namespace App\Console\Commands;

use App\Models\Job;
use Illuminate\Console\Command;

class CloseExpiredJobPostings extends Command
{
    protected $signature = 'jobs:close-expired';

    protected $description = 'Unpublish job postings whose application deadline has passed';

    public function handle(): int
    {
        $count = Job::query()
            ->where('is_published', true)
            ->whereNotNull('application_deadline')
            ->whereDate('application_deadline', '<', now()->toDateString())
            ->update(['is_published' => false]);

        $this->info("Unpublished {$count} expired job posting(s).");

        return self::SUCCESS;
    }
}
