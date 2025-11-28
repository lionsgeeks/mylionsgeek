<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateComputerStates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'computers:update-state';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize computer state with assignment status (user_id)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        DB::table('computers')->update([
            'state' => 'working',
            'updated_at' => now(),
        ]);


        $this->components->info("Updated  computers to 'working'.");

        return self::SUCCESS;
    }
}
