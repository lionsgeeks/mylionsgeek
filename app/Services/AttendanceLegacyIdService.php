<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceListe;
use App\Models\Note;

class AttendanceLegacyIdService
{
    /**
     * Replace a legacy non-numeric attendance primary key with a fresh integer id,
     * migrating related list rows and notes.
     */
    public function ensureNumericId(Attendance $attendance, string $staffName): Attendance
    {
        $rawId = $attendance->getRawOriginal('id') ?? $attendance->getAttributes()['id'] ?? null;

        if ($rawId !== null && is_numeric($rawId)) {
            return $attendance;
        }

        $legacyId = $rawId ?? $attendance->id;

        $new = Attendance::create([
            'formation_id' => $attendance->formation_id,
            'attendance_day' => $attendance->attendance_day,
            'staff_name' => $staffName,
        ]);

        AttendanceListe::where('attendance_id', $legacyId)
            ->update(['attendance_id' => $new->id]);
        Note::where('attendance_id', $legacyId)
            ->update(['attendance_id' => $new->id]);

        return $new;
    }
}
