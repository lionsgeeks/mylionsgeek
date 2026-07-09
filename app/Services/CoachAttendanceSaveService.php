<?php

namespace App\Services;

use App\Models\AttendanceListe;
use App\Models\Note;

class CoachAttendanceSaveService
{
    public function __construct(
        private readonly StudentCheckInSlotService $studentCheckInSlotService,
        private readonly AttendanceSlotService $slotService,
    ) {}

    /**
     * @param  list<int>  $userIds
     * @return array{
     *     rowsByUserId: \Illuminate\Support\Collection<int, AttendanceListe>,
     *     notesByUserId: \Illuminate\Support\Collection<int, string>
     * }
     */
    public function preloadSaveContext(int $attendanceId, array $userIds): array
    {
        $userIds = array_values(array_unique(array_map('intval', $userIds)));

        $rowsByUserId = AttendanceListe::query()
            ->where('attendance_id', $attendanceId)
            ->whereIn('user_id', $userIds)
            ->get()
            ->keyBy('user_id');

        $notesByUserId = Note::query()
            ->where('attendance_id', $attendanceId)
            ->whereIn('user_id', $userIds)
            ->orderBy('id')
            ->get()
            ->groupBy('user_id')
            ->map(fn ($group) => $group->pluck('note')->implode(' | '));

        return [
            'rowsByUserId' => $rowsByUserId,
            'notesByUserId' => $notesByUserId,
        ];
    }

    /**
     * Merge coach-submitted slot values with preserved student check-in slots.
     *
     * @param  array<string, string|null>  $coachSlots
     * @param  array{
     *     rowsByUserId: \Illuminate\Support\Collection<int, AttendanceListe>,
     *     notesByUserId: \Illuminate\Support\Collection<int, string>
     * }|null  $preloadedContext
     * @return array{morning: string, lunch: string, evening: string}
     */
    public function resolveSlotsForSave(
        int $attendanceId,
        int $userId,
        string $attendanceDay,
        array $coachSlots,
        ?array $preloadedContext = null,
    ): array {
        if ($preloadedContext !== null) {
            $existingRow = $preloadedContext['rowsByUserId']->get($userId);
            $pipeJoinedNotes = $preloadedContext['notesByUserId']->get($userId, '');
        } else {
            $existingRow = AttendanceListe::query()
                ->where('attendance_id', $attendanceId)
                ->where('user_id', $userId)
                ->first();

            $pipeJoinedNotes = Note::query()
                ->where('user_id', $userId)
                ->where('attendance_id', $attendanceId)
                ->orderBy('id')
                ->pluck('note')
                ->implode(' | ');
        }

        $existingSlots = $existingRow
            ? [
                'morning' => $existingRow->morning,
                'lunch' => $existingRow->lunch,
                'evening' => $existingRow->evening,
            ]
            : null;

        $studentMarked = $this->studentCheckInSlotService->studentMarkedSlots(
            $attendanceDay,
            $pipeJoinedNotes !== '' ? $pipeJoinedNotes : null,
            $existingSlots,
        );

        $resolved = [];
        foreach ($this->slotService->slotOrder() as $slot) {
            if (in_array($slot, $studentMarked, true) && $existingRow !== null) {
                $existingValue = trim((string) ($existingRow->{$slot} ?? ''));
                $resolved[$slot] = $existingValue !== '' ? $existingValue : ($coachSlots[$slot] ?? 'absent');
            } else {
                $resolved[$slot] = $coachSlots[$slot] ?? 'absent';
            }
        }

        return $resolved;
    }
}
