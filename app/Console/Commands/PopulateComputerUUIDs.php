<?php

namespace App\Console\Commands;

use App\Models\Computer;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class PopulateComputerUUIDs extends Command
{
    protected $signature = 'computers:populate-uuid';

    protected $description = 'Populate UUIDs for computers safely using SQLite';

    public function handle()
    {
        $this->info('Starting to populate UUIDs...');

        Computer::chunkById(100, function ($computers) {
            foreach ($computers as $computer) {
                if (! $computer->uuid) {
                    $computer->uuid = (string) Str::uuid();
                    $computer->save();
                    $this->info("UUID set for computer ID {$computer->id}");
                }
            }
        }, 'id');

        $this->info('All computers now have UUIDs!');
    }
}
