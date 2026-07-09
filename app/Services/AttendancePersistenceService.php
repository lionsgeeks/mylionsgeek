<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceListe;
use App\Models\User;

class AttendancePersistenceService
{
    public function __construct(
        private readonly DisciplineService $disciplineService,
        private readonly AttendanceNoteService $attendanceNoteService,
    ) {}

    /**
     * Persist one student's attendance row (updateOrCreate + discipline + notes + staff_name).
     *
     * @param  array{morning: string, lunch: string, evening: string}  $slots
     */
    public function persistStudentRow(
        int $attendanceId,
        int $userId,
        string $attendanceDay,
        array $slots,
        ?string $pipeJoinedNotes,
        string $authorName,
    ): AttendanceListe {
        $attendanceUser = User::findOrFail($userId);
        $oldDiscipline = $this->disciplineService->calculateDisciplineScore($attendanceUser);

        $row = AttendanceListe::updateOrCreate(
            [
                'attendance_id' => $attendanceId,
                'user_id' => $userId,
            ],
            [
                'attendance_day' => $attendanceDay,
                'morning' => $slots['morning'],
                'lunch' => $slots['lunch'],
                'evening' => $slots['evening'],
            ]
        );

        $this->disciplineService->processDisciplineChange($attendanceUser, $oldDiscipline);

        $this->attendanceNoteService->syncNotes(
            $userId,
            $attendanceId,
            $pipeJoinedNotes,
            $authorName,
        );

        Attendance::where('id', $attendanceId)->update(['staff_name' => $authorName]);

        return $row;
    }
}
