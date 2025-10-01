<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class ReservationsController extends Controller
{
    public function index()
    {
        // Base reservations
        $reservations = DB::table('reservations as r')
            ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
            ->select('r.*', 'u.name as user_name')
            ->orderByDesc('r.created_at')
            ->get();

        // Supplementary data keyed by reservation_id
        $placeByReservation = [];
        if (Schema::hasTable('reservation_places') && Schema::hasTable('places')) {
            DB::table('reservation_places as rp')
                ->leftJoin('places as p', 'p.id', '=', 'rp.places_id')
                ->select('rp.reservation_id', 'p.name as place_name', 'p.place_type')
                ->orderByDesc('rp.id')
                ->get()
                ->each(function ($row) use (&$placeByReservation) {
                    $placeByReservation[$row->reservation_id] = [
                        'place_name' => $row->place_name,
                        'place_type' => $row->place_type,
                    ];
                });
        }

        $equipmentsByReservation = [];
        if (Schema::hasTable('reservation_equipements') && Schema::hasTable('equipment')) {
            DB::table('reservation_equipements as re')
                ->leftJoin('equipment as e', 'e.id', '=', 're.equipment_id')
                ->select('re.reservation_id', DB::raw("group_concat(trim(coalesce(e.reference, e.mark, 'equipment')), ', ') as equipments"))
                ->groupBy('re.reservation_id')
                ->get()
                ->each(function ($row) use (&$equipmentsByReservation) {
                    $equipmentsByReservation[$row->reservation_id] = $row->equipments;
                });
        }

        $teamsByReservation = [];
        if (Schema::hasTable('reservation_teams') && Schema::hasTable('teams')) {
            // Try to collect team name and members via team_user pivot if present
            $hasTeamUser = Schema::hasTable('team_user');
            $query = DB::table('reservation_teams as rt')
                ->leftJoin('teams as t', 't.id', '=', 'rt.team_id')
                ->select('rt.reservation_id', 't.name as team_name');
            $rows = $query->get();
            foreach ($rows as $row) {
                $teamsByReservation[$row->reservation_id] = [
                    'team_name' => $row->team_name,
                    'members' => null,
                ];
            }
            if ($hasTeamUser && Schema::hasTable('users')) {
                $memberRows = DB::table('reservation_teams as rt')
                    ->leftJoin('teams as t', 't.id', '=', 'rt.team_id')
                    ->leftJoin('team_user as tu', 'tu.team_id', '=', 't.id')
                    ->leftJoin('users as u', 'u.id', '=', 'tu.user_id')
                    ->select('rt.reservation_id', DB::raw("group_concat(u.name, ', ') as members"))
                    ->groupBy('rt.reservation_id')
                    ->get();
                foreach ($memberRows as $mr) {
                    if (!isset($teamsByReservation[$mr->reservation_id])) {
                        $teamsByReservation[$mr->reservation_id] = [
                            'team_name' => null,
                            'members' => $mr->members,
                        ];
                    } else {
                        $teamsByReservation[$mr->reservation_id]['members'] = $mr->members;
                    }
                }
            }
        }

        // Studio name by reservation (for base list where type=studio)
        $studioByReservation = [];
        if (Schema::hasTable('reservations') && Schema::hasTable('studios')) {
            DB::table('reservations as r')
                ->leftJoin('studios as s', 's.id', '=', 'r.studio_id')
                ->where('r.type', 'studio')
                ->select('r.id as reservation_id', 's.name as studio_name')
                ->get()
                ->each(function ($row) use (&$studioByReservation) {
                    $studioByReservation[$row->reservation_id] = $row->studio_name;
                });
        }

        $enriched = $reservations->map(function ($r) use ($placeByReservation, $equipmentsByReservation, $teamsByReservation) {
            $place = $placeByReservation[$r->id] ?? null;
            $team = $teamsByReservation[$r->id] ?? null;
            return [
                'id' => $r->id,
                'user_name' => $r->user_name,
                'date' => $r->date ?? $r->day ?? null,
                'start' => $r->start ?? null,
                'end' => $r->end ?? null,
                'type' => $r->type ?? null,
                'title' => $r->title ?? null,
                'description' => $r->description ?? null,
                'approved' => (bool) ($r->approved ?? 0),
                'start_signed' => (bool) ($r->start_signed ?? 0),
                'end_signed' => (bool) ($r->end_signed ?? 0),
                'canceled' => (bool) ($r->canceled ?? 0),
                'passed' => (bool) ($r->passed ?? 0),
                'place_name' => $place['place_name'] ?? null,
                'place_type' => $place['place_type'] ?? null,
                'equipments' => $equipmentsByReservation[$r->id] ?? null,
                'team_name' => $team['team_name'] ?? null,
                'team_members' => $team['members'] ?? null,
            ];
        });

        // Attach studio_name for studio reservations
        if (!empty($studioByReservation)) {
            $enriched = $enriched->map(function ($row) use ($studioByReservation) {
                if (($row['type'] ?? null) === 'studio') {
                    $row['studio_name'] = $studioByReservation[$row['id']] ?? null;
                }
                return $row;
            });
        }

        // Places reservations (pivot)
        // Cowork reservations (own table)
        $coworkReservations = [];
        if (Schema::hasTable('reservation_coworks')) {
            $coworkReservations = DB::table('reservation_coworks as rc')
                ->leftJoin('users as u', 'u.id', '=', 'rc.user_id')
                ->select('rc.*', 'u.name as user_name')
                ->orderByDesc('rc.created_at')
                ->get();
        }

        // Studio reservations (main reservations table with type=studio and studio_id)
        $studioReservations = [];
        if (Schema::hasTable('reservations') && Schema::hasTable('studios')) {
            $studioReservations = DB::table('reservations as r')
                ->leftJoin('studios as s', 's.id', '=', 'r.studio_id')
                ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
                ->where('r.type', 'studio')
                ->select('r.*', 's.name as studio_name', 'u.name as user_name')
                ->orderByDesc('r.created_at')
                ->get();
        }

        return Inertia::render('admin/reservations/index', [
            'reservations' => $enriched,
            'coworkReservations' => $coworkReservations,
            'studioReservations' => $studioReservations,
        ]);
    }

    public function approve(int $reservation)
    {
        if (!Schema::hasTable('reservations')) {
            return back()->with('error', 'Reservations table missing');
        }
        DB::table('reservations')->where('id', $reservation)->update([
            'approved' => 1,
            'canceled' => 0,
            'updated_at' => now(),
        ]);
        return back()->with('success', 'Reservation approved');
    }

    public function cancel(int $reservation)
    {
        if (!Schema::hasTable('reservations')) {
            return back()->with('error', 'Reservations table missing');
        }
        DB::table('reservations')->where('id', $reservation)->update([
            'canceled' => 1,
            'approved' => 0,
            'updated_at' => now(),
        ]);
        return back()->with('success', 'Reservation canceled');
    }

    public function byPlace(string $type, int $id)
    {
        // Normalize events to FullCalendar format
        $events = [];

        if ($type === 'cowork' && Schema::hasTable('reservation_coworks')) {
            $rows = DB::table('reservation_coworks as rc')
                ->leftJoin('users as u', 'u.id', '=', 'rc.user_id')
                ->select('rc.*', 'u.name as user_name')
                ->where('rc.table', $id)
                ->where('rc.canceled', 0)
                ->get();

            foreach ($rows as $r) {
                $events[] = [
                    'title' => 'Cowork — Table ' . $r->table . ($r->user_name ? ' — ' . $r->user_name : ''),
                    'start' => trim(($r->day ?? '') . 'T' . ($r->start ?? '')),
                    'end' => trim(($r->day ?? '') . 'T' . ($r->end ?? '')),
                    'allDay' => false,
                    'extendedProps' => [
                        'approved' => (bool) ($r->approved ?? 0),
                        'canceled' => (bool) ($r->canceled ?? 0),
                        'passed' => (bool) ($r->passed ?? 0),
                        'user_name' => $r->user_name,
                        'type' => 'cowork',
                    ],
                ];
            }
        }

        if ($type === 'studio' && Schema::hasTable('reservations')) {
            $rows = DB::table('reservations as r')
                ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
                ->leftJoin('studios as s', 's.id', '=', 'r.studio_id')
                ->select('r.*', 'u.name as user_name', 's.name as studio_name')
                ->where('r.type', 'studio')
                ->where('r.studio_id', $id)
                ->where('r.canceled', 0)
                ->get();

            foreach ($rows as $r) {
                $date = $r->date ?? $r->day ?? null;
                $events[] = [
                    'title' => ($r->title ?: 'Studio') . ($r->studio_name ? ' — ' . $r->studio_name : '') . ($r->user_name ? ' — ' . $r->user_name : ''),
                    'start' => $date ? trim($date . 'T' . ($r->start ?? '')) : null,
                    'end' => $date ? trim($date . 'T' . ($r->end ?? '')) : null,
                    'allDay' => false,
                    'extendedProps' => [
                        'approved' => (bool) ($r->approved ?? 0),
                        'canceled' => (bool) ($r->canceled ?? 0),
                        'passed' => (bool) ($r->passed ?? 0),
                        'user_name' => $r->user_name,
                        'type' => 'studio',
                        'description' => $r->description,
                        'studio_name' => $r->studio_name,
                    ],
                ];
            }
        }

        if ($type === 'meeting_room' && Schema::hasTable('reservations')) {
            $hasMeetingRooms = Schema::hasTable('meeting_rooms');
            $query = DB::table('reservations as r')
                ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
                ->select('r.*', 'u.name as user_name');
            if ($hasMeetingRooms) {
                $query->leftJoin('meeting_rooms as m', 'm.id', '=', 'r.meeting_room_id')
                    ->addSelect('m.name as room_name');
            }
            $rows = $query
                ->where('r.type', 'meeting_room')
                ->where('r.meeting_room_id', $id)
                ->where('r.canceled', 0)
                ->get();

            foreach ($rows as $r) {
                $date = $r->date ?? $r->day ?? null;
                $events[] = [
                    'title' => ($r->title ?: 'Meeting') . ((isset($r->room_name) && $r->room_name) ? ' — ' . $r->room_name : '') . ($r->user_name ? ' — ' . $r->user_name : ''),
                    'start' => $date ? trim($date . 'T' . ($r->start ?? '')) : null,
                    'end' => $date ? trim($date . 'T' . ($r->end ?? '')) : null,
                    'allDay' => false,
                    'extendedProps' => [
                        'approved' => (bool) ($r->approved ?? 0),
                        'canceled' => (bool) ($r->canceled ?? 0),
                        'passed' => (bool) ($r->passed ?? 0),
                        'user_name' => $r->user_name,
                        'type' => 'meeting_room',
                        'description' => $r->description,
                    ],
                ];
            }
        }

        return response()->json($events);
    }
}


