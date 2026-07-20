<?php

namespace App\Console\Commands;

use App\Jobs\SendSlotAttendanceReminders;
use App\Services\AttendanceSlotService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendSlotAttendanceReminder extends Command
{
    protected $signature = 'attendance:send-slot-reminder';

    protected $description = 'Dispatch attendance reminders for the slot active at the current server time';

    public function handle(AttendanceSlotService $slotService): int
    {
        $slot = $slotService->currentSlot(Carbon::now());

        if ($slot === null) {
            $this->warn('No active attendance slot right now — nothing to dispatch.');

            return self::SUCCESS;
        }

        SendSlotAttendanceReminders::dispatch();

        $this->info("Dispatched attendance reminders for current slot: {$slot}");

        return self::SUCCESS;
    }
}
