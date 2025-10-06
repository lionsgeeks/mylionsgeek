<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Equipment;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

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
        if (Schema::hasTable('reservation_equipment') && Schema::hasTable('equipment')) {
            $hasEquipmentImage = Schema::hasTable('equipment') && Schema::hasColumn('equipment', 'image');
            $query = DB::table('reservation_equipment as re')
                ->leftJoin('equipment as e', 'e.id', '=', 're.equipment_id')
                ->select('re.reservation_id', 'e.id as equipment_id', 'e.reference', 'e.mark');
            if ($hasEquipmentImage) {
                $query->addSelect('e.image');
            }
            $rows = $query->get();
            foreach ($rows as $row) {
                $img = isset($row->image) ? $row->image : null;
                if ($img) {
                    if (!Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                        $img = 'storage/img/equipment/'.ltrim($img, '/');
                    }
                    $img = asset($img);
                }
                $equipmentsByReservation[$row->reservation_id] = $equipmentsByReservation[$row->reservation_id] ?? [];
                $equipmentsByReservation[$row->reservation_id][] = [
                    'id' => $row->equipment_id,
                    'reference' => $row->reference,
                    'mark' => $row->mark,
                    'image' => $img,
                ];
            }
        }

        $teamsByReservation = [];
        if (Schema::hasTable('reservation_teams') && Schema::hasTable('users')) {
            // In this schema, reservation_teams links users directly to reservations
            $userImageColumn = Schema::hasColumn('users', 'image') ? 'image' : (Schema::hasColumn('users', 'profile_photo_path') ? 'profile_photo_path' : null);
            $memberQuery = DB::table('reservation_teams as rt')
                ->leftJoin('users as u', 'u.id', '=', 'rt.user_id')
                ->select('rt.reservation_id', 'u.id as user_id', 'u.name');
            if ($userImageColumn) {
                $memberQuery->addSelect('u.' . $userImageColumn . ' as image');
            }
            $members = $memberQuery->get();
            foreach ($members as $m) {
                $uimg = isset($m->image) ? $m->image : null;
                if ($uimg) {
                    if (!Str::startsWith($uimg, ['http://', 'https://', 'storage/'])) {
                        $uimg = 'storage/img/profile/'.ltrim($uimg, '/');
                    }
                    $uimg = asset($uimg);
                }
                $teamsByReservation[$m->reservation_id] = $teamsByReservation[$m->reservation_id] ?? [ 'team_name' => null, 'members' => [] ];
                $teamsByReservation[$m->reservation_id]['members'][] = [
                    'id' => $m->user_id,
                    'name' => $m->name,
                    'image' => $uimg,
                ];
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
                'equipments' => $equipmentsByReservation[$r->id] ?? [],
                'team_name' => $team['team_name'] ?? null,
                'team_members' => $team['members'] ?? [],
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

    public function info(int $reservation)
    {
        $result = [
            'reservation_id' => $reservation,
            'team_name' => null,
            'team_members' => [],
            'equipments' => [],
        ];

        // Team name and members with images
        if (Schema::hasTable('reservation_teams') && Schema::hasTable('teams')) {
            $team = DB::table('reservation_teams as rt')
                ->leftJoin('teams as t', 't.id', '=', 'rt.team_id')
                ->where('rt.reservation_id', $reservation)
                ->select('t.id as team_id', 't.name as team_name')
                ->first();
            if ($team) {
                $result['team_name'] = $team->team_name;
                if (Schema::hasTable('team_user') && Schema::hasTable('users')) {
                    $userImageColumn = Schema::hasColumn('users', 'image') ? 'image' : (Schema::hasColumn('users', 'profile_photo_path') ? 'profile_photo_path' : null);
                    $q = DB::table('team_user as tu')
                        ->leftJoin('users as u', 'u.id', '=', 'tu.user_id')
                        ->where('tu.team_id', $team->team_id)
                        ->select('u.id as user_id', 'u.name');
                    if ($userImageColumn) {
                        $q->addSelect('u.' . $userImageColumn . ' as image');
                    }
                    $members = $q->get()->map(function ($u) {
                        return [
                            'id' => $u->user_id,
                            'name' => $u->name,
                            'image' => isset($u->image) && $u->image ? asset($u->image) : null,
                        ];
                    })->values()->all();
                    $result['team_members'] = $members;
                }
            }
        } elseif (Schema::hasTable('reservation_teams') && Schema::hasTable('users')) {
            // Fallback schema: reservation_teams links users directly to reservations
            $userImageColumn = Schema::hasColumn('users', 'image') ? 'image' : (Schema::hasColumn('users', 'profile_photo_path') ? 'profile_photo_path' : null);
            $q = DB::table('reservation_teams as rt')
                ->leftJoin('users as u', 'u.id', '=', 'rt.user_id')
                ->where('rt.reservation_id', $reservation)
                ->select('u.id as user_id', 'u.name');
            if ($userImageColumn) {
                $q->addSelect('u.' . $userImageColumn . ' as image');
            }
            $members = $q->get()->map(function ($u) {
                $img = isset($u->image) ? $u->image : null;
                if ($img) {
                    if (!Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                        $img = 'storage/img/profile/'.ltrim($img, '/');
                    }
                    $img = asset($img);
                }
                return [
                    'id' => $u->user_id,
                    'name' => $u->name,
                    'image' => $img,
                ];
            })->values()->all();
            $result['team_members'] = $members;
        }

        // Equipments with image, reference, mark
        if (Schema::hasTable('reservation_equipment') && Schema::hasTable('equipment')) {
            $hasEquipmentImage = Schema::hasColumn('equipment', 'image');
            $eq = DB::table('reservation_equipment as re')
                ->leftJoin('equipment as e', 'e.id', '=', 're.equipment_id')
                ->where('re.reservation_id', $reservation)
                ->select('e.id as equipment_id', 'e.reference', 'e.mark');
            if ($hasEquipmentImage) {
                $eq->addSelect('e.image');
            }
            $result['equipments'] = $eq->get()->map(function ($e) {
                $img = isset($e->image) ? $e->image : null;
                if ($img) {
                    if (!Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                        $img = 'storage/img/equipment/'.ltrim($img, '/');
                    }
                    $img = asset($img);
                }
                return [
                    'id' => $e->equipment_id,
                    'reference' => $e->reference,
                    'mark' => $e->mark,
                    'image' => $img,
                ];
            })->values()->all();
        }

        return response()->json($result);
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

    /**
     * Get all users for team member selector modal
     */
    public function getUsers()
    {
        $users = User::select('id', 'name', 'image')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                $img = $user->image;
                if ($img && !Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                    $img = 'storage/img/profile/' . ltrim($img, '/');
                }
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'image' => $img ? asset($img) : null,
                ];
            });

        return response()->json($users);
    }

    /**
     * Get all equipment for equipment selector modal
     */
    public function getEquipment()
    {
        $equipment = Equipment::with('equipmentType')
            ->where('state', 1) // Only available equipment
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($e) {
                $img = $e->image;
                if ($img && !Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                    $img = 'storage/img/equipment/' . ltrim($img, '/');
                }
                return [
                    'id' => $e->id,
                    'reference' => $e->reference,
                    'mark' => $e->mark,
                    'type' => $e->equipmentType->name ?? 'other',
                    'image' => $img ? asset($img) : null,
                ];
            });

        return response()->json($equipment);
    }

    /**
     * Store new reservation with teams and equipment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'studio_id' => 'required|integer|exists:studios,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'day' => 'required|date',
            'start' => 'required|string',
            'end' => 'required|string',
            'team_members' => 'nullable|array',
            'team_members.*' => 'integer|exists:users,id',
            'equipment' => 'nullable|array',
            'equipment.*' => 'integer|exists:equipment,id',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $lastId = (int) (DB::table('reservations')->max('id') ?? 0);
                $reservationId = $lastId + 1;

                DB::table('reservations')->insert([
                    'id' => $reservationId,
                    'studio_id' => $validated['studio_id'],
                    'user_id' => auth()->id(),
                    'title' => $validated['title'],
                    'description' => $validated['description'] ?? '',
                    'day' => $validated['day'],
                    'start' => $validated['start'],
                    'end' => $validated['end'],
                    'type' => 'studio',
                    'approved' => 0,
                    'canceled' => 0,
                    'passed' => 0,
                    'start_signed' => 0,
                    'end_signed' => 0,
                    'created_at' => now()->toDateTimeString(),
                    'updated_at' => now()->toDateTimeString(),
                ]);

                // Insert team members
                if (!empty($validated['team_members'])) {
                    $teamData = array_map(function ($userId) use ($reservationId) {
                        return [
                            'reservation_id' => $reservationId,
                            'user_id' => $userId,
                            'created_at' => now()->toDateTimeString(),
                            'updated_at' => now()->toDateTimeString(),
                        ];
                    }, $validated['team_members']);
                    
                    DB::table('reservation_teams')->insert($teamData);
                }

                // Insert equipment
                if (!empty($validated['equipment'])) {
                    $equipmentData = array_map(function ($equipmentId) use ($validated, $reservationId) {
                        return [
                            'reservation_id' => $reservationId,
                            'equipment_id' => $equipmentId,
                            'day' => $validated['day'],
                            'start' => $validated['start'],
                            'end' => $validated['end'],
                            'created_at' => now()->toDateTimeString(),
                            'updated_at' => now()->toDateTimeString(),
                        ];
                    }, $validated['equipment']);
                    
                    DB::table('reservation_equipment')->insert($equipmentData);
                }
            });

            return back()->with('success', 'Reservation created successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create reservation: ' . $e->getMessage());
        }
    }


    /**
     * Show studio calendar page
     */
    public function studioCalendar(int $studio)
    {
        $studioData = DB::table('studios')->where('id', $studio)->first();
        
        if (!$studioData) {
            return redirect()->route('admin.places')->with('error', 'Studio not found');
        }

        return Inertia::render('admin/places/studios/calendar', [
            'studio' => [
                'id' => $studioData->id,
                'name' => $studioData->name,
                'image' => $studioData->image ?? null,
            ],
        ]);
    }

}


