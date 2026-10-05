<?php

namespace App\Console\Commands;

use App\Jobs\SendSlotAttendanceReminders;
use App\Services\AttendanceSlotService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendSlotAttendanceReminder extends Command
{
    protected $signature = 'attendance:send-slot-reminder
                            {--slot= : Slot to remind (morning|lunch|evening); defaults to current active slot}
                            {--date= : Attendance day Y-m-d; defaults to today}';

    protected $description = 'Dispatch attendance reminders for a slot (captured at dispatch — safe if the queue runs late)';

    public function handle(AttendanceSlotService $slotService): int
    {
        $now = Carbon::now();
        $date = $this->option('date') ?: $now->toDateString();
        $slotOption = $this->option('slot');

        if ($slotOption !== null && $slotOption !== '') {
            $slot = (string) $slotOption;
            if (! in_array($slot, $slotService->slotOrder(), true)) {
                $this->error("Unknown slot [{$slot}]. Expected one of: ".implode(', ', $slotService->slotOrder()));

                return self::FAILURE;
            }
        } else {
            $slot = $slotService->currentSlot($now);

            if ($slot === null) {
                $this->warn('No active attendance slot right now — nothing to dispatch.');

                return self::SUCCESS;
            }
        }

        SendSlotAttendanceReminders::dispatch($slot, $date);

        $this->info("Dispatched attendance reminders for slot [{$slot}] on [{$date}]");

        return self::SUCCESS;
    }
}
