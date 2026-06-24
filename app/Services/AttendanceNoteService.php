<?php

namespace App\Services;

use App\Models\Note;
use Illuminate\Support\Facades\DB;

class AttendanceNoteService
{
    /**
     * Replace all attendance notes for a user/day with the submitted pipe-joined list.
     */
    public function syncNotes(int $userId, int $attendanceId, ?string $pipeJoinedNotes, string $author): void
    {
        $noteTexts = $this->parseNotes($pipeJoinedNotes);

        DB::transaction(function () use ($userId, $attendanceId, $noteTexts, $author) {
            Note::query()
                ->where('user_id', $userId)
                ->where('attendance_id', $attendanceId)
                ->delete();

            foreach ($noteTexts as $noteText) {
                Note::create([
                    'user_id' => $userId,
                    'attendance_id' => $attendanceId,
                    'note' => $noteText,
                    'author' => $author,
                ]);
            }
        });
    }

    /**
     * @return list<string>
     */
    private function parseNotes(?string $pipeJoinedNotes): array
    {
        if ($pipeJoinedNotes === null || trim($pipeJoinedNotes) === '') {
            return [];
        }

        return array_values(array_filter(array_map('trim', explode(' | ', $pipeJoinedNotes))));
    }
}
