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
}


