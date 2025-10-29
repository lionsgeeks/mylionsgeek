<?php

namespace App\Console\Commands;

use App\Models\Formation;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SyncUserPromos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:sync-promo {--dry-run : Show what would change without saving}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set users.promo from their assigned formation promo (supports FK or pivot).';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $this->info('Starting promo sync from formations to users' . ($dryRun ? ' (dry run)' : ''));

        $countProcessed = 0;
        $countUpdated = 0;

        User::query()->orderBy('id')->chunk(500, function ($users) use (&$countProcessed, &$countUpdated, $dryRun) {
            foreach ($users as $user) {
                $countProcessed++;

                $formation = $this->resolveUserFormation($user);
                if (!$formation) {
                    $this->line("User {$user->id}: no formation found, skipping");
                    continue;
                }

                $promoRaw = $formation->promo ?? null;
                $promo = is_numeric($promoRaw) ? (int) $promoRaw : null;

                if ($promo === null) {
                    $this->line("User {$user->id}: formation {$formation->id} has no promo, skipping");
                    continue;
                }

                if ((int) ($user->promo ?? 0) === $promo) {
                    $this->line("User {$user->id}: promo already {$promo}, no change");
                    continue;
                }

                if ($dryRun) {
                    $this->line("[Dry] User {$user->id} would be updated with promo {$promo}");
                } else {
                    $user->promo = $promo;
                    $user->save();
                    $this->info("User {$user->id} updated with promo {$promo}");
                    $countUpdated++;
                }
            }
        });

        $this->info("Processed {$countProcessed} users. Updated {$countUpdated}.");
        return self::SUCCESS;
    }

    private function resolveUserFormation(User $user): ?Formation
    {
        // 1) Pivot support: formation_user (user_id, formation_id, timestamps)
        if (Schema::hasTable('formation_user')) {
            $row = DB::table('formation_user')
                ->where('user_id', $user->id)
                ->when(Schema::hasColumn('formation_user', 'created_at'), function ($q) {
                    $q->orderByDesc('created_at');
                }, function ($q) {
                    $q->orderByDesc('formation_id');
                })
                ->first();
            if ($row && isset($row->formation_id)) {
                return Formation::query()->find($row->formation_id);
            }
        }

        // 2) Fallback to users.formation_id
        if (Schema::hasColumn('users', 'formation_id') && $user->formation_id) {
            return Formation::query()->find($user->formation_id);
        }

        return null;
    }
}


