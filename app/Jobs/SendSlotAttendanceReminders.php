<?php

namespace App\Jobs;

use App\Models\AttendanceReminderNotification;
use App\Models\Formation;
use App\Models\User;
use App\Services\AttendanceCheckInService;
use App\Services\AttendanceSlotService;
use App\Services\ExpoPushNotificationService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class SendSlotAttendanceReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const SLOT_LABELS = [
        'morning' => 'Morning',
        'lunch' => 'Coffee break',
        'evening' => 'Lunch',
    ];

    public function handle(
        AttendanceSlotService $slotService,
        AttendanceCheckInService $checkInService,
        ExpoPushNotificationService $pushService,
    ): void {
        $now = Carbon::now();
        $slot = $slotService->currentSlot($now);

        if ($slot === null) {
            Log::info('SendSlotAttendanceReminders: no active slot at this time', [
                'now' => $now->toDateTimeString(),
            ]);

            return;
        }

        $activeFormationIds = Formation::query()
            ->where('is_active', true)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        if ($activeFormationIds === []) {
            Log::info('SendSlotAttendanceReminders: no active formations', ['slot' => $slot]);

            return;
        }

        $today = $now->toDateString();
        $activeFormationLookup = array_fill_keys($activeFormationIds, true);
        $recipients = [];

        $query = User::query()->where(function ($builder) use ($activeFormationIds) {
            $builder->whereIn('formation_id', $activeFormationIds);

            if (Schema::hasTable('formation_user')) {
                $builder->orWhereIn('id', DB::table('formation_user')
                    ->whereIn('formation_id', $activeFormationIds)
                    ->select('user_id'));
            }
        });

        foreach ($query->cursor() as $user) {
            $formationId = $this->resolveActiveFormationId($user, $activeFormationLookup);
            if ($formationId === null) {
                continue;
            }

            if (AttendanceReminderNotification::query()
                ->where('user_id', $user->id)
                ->whereDate('date', $today)
                ->where('slot', $slot)
                ->exists()) {
                continue;
            }

            try {
                $slotStatus = $checkInService->slotStatus($user, $formationId, $today);
            } catch (HttpResponseException) {
                continue;
            }

            if (in_array($slot, $slotStatus['already_marked_slots'] ?? [], true)) {
                continue;
            }

            $token = trim((string) ($user->expo_push_token ?? ''));
            if ($token === '') {
                continue;
            }

            $recipients[] = [
                'user_id' => (int) $user->id,
                'token' => $token,
            ];
        }

        if ($recipients === []) {
            Log::info('SendSlotAttendanceReminders: no recipients', ['slot' => $slot, 'date' => $today]);

            return;
        }

        $slotLabel = self::SLOT_LABELS[$slot] ?? $slot;
        $title = 'Attendance Reminder';
        $body = "Check in for {$slotLabel}";
        $tokens = array_values(array_unique(array_column($recipients, 'token')));

        $sent = $pushService->send($tokens, $title, $body, [
            'type' => 'attendance_reminder',
            'slot' => $slot,
        ]);

        if (! $sent) {
            Log::warning('SendSlotAttendanceReminders: Expo push batch failed', [
                'slot' => $slot,
                'date' => $today,
                'recipient_count' => count($recipients),
            ]);

            return;
        }

        foreach ($recipients as $recipient) {
            try {
                AttendanceReminderNotification::create([
                    'user_id' => $recipient['user_id'],
                    'date' => $today,
                    'slot' => $slot,
                    'message_notification' => $body,
                    'path' => '/students/attendance',
                ]);
            } catch (UniqueConstraintViolationException) {
                // Unique (user_id, date, slot) — concurrent run or race; safe to skip
                continue;
            }
        }

        Log::info('SendSlotAttendanceReminders: completed', [
            'slot' => $slot,
            'date' => $today,
            'recipient_count' => count($recipients),
        ]);
    }

    /**
     * @param  array<int, true>  $activeFormationLookup
     */
    private function resolveActiveFormationId(User $user, array $activeFormationLookup): ?int
    {
        foreach ($user->resolvedFormationIds() as $formationId) {
            if (isset($activeFormationLookup[$formationId])) {
                return $formationId;
            }
        }

        return null;
    }
}
