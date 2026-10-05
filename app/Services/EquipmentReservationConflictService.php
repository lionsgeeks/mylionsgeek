<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class EquipmentReservationConflictService
{
    /**
     * Reject equipment that is already booked for an overlapping non-canceled reservation.
     *
     * @param  list<int|string>  $equipmentIds
     */
    public function assertAvailable(array $equipmentIds, string $day, string $start, string $end, ?int $ignoreReservationId = null): void
    {
        $ids = array_values(array_unique(array_map('intval', $equipmentIds)));
        $ids = array_values(array_filter($ids, fn (int $id) => $id > 0));

        if ($ids === [] || ! Schema::hasTable('reservation_equipment')) {
            return;
        }

        if (strtotime($start) >= strtotime($end)) {
            throw ValidationException::withMessages([
                'end' => ['End time must be after start time.'],
            ]);
        }

        $query = DB::table('reservation_equipment as re')
            ->join('reservations as r', 'r.id', '=', 're.reservation_id')
            ->whereIn('re.equipment_id', $ids)
            ->where('re.day', $day)
            ->where(function ($q) {
                $q->whereNull('r.canceled')->orWhere('r.canceled', 0);
            })
            ->where('re.start', '<', $end)
            ->where('re.end', '>', $start);

        if ($ignoreReservationId) {
            $query->where('re.reservation_id', '!=', $ignoreReservationId);
        }

        $conflict = $query
            ->select('re.equipment_id')
            ->first();

        if ($conflict) {
            throw ValidationException::withMessages([
                'equipment' => ['One or more selected equipment items are already reserved for this time.'],
            ]);
        }
    }
}
