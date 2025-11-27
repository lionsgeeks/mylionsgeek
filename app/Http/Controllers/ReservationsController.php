<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Equipment;
use App\Models\Reservation;
use App\Models\ReservationCowork;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Mail\ReservationApprovedMail;
use App\Mail\ReservationCanceledMail;
use App\Mail\ReservationCreatedAdminMail;
use App\Mail\ReservationTimeAcceptedAdminMail;
use App\Mail\ReservationTimeDeclinedAdminMail;
use App\Mail\ReservationTimeProposalMail;
use App\Mail\ReservationTimeSuggestedAdminMail;

class ReservationsController extends Controller
{
    private const ACCESS_BYPASS_ROLES = ['admin', 'super_admin', 'moderateur', 'coach', 'studio_responsable'];
    public function index(Request $request)
    {

        if ($request->has('export') && $request->get('export') === 'true') {
            return $this->exportData($request);
        }
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
                        $img = 'storage/img/equipment/' . ltrim($img, '/');
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
                        $uimg = 'storage/img/profile/' . ltrim($uimg, '/');
                    }
                    $uimg = asset($uimg);
                }
                $teamsByReservation[$m->reservation_id] = $teamsByReservation[$m->reservation_id] ?? ['team_name' => null, 'members' => []];
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
                'day' => $r->day ?? $r->date ?? null,
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
                'created_at' => $r->created_at ?? null,
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
            // Auto-approve any pending cowork reservations
            DB::table('reservation_coworks')
                ->where('approved', 0)
                ->where('canceled', 0)
                ->update([
                    'approved' => 1,
                    'updated_at' => now(),
                ]);

            $coworkReservations = DB::table('reservation_coworks as rc')
                ->leftJoin('users as u', 'u.id', '=', 'rc.user_id')
                ->select('rc.*', 'u.name as user_name')
                ->orderByDesc('rc.created_at')
                ->get();
        }

        // Studio reservations subset with equipment & team info
        $studioReservations = $enriched->filter(function ($row) {
            return ($row['type'] ?? null) === 'studio';
        })->values();

        // Meeting room reservations (type=meeting_room with meeting_room_id)
        $meetingRoomReservations = DB::table('reservation_meeting_rooms as rm')
            ->leftJoin('users as u', 'u.id', '=', 'rm.user_id')
            ->leftJoin('meeting_rooms as m', 'm.id', '=', 'rm.meeting_room_id')
            ->select('rm.*', 'u.name as user_name', 'm.name as room_name')
            ->orderByDesc('rm.created_at')
            ->get();

        return Inertia::render('admin/reservations/index', [
            'reservations' => $enriched,
            'coworkReservations' => $coworkReservations,
            'studioReservations' => $studioReservations,
            'meetingRoomReservations' => $meetingRoomReservations,
        ]);
    }

    public function approve(int $reservation)
    {
        if (!Schema::hasTable('reservations')) {
            return back()->with('error', 'Reservations table missing');
        }

        // Get the reservation details before updating
        $reservationData = DB::table('reservations')->where('id', $reservation)->first();
        if (!$reservationData) {
            return back()->with('error', 'Reservation not found');
        }

        // Get the user who made the reservation
        $user = DB::table('users')->where('id', $reservationData->user_id)->first();
        if (!$user) {
            return back()->with('error', 'User not found');
        }

        // Update the reservation
        DB::table('reservations')->where('id', $reservation)->update([
            'approved' => 1,
            'approve_id' => auth()->id(),
            'canceled' => 0,
            'updated_at' => now(),
        ]);

        // Send approval email to reservation owner
        try {
            $this->sendMailToReservationOwner($user, new ReservationApprovedMail($user, $reservationData));
        } catch (\Exception $e) {
            // Log the error but don't fail the approval
            \Log::error('Failed to send approval email: ' . $e->getMessage());
        }

        // Log equipment usage to activity_log (one row per equipment) on approval
        try {
            if (Schema::hasTable('activity_log') && Schema::hasTable('reservation_equipment')) {
                $equipmentLinks = DB::table('reservation_equipment')
                    ->where('reservation_id', $reservation)
                    ->get();

                if ($equipmentLinks->count() > 0) {
                    $rowsToInsert = [];
                    foreach ($equipmentLinks as $link) {
                        $day = $link->day ?? ($reservationData->day ?? null);
                        $startTime = $link->start ?? ($reservationData->start ?? null);
                        $endTime  = $link->end ?? ($reservationData->end ?? null);


                        $startDate = (string) ($day ?? '') . ' ' . ($startTime ?? '');
                        $endDate = (string) ($day ?? '') . ' ' . ($endTime ?? '');
                        $properties = json_encode([
                            'start' => $startDate,
                            'end' => $endDate,
                        ]);

                        // Idempotency guard to avoid duplicate rows on repeated approvals
                        $exists = DB::table('activity_log')
                            ->where('log_name', 'equipment')
                            ->where('description', 'equipment history')
                            ->where('subject_type', 'App\\Models\\Equipment')
                            ->where('subject_id', $link->equipment_id)
                            ->where('causer_type', 'App\\Models\\User')
                            ->where('causer_id', $reservationData->user_id)
                            ->where('event', 'approved')
                            ->where('properties', $properties)
                            ->exists();

                        if (!$exists) {
                            $rowsToInsert[] = [
                                'log_name' => 'equipment',
                                'description' => 'equipment history',
                                'subject_type' => 'App\\Models\\Equipment',
                                'subject_id' => $link->equipment_id,
                                'event' => 'approved',
                                'causer_type' => 'App\\Models\\User',
                                'causer_id' => $reservationData->user_id,
                                'properties' => $properties,
                                'created_at' => now()->toDateTimeString(),
                                'updated_at' => now()->toDateTimeString(),
                            ];
                        }
                    }

                    if (!empty($rowsToInsert)) {
                        DB::table('activity_log')->insert($rowsToInsert);
                    }
                }
            }
        } catch (\Throwable $e) {
            \Log::error('Failed to write equipment approval activity logs: ' . $e->getMessage());
        }

        return back()->with('success', 'Reservation approved');
    }

    public function cancel(int $reservation)
    {
        if (!Schema::hasTable('reservations')) {
            return back()->with('error', 'Reservations table missing');
        }

        // Get the reservation details before updating
        $reservationData = DB::table('reservations')->where('id', $reservation)->first();
        if (!$reservationData) {
            return back()->with('error', 'Reservation not found');
        }

        // Get the user who made the reservation
        $user = DB::table('users')->where('id', $reservationData->user_id)->first();
        if (!$user) {
            return back()->with('error', 'User not found');
        }

        // Update the reservation
        DB::table('reservations')->where('id', $reservation)->update([
            'canceled' => 1,
            'approved' => 0,
            'updated_at' => now(),
        ]);

        // Send cancellation email to reservation owner
        try {
            $this->sendMailToReservationOwner($user, new ReservationCanceledMail($user, $reservationData));
        } catch (\Exception $e) {
            // Log the error but don't fail the cancellation
            \Log::error('Failed to send cancellation email: ' . $e->getMessage());
        }

        return back()->with('success', 'Reservation canceled');
    }

    public function update(Request $request, int $reservation)
    {
        if (!Schema::hasTable('reservations')) {
            return back()->with('error', 'Reservations table missing');
        }

        // Get the reservation
        $reservationData = DB::table('reservations')->where('id', $reservation)->first();
        if (!$reservationData) {
            return back()->with('error', 'Reservation not found');
        }

        // Check if reservation is pending (not approved and not canceled)
        if ($reservationData->approved || $reservationData->canceled) {
            return back()->with('error', 'Only pending reservations can be updated');
        }

        // Check authorization: user must be the owner OR admin
        $user = auth()->user();
        $isOwner = (int) $reservationData->user_id === (int) $user->id;
        
        // Handle roles - ensure it's always an array
        $userRoles = is_array($user->role) ? $user->role : (is_string($user->role) ? json_decode($user->role, true) ?? [$user->role] : [$user->role]);
        $isAdmin = in_array('admin', $userRoles) || in_array('super_admin', $userRoles) || in_array('studio_responsable', $userRoles);

        if (!$isOwner && !$isAdmin) {
            return back()->with('error', 'You do not have permission to update this reservation');
        }

        // Validate request
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
            DB::transaction(function () use ($validated, $reservation) {
                // Update the reservation
                DB::table('reservations')->where('id', $reservation)->update([
                    'studio_id' => $validated['studio_id'],
                    'title' => $validated['title'],
                    'description' => $validated['description'] ?? '',
                    'day' => $validated['day'],
                    'start' => $validated['start'],
                    'end' => $validated['end'],
                    'updated_at' => now()->toDateTimeString(),
                ]);

                // Delete existing team members
                if (Schema::hasTable('reservation_teams')) {
                    DB::table('reservation_teams')->where('reservation_id', $reservation)->delete();
                }

                // Insert new team members
                if (!empty($validated['team_members'])) {
                    $teamData = array_map(function ($userId) use ($reservation) {
                        return [
                            'reservation_id' => $reservation,
                            'user_id' => $userId,
                            'created_at' => now()->toDateTimeString(),
                            'updated_at' => now()->toDateTimeString(),
                        ];
                    }, $validated['team_members']);

                    DB::table('reservation_teams')->insert($teamData);
                }

                // Delete existing equipment
                if (Schema::hasTable('reservation_equipment')) {
                    DB::table('reservation_equipment')->where('reservation_id', $reservation)->delete();
                }

                // Insert new equipment
                if (!empty($validated['equipment'])) {
                    $equipmentData = array_map(function ($equipmentId) use ($validated, $reservation) {
                        return [
                            'reservation_id' => $reservation,
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

            return back()->with('success', 'Reservation updated successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update reservation: ' . $e->getMessage());
        }
    }

    public function info(int $reservation)
    {
        // Get reservation verification notes
        $verificationNotes = null;
        if (Schema::hasTable('reservations')) {
            $res = DB::table('reservations')->where('id', $reservation)->first();
            $verificationNotes = $res->verification_notes ?? null;
        }

        $result = [
            'reservation_id' => $reservation,
            'team_name' => null,
            'team_members' => [],
            'equipments' => [],
            'verification_notes' => $verificationNotes,
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
                        $img = 'storage/img/profile/' . ltrim($img, '/');
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
            $result['equipments'] = $eq->get()->map(function ($e) use ($reservation) {
                $img = isset($e->image) ? $e->image : null;
                if ($img) {
                    if (!Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                        $img = 'storage/img/equipment/' . ltrim($img, '/');
                    }
                    $img = asset($img);
                }

                // Get verification data for this equipment if available
                $verification = null;
                if (Schema::hasTable('equipment_verifications')) {
                    $verification = DB::table('equipment_verifications')
                        ->where('reservation_id', $reservation)
                        ->where('equipment_id', $e->equipment_id)
                        ->first();
                }

                return [
                    'id' => $e->equipment_id,
                    'reference' => $e->reference,
                    'mark' => $e->mark,
                    'image' => $img,
                    'verification' => $verification ? [
                        'good_condition' => (bool) $verification->good_condition,
                        'bad_condition' => (bool) $verification->bad_condition,
                        'not_returned' => (bool) $verification->not_returned,
                        'equipment_notes' => $verification->equipment_notes,
                    ] : null,
                ];
            })->values()->all();
        }

        return response()->json($result);
    }

    public function byPlace(string $type, int $id)
    {
        $reservations = [];

        if ($type === 'studio') {
            $reservations = DB::table('reservations as r')
                ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
                ->where('r.studio_id', $id)
                ->select(
                    'r.id',
                    'r.day as start',
                    'r.start as startTime',
                    'r.end as endTime',
                    'r.title',
                    'r.approved',
                    'r.canceled',
                    'r.user_id as user_id',
                    'r.created_at',
                    'u.name as user_name'
                )
                ->orderByDesc('r.created_at')
                ->get()
                ->map(function ($r) {
                    return [
                        'id' => $r->id,
                        'title' => $r->title . ' — ' . $r->user_name,
                        'start' => $r->start . 'T' . $r->startTime,
                        'end' => $r->start . 'T' . $r->endTime,
                        'backgroundColor' => $r->canceled ? '#6b7280' : ($r->approved ? '#FFC801' : '#f59e0b'),
                        'user_id' => $r->user_id,
                        'canceled' => (bool) $r->canceled,
                        'created_at' => $r->created_at ? (is_string($r->created_at) ? $r->created_at : $r->created_at->toDateTimeString()) : null,
                    ];
                });
        }

        if ($type === 'cowork') {
            $reservations = DB::table('reservation_coworks as rc')
                ->leftJoin('users as u', 'u.id', '=', 'rc.user_id')
                ->leftJoin('coworks as c', 'c.id', '=', 'rc.table')
                ->where('rc.table', $id)
                ->select(
                    'rc.id',
                    'rc.day as start',
                    'rc.start as startTime',
                    'rc.end as endTime',
                    'rc.approved',
                    'rc.canceled',
                    'rc.user_id as user_id',
                    'rc.created_at',
                    'u.name as user_name',
                    'c.table as table_number'
                )
                ->orderByDesc('rc.created_at')
                ->get()
                ->map(function ($r) {
                    return [
                        'id' => $r->id,
                        'title' => 'Table ' . $r->table_number . ' — ' . $r->user_name,
                        'start' => $r->start . 'T' . $r->startTime,
                        'end' => $r->start . 'T' . $r->endTime,
                        'backgroundColor' => $r->canceled ? '#6b7280' : ($r->approved ? '#FFC801' : '#f59e0b'),
                        'user_id' => $r->user_id,
                        'canceled' => (bool) $r->canceled,
                        'created_at' => $r->created_at ? (is_string($r->created_at) ? $r->created_at : $r->created_at->toDateTimeString()) : null,
                    ];
                });
        }

        if ($type === 'meeting_room') {
            $reservations = DB::table('reservation_meeting_rooms as rmr')
                ->leftJoin('users as u', 'u.id', '=', 'rmr.user_id')
                ->where('rmr.meeting_room_id', $id)
                ->select(
                    'rmr.id',
                    'rmr.day as start',
                    'rmr.start as startTime',
                    'rmr.end as endTime',
                    'rmr.approved',
                    'rmr.canceled',
                    'rmr.user_id as user_id',
                    'u.name as user_name'
                )
                ->get()
                ->map(function ($r) {
                    return [
                        'id' => $r->id,
                        'title' => 'Meeting Room — ' . $r->user_name,
                        'start' => $r->start . 'T' . $r->startTime,
                        'end' => $r->start . 'T' . $r->endTime,
                        'backgroundColor' => $r->canceled ? '#6b7280' : ($r->approved ? '#FFC801' : '#f59e0b'),
                        'user_id' => $r->user_id,
                        'canceled' => (bool) $r->canceled,
                    ];
                });
        }

        return response()->json($reservations);
    }

    /**
     * Get all users for team member selector modal
     */

    public function getUsers()
    {
        $authUser = auth()->user();

        $query = User::select('id', 'name', 'image')->orderBy('name');

        if (!in_array('admin', (array) $authUser->role)) {
            $query->whereJsonDoesntContain('role', 'admin');
        }

        $users = $query->get()->map(function ($user) {
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
     * Generate PDF using the reservation_combined.blade view
     */
    public function generatePdf(int $reservation)
    {
        try {
            $reservationData = $this->getReservationDetails($reservation);
            if (!$reservationData) {
                return response()->json(['error' => 'Reservation not found'], 404);
            }

            $pdf = Pdf::loadView('pdf.reservation_combined', ['reservation' => $reservationData])
                ->setPaper('a4', 'portrait');

            $userName = str_replace(' ', '_', $reservationData['user_name'] ?? 'User');
            $date = $reservationData['date'] ?? date('Y-m-d');
            $filename = "Reservation_{$userName}_{$date}.pdf";

            return $pdf->download($filename);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'PDF generation failed', 'message' => $e->getMessage()], 500);
        }
    }

    private function getReservationDetails(int $reservationId): ?array
    {
        $reservation = DB::table('reservations as r')
            ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
            ->where('r.id', $reservationId)
            ->select('r.*', 'u.name as user_name')
            ->first();

        if (!$reservation) {
            return null;
        }

        $equipments = [];
        if (Schema::hasTable('reservation_equipment') && Schema::hasTable('equipment')) {
            $equipments = DB::table('reservation_equipment as re')
                ->leftJoin('equipment as e', 'e.id', '=', 're.equipment_id')
                ->where('re.reservation_id', $reservationId)
                ->select('e.id', 'e.reference', 'e.mark', 'e.image')
                ->get()
                ->map(function ($e) {
                    return [
                        'id' => $e->id,
                        'reference' => $e->reference,
                        'mark' => $e->mark,
                        'image' => $e->image,
                    ];
                })
                ->toArray();
        }

        $teamMembers = [];
        if (Schema::hasTable('reservation_teams') && Schema::hasTable('users')) {
            $teamMembers = DB::table('reservation_teams as rt')
                ->leftJoin('users as u', 'u.id', '=', 'rt.user_id')
                ->where('rt.reservation_id', $reservationId)
                ->select('u.id', 'u.name', 'u.image')
                ->get()
                ->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'image' => $u->image,
                    ];
                })
                ->toArray();
        }

        // Get approver name by looking up the user with approve_id
        $approverName = null;
        if ($reservation->approve_id) {
            $approver = DB::table('users')->where('id', $reservation->approve_id)->first();
            $approverName = $approver ? $approver->name : null;
        }

        return [
            'id' => $reservation->id,
            'user_name' => $reservation->user_name,
            'date' => $reservation->date ?? $reservation->day,
            'start' => $reservation->start,
            'end' => $reservation->end,
            'title' => $reservation->title,
            'description' => $reservation->description,
            'approved' => (bool) ($reservation->approved ?? 0),
            'approver_name' => $approverName,
            'equipments' => $equipments,
            'team_members' => $teamMembers,
        ];
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

        $currentUser = auth()->user();
        if (!$this->userHasAccessFlag($currentUser, 'access_studio')) {
            return back()->with('error', 'You do not have permission to reserve a studio.');
        }

        try {
            $reservationId = null;

            DB::transaction(function () use ($validated, &$reservationId) {
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

            // Send admin notification email (outside transaction)
            try {
                \Log::info('Starting admin notification email process for reservation ID: ' . $reservationId);

                $studioResponsables = collect($this->studioResponsableEmails());

                \Log::info('Studio responsable emails found: ' . $studioResponsables->count());

                // Get the created reservation data for the email
                $createdReservation = DB::table('reservations')
                    ->leftJoin('studios', 'studios.id', '=', 'reservations.studio_id')
                    ->where('reservations.id', $reservationId)
                    ->select('reservations.*', 'studios.name as studio_name')
                    ->first();

                \Log::info('Reservation data: ' . json_encode($createdReservation));

                // Get the user who made the reservation
                $reservationUser = DB::table('users')->where('id', auth()->id())->first();

                \Log::info('User data: ' . json_encode($reservationUser));

                if ($studioResponsables->isEmpty()) {
                    \Log::warning('No studio responsable notification recipients configured. Skipping email dispatch.');
                } else {
                    foreach ($studioResponsables as $email) {
                        \Log::info('Sending reservation notification to: ' . $email);
                        Mail::to($email)->send(new ReservationCreatedAdminMail($reservationUser, $createdReservation));
                        \Log::info('Email sent successfully to: ' . $email);
                    }
                }
            } catch (\Exception $e) {
                // Log the error but don't fail the reservation creation
                \Log::error('Failed to send admin notification email: ' . $e->getMessage());
                \Log::error('Stack trace: ' . $e->getTraceAsString());
            }

            return back()->with('success', 'Reservation created successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create reservation: ' . $e->getMessage());
        }
    }

    /**
     * Check if a studio is available for the requested time slot.
     */
    public function checkStudioAvailability(Request $request)
    {
        $validated = $request->validate([
            'studio_id' => 'required|integer|exists:studios,id',
            'day' => 'required|date',
            'start' => 'required|string',
            'end' => 'required|string',
        ]);

        $conflicts = DB::table('reservations as r')
            ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
            ->where('r.studio_id', $validated['studio_id'])
            ->where('r.day', $validated['day'])
            ->where('r.canceled', 0)
            ->where(function ($query) use ($validated) {
                $query->where('r.start', '<', $validated['end'])
                    ->where('r.end', '>', $validated['start']);
            })
            ->select(
                'r.id',
                'r.start',
                'r.end',
                'r.title',
                'u.name as user_name'
            )
            ->orderBy('r.start')
            ->get();

        return response()->json([
            'available' => $conflicts->isEmpty(),
            'conflicts' => $conflicts,
        ]);
    }

    /**
     * Get equipment that is available for a given time range.
     */
    public function availableEquipment(Request $request)
    {
        $validated = $request->validate([
            'day' => 'required|date',
            'start' => 'required|string',
            'end' => 'required|string',
        ]);

        if (!Schema::hasTable('equipment')) {
            return response()->json([
                'available' => [],
                'unavailable_ids' => [],
            ]);
        }

        $reservedEquipmentIds = [];
        if (Schema::hasTable('reservation_equipment')) {
            $reservedEquipmentIds = DB::table('reservation_equipment')
                ->where('day', $validated['day'])
                ->where('start', '<', $validated['end'])
                ->where('end', '>', $validated['start'])
                ->pluck('equipment_id')
                ->map(fn($id) => (int) $id)
                ->unique()
                ->values()
                ->all();
        }

        $query = DB::table('equipment as e')
            ->leftJoin('equipment_types as et', 'et.id', '=', 'e.equipment_type_id')
            ->select('e.id', 'e.reference', 'e.mark', 'e.image', 'et.name as type_name')
            ->orderBy('e.mark');

        if (!empty($reservedEquipmentIds)) {
            $query->whereNotIn('e.id', $reservedEquipmentIds);
        }

        $available = $query
            ->get()
            ->map(function ($equipment) {
                $image = $equipment->image ?? null;
                $basePath = 'storage/img/equipment/';
                if ($image) {
                    if (Str::startsWith($image, ['http://', 'https://'])) {
                        $imageUrl = $image;
                    } else {
                        $normalized = Str::startsWith($image, ['storage/', '/storage/', 'img/'])
                            ? ltrim($image, '/')
                            : $basePath . ltrim($image, '/');
                        $imageUrl = asset(Str::startsWith($normalized, 'storage/') ? $normalized : 'storage/' . ltrim($normalized, '/'));
                    }
                } else {
                    $imageUrl = null;
                }

                return [
                    'id' => $equipment->id,
                    'reference' => $equipment->reference,
                    'mark' => $equipment->mark,
                    'image' => $imageUrl,
                    'type_name' => $equipment->type_name,
                ];
            })
            ->values();

        return response()->json([
            'available' => $available,
            'unavailable_ids' => $reservedEquipmentIds,
        ]);
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
    public function coworkCalendar(int $cowork)
    {
        $coworkData = DB::table('coworks')->where('id', $cowork)->first();

        if (!$coworkData) {
            return redirect()->route('admin.places')->with('error', 'Coworks not found');
        }

        return Inertia::render('admin/places/coworks/CoworkCalendar', [
            'cowork' => [
                'id' => $coworkData->id,
                'table' => $coworkData->table,
                'image' => $coworkData->image ?? null,
            ],
        ]);
    }

    public function meetingRoomCalendar(int $meetingRoom)
    {
        $meetingRoomData = DB::table('meeting_rooms')->where('id', $meetingRoom)->first();

        if (!$meetingRoomData) {
            return redirect()->route('admin.places')->with('error', 'Meeting room not found');
        }

        $events = DB::table('reservation_meeting_rooms as rmr')
            ->leftJoin('users as u', 'u.id', '=', 'rmr.user_id')
            ->where('rmr.meeting_room_id', $meetingRoom)
            ->select(
                'rmr.id',
                'rmr.day as start',
                'rmr.start as startTime',
                'rmr.end as endTime',
                'rmr.approved',
                'rmr.canceled',
                'rmr.user_id as user_id',
                'rmr.created_at',
                'u.name as user_name'
            )
            ->orderByDesc('rmr.created_at')
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'reservation_id' => $reservation->id,
                    'title' => 'Meeting Room — ' . ($reservation->user_name ?? 'Unknown'),
                    'start' => $reservation->start . 'T' . $reservation->startTime,
                    'end' => $reservation->start . 'T' . $reservation->endTime,
                    'backgroundColor' => $reservation->canceled ? '#6b7280' : ($reservation->approved ? '#FFC801' : '#f59e0b'),
                    'user_id' => $reservation->user_id,
                    'canceled' => (bool) $reservation->canceled,
                    'approved' => (bool) $reservation->approved,
                    'created_at' => $reservation->created_at ? (is_string($reservation->created_at) ? $reservation->created_at : $reservation->created_at->toDateTimeString()) : null,
                ];
            })
            ->values();

        return Inertia::render('admin/places/meeting_room/components/MeetingRoomCalendar', [
            'meetingRoom' => [
                'id' => $meetingRoomData->id,
                'name' => $meetingRoomData->name,
                'image' => $meetingRoomData->image ?? null,
            ],
            'reservations' => $events,
        ]);
    }

    public function storeReservationCowork(Request $request)
    {
        $request->validate([
            'table' => 'required|integer',
            'seats' => 'required|integer|min:1',
            'day' => 'required|date',
            'start' => 'required',
            'end' => 'required',
        ]);

        $currentUser = auth()->user();
        if (!$this->userHasAccessFlag($currentUser, 'access_cowork')) {
            return back()->with('error', 'You do not have permission to reserve a cowork table.');
        }

        // Get user data for email
        $user = DB::table('users')->where('id', Auth::id())->first();
        if (!$user) {
            return back()->with('error', 'User not found');
        }

        // Create cowork reservation using Eloquent Model (cleaner)
        $reservation = ReservationCowork::create([
            'table' => $request->table,
            'seats' => $request->seats,
            'day' => $request->day,
            'start' => $request->start,
            'end' => $request->end,
            'user_id' => Auth::id(),
            'approved' => 1,
            'canceled' => 0,
            'passed' => 0,
        ]);

        // Send approval email for auto-approved cowork reservation
        try {
            $reservationData = (object) [
                'id' => $reservation->id,
                'title' => "Cowork - Table {$request->table}",
                'date' => $request->day,
                'start' => $request->start,
                'end' => $request->end,
                'description' => "Cowork space reservation ({$request->seats} seats)",
                'type' => 'cowork'
            ];

            $this->sendMailToReservationOwner($user, new ReservationApprovedMail($user, $reservationData));
        } catch (\Exception $e) {
            // Log the error but don't fail the reservation creation
            \Log::error('Failed to send cowork approval email: ' . $e->getMessage());
        }

        return back()->with('success', 'Cowork reservation created and approved automatically');
    }


    public function cancelCowork(int $reservation)
    {
        if (!Schema::hasTable('reservation_coworks')) {
            return back()->with('error', 'Reservation coworks table missing');
        }

        // Get the cowork reservation details before updating
        $reservationData = DB::table('reservation_coworks')->where('id', $reservation)->first();
        if (!$reservationData) {
            return back()->with('error', 'Cowork reservation not found');
        }

        // Get the user who made the reservation
        $user = DB::table('users')->where('id', $reservationData->user_id)->first();
        if (!$user) {
            return back()->with('error', 'User not found');
        }

        // Update the cowork reservation
        DB::table('reservation_coworks')->where('id', $reservation)->update([
            'canceled' => 1,
            'approved' => 0,
            'updated_at' => now(),
        ]);

        // Send cancellation email
        try {
            // Create a reservation-like object for the email
            $reservationForEmail = (object) [
                'id' => $reservationData->id,
                'title' => "Cowork - Table {$reservationData->table}",
                'date' => $reservationData->day,
                'start' => $reservationData->start,
                'end' => $reservationData->end,
                'description' => 'Cowork space reservation',
                'type' => 'cowork'
            ];

            $this->sendMailToReservationOwner($user, new ReservationCanceledMail($user, $reservationForEmail));
        } catch (\Exception $e) {
            // Log the error but don't fail the cancellation
            \Log::error('Failed to send cowork cancellation email: ' . $e->getMessage());
        }

        return back()->with('success', 'Cowork reservation canceled');
    }

    public function proposeNewTime(Request $request, int $reservation)
    {
        $request->validate([
            'day' => 'required|date',
            'start' => 'required|string',
            'end' => 'required|string',
        ]);

        $reservationData = DB::table('reservations as r')
            ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
            ->where('r.id', $reservation)
            ->select('r.*', 'u.email as user_email', 'u.name as user_name')
            ->first();
        if (!$reservationData) {
            return back()->with('error', 'Reservation not found');
        }

        // Build a signed token containing reservation id and proposed times (no DB storage)
        $token = $this->buildProposalToken([
            'reservation_id' => (int) $reservation,
            'day' => $request->day,
            'start' => $request->start,
            'end' => $request->end,
            'ts' => time(),
        ]);

        $acceptUrl = route('reservations.proposal.accept', ['token' => $token]);
        $cancelUrl = route('reservations.proposal.cancel', ['token' => $token]);
        $suggestUrl = route('reservations.proposal.suggest', ['token' => $token]);

        try {
            Mail::to($reservationData->user_email)->send(new ReservationTimeProposalMail([
                'user_name' => $reservationData->user_name,
                'proposed_day' => $request->day,
                'proposed_start' => $request->start,
                'proposed_end' => $request->end,
                'accept_url' => $acceptUrl,
                'cancel_url' => $cancelUrl,
                'suggest_url' => $suggestUrl,
            ]));
        } catch (\Throwable $e) {
            \Log::error('Failed sending proposal mail: ' . $e->getMessage());
        }

        return back()->with('success', 'Proposal sent to user');
    }

    public function acceptProposal(string $token)
    {
        $data = $this->parseProposalToken($token);
        if (!$data) {
            return response()->view('proposal_invalid', [], 400);
        }
        // Update only existing columns (reservations has 'day', 'start', 'end')
        DB::table('reservations')->where('id', (int) $data['reservation_id'])->update([
            'day' => $data['day'],
            'start' => $data['start'],
            'end' => $data['end'],
            'updated_at' => now()->toDateTimeString(),
        ]);

        // Notify admins that the time was accepted
        try {
            $reservationRow = DB::table('reservations as r')
                ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
                ->where('r.id', (int) $data['reservation_id'])
                ->select('r.id as reservation_id', 'u.name as user_name')
                ->first();

            foreach ($this->studioResponsableEmails() as $email) {
                $detailsUrl = route('admin.reservations.details', ['reservation' => (int) ($reservationRow->reservation_id ?? $data['reservation_id'])]);
                Mail::to($email)->send(new ReservationTimeAcceptedAdminMail([
                    'reservation_id' => $reservationRow->reservation_id ?? (int) $data['reservation_id'],
                    'user_name' => $reservationRow->user_name ?? 'User',
                    'day' => $data['day'],
                    'start' => $data['start'],
                    'end' => $data['end'],
                    'details_url' => $detailsUrl,
                ]));
            }
        } catch (\Throwable $e) {
            \Log::error('Failed to notify admins about accepted reservation time: ' . $e->getMessage());
        }
        return response()->view('proposal_accepted');
    }

    public function cancelProposal(string $token)
    {
        $data = $this->parseProposalToken($token);
        if (!$data) {
            return response()->view('proposal_invalid', [], 400);
        }
        // Notify admins of decline
        try {
            $reservationRow = DB::table('reservations as r')
                ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
                ->where('r.id', (int) $data['reservation_id'])
                ->select('r.id as reservation_id', 'u.name as user_name')
                ->first();

            foreach ($this->studioResponsableEmails() as $email) {
                Mail::to($email)->send(new ReservationTimeDeclinedAdminMail([
                    'reservation_id' => $reservationRow->reservation_id ?? (int) $data['reservation_id'],
                    'user_name' => $reservationRow->user_name ?? 'User',
                    'day' => $data['day'],
                    'start' => $data['start'],
                    'end' => $data['end'],
                ]));
            }
        } catch (\Throwable $e) {
            \Log::error('Failed to notify admins about declined reservation time: ' . $e->getMessage());
        }
        // No DB change on decline, just show a message
        return response()->view('proposal_declined');
    }

    public function showSuggestForm(string $token)
    {
        $data = $this->parseProposalToken($token);
        if (!$data) {
            return response()->view('proposal_invalid', [], 400);
        }
        // Load reservation to infer place type and id for calendar
        $placeType = null;
        $placeId = null;
        $row = DB::table('reservations')->where('id', (int) $data['reservation_id'])->first();
        if ($row) {
            if (($row->type ?? null) === 'studio' && isset($row->studio_id)) {
                $placeType = 'studio';
                $placeId = $row->studio_id;
            } elseif (($row->type ?? null) === 'meeting_room' && Schema::hasColumn('reservations', 'meeting_room_id')) {
                $placeType = 'meeting_room';
                $placeId = $row->meeting_room_id;
            }
        }

        return view('proposal_suggest_form', [
            'token' => $token,
            'reservation_id' => (int) $data['reservation_id'],
            'proposed_day' => $data['day'],
            'proposed_start' => $data['start'],
            'proposed_end' => $data['end'],
            'place_type' => $placeType,
            'place_id' => $placeId,
        ]);
    }

    public function submitSuggestForm(Request $request, string $token)
    {
        $data = $this->parseProposalToken($token);
        if (!$data) {
            return response()->view('proposal_invalid', [], 400);
        }
        $request->validate([
            'day' => 'required|date',
            'start' => 'required|string',
            'end' => 'required|string',
        ]);

        try {
            $reservationRow = DB::table('reservations as r')
                ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
                ->where('r.id', (int) $data['reservation_id'])
                ->select('r.id as reservation_id', 'u.name as user_name')
                ->first();
            // Build approval link for admins to apply this suggested time
            $approveToken = $this->buildProposalToken([
                'reservation_id' => (int) ($reservationRow->reservation_id ?? $data['reservation_id']),
                'day' => $request->day,
                'start' => $request->start,
                'end' => $request->end,
                'ts' => time(),
            ]);
            $approveUrl = route('reservations.suggest.approve', ['token' => $approveToken]);
            $detailsUrl = route('admin.reservations.details', ['reservation' => (int) ($reservationRow->reservation_id ?? $data['reservation_id'])]);
            foreach ($this->studioResponsableEmails() as $email) {
                Mail::to($email)->send(new ReservationTimeSuggestedAdminMail([
                    'reservation_id' => $reservationRow->reservation_id ?? (int) $data['reservation_id'],
                    'user_name' => $reservationRow->user_name ?? 'User',
                    'suggested_day' => $request->day,
                    'suggested_start' => $request->start,
                    'suggested_end' => $request->end,
                    'proposed_day' => $data['day'],
                    'proposed_start' => $data['start'],
                    'proposed_end' => $data['end'],
                    'approve_url' => $approveUrl,
                    'details_url' => $detailsUrl,
                ]));
            }
        } catch (\Throwable $e) {
            \Log::error('Failed to notify admins about suggested reservation time: ' . $e->getMessage());
        }
        return response()->view('proposal_suggested');
    }

    public function approveSuggested(string $token)
    {
        $data = $this->parseProposalToken($token);
        if (!$data) {
            return response()->view('proposal_invalid', [], 400);
        }
        DB::table('reservations')->where('id', (int) $data['reservation_id'])->update([
            'day' => $data['day'],
            'start' => $data['start'],
            'end' => $data['end'],
            'updated_at' => now()->toDateTimeString(),
        ]);
        return response()->view('proposal_accepted');
    }

    // Public calendar feed for place reservations (used by suggestion page)
    public function byPlacePublic(string $type, int $id)
    {
        return $this->byPlace($type, $id);
    }

    private function buildProposalToken(array $payload): string
    {
        $json = json_encode($payload, JSON_UNESCAPED_SLASHES);
        $b64 = rtrim(strtr(base64_encode($json), '+/', '-_'), '=');
        $sig = hash_hmac('sha256', $b64, config('app.key'));
        return $b64 . '.' . $sig;
    }

    private function parseProposalToken(string $token): array|false
    {
        $parts = explode('.', $token, 2);
        if (count($parts) !== 2) return false;
        [$b64, $sig] = $parts;
        $calc = hash_hmac('sha256', $b64, config('app.key'));
        if (!hash_equals($calc, $sig)) return false;
        $json = base64_decode(strtr($b64, '-_', '+/'));
        $data = json_decode($json, true);
        if (!is_array($data)) return false;
        // Optional: expire after 7 days
        if (!isset($data['ts']) || $data['ts'] < time() - 60 * 60 * 24 * 7) return false;
        return $data;
    }

    private function exportData(Request $request)
    {
        try {
            $requestedFields = array_filter(array_map('trim', explode(',', (string) $request->query('fields', 'user_name,date,start,end,type'))));

            if (empty($requestedFields)) {
                $requestedFields = ['user_name', 'date', 'start', 'end', 'type'];
            }

            // Get filters
            $fromDate = $request->query('from_date');
            $toDate = $request->query('to_date');
            $searchTerm = $request->query('search');
            $filterType = $request->query('type');
            $filterStatus = $request->query('status');

            $query = DB::table('reservations as r')
                ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
                ->select('r.*', 'u.name as user_name')
                ->orderByDesc('r.created_at');

            // Apply date filters if provided
            if ($fromDate) {
                $query->where('r.day', '>=', $fromDate);
            }
            if ($toDate) {
                $query->where('r.day', '<=', $toDate);
            }

            // Apply type filter
            if ($filterType) {
                if ($filterType === 'exterior') {
                    // Exterior detection logic
                    $query->where(function($q) {
                        $q->where('r.type', 'exterior')
                          ->orWhere('r.type', 'outside');
                    });
                } else {
                    $query->where('r.type', $filterType);
                }
            }

            // Apply status filter
            if ($filterStatus) {
                if ($filterStatus === 'approved') {
                    $query->where('r.approved', 1)->where('r.canceled', 0);
                } elseif ($filterStatus === 'canceled') {
                    $query->where('r.canceled', 1);
                } elseif ($filterStatus === 'pending') {
                    $query->where('r.approved', 0)->where('r.canceled', 0);
                }
            }

            // Apply search filter
            if ($searchTerm) {
                $searchTermLower = strtolower($searchTerm);
                $query->where(function($q) use ($searchTermLower) {
                    $q->whereRaw('LOWER(u.name) LIKE ?', ['%' . $searchTermLower . '%'])
                      ->orWhereRaw('LOWER(r.title) LIKE ?', ['%' . $searchTermLower . '%'])
                      ->orWhereRaw('LOWER(r.description) LIKE ?', ['%' . $searchTermLower . '%'])
                      ->orWhereRaw('LOWER(r.type) LIKE ?', ['%' . $searchTermLower . '%'])
                      ->orWhereRaw('r.day LIKE ?', ['%' . $searchTerm . '%']);
                });
            }

            $needsPlaces = in_array('place_name', $requestedFields) || in_array('place_type', $requestedFields);
            $placeByReservation = [];

            if ($needsPlaces && Schema::hasTable('reservation_places') && Schema::hasTable('places')) {
                DB::table('reservation_places as rp')
                ->leftJoin('places as p', 'p.id', '=', 'rp.places_id')
                ->select('rp.reservation_id', 'p.name as place_name', 'p.place_type')
                ->get()
                ->each(function ($row) use (&$placeByReservation) {
                    $placeByReservation[$row->reservation_id] = [
                        'place_name' => $row->place_name,
                        'place_type' => $row->place_type,
                    ];
                });
        }

            // Also get cowork reservations (always include them, but apply filters if provided)
            $coworkQuery = null;
            if (Schema::hasTable('reservation_coworks')) {
                $coworkQuery = DB::table('reservation_coworks as rc')
                ->leftJoin('users as u', 'u.id', '=', 'rc.user_id')
                ->select('rc.*', 'u.name as user_name')
                ->orderByDesc('rc.created_at');

                // Apply date filters to cowork reservations if provided
                if ($fromDate) {
                    $coworkQuery->where('rc.day', '>=', $fromDate);
                }
                if ($toDate) {
                    $coworkQuery->where('rc.day', '<=', $toDate);
                }

                // Apply type filter (only include cowork if type is 'cowork' or empty)
                if ($filterType && $filterType !== 'cowork') {
                    // If filtering by a specific type that's not cowork, exclude cowork reservations
                    $coworkQuery = null;
                } elseif ($filterType === 'cowork' || !$filterType) {
                    // Apply status filter to cowork reservations
                    if ($filterStatus) {
                        if ($filterStatus === 'approved') {
                            $coworkQuery->where('rc.approved', 1)->where('rc.canceled', 0);
                        } elseif ($filterStatus === 'canceled') {
                            $coworkQuery->where('rc.canceled', 1);
                        } elseif ($filterStatus === 'pending') {
                            $coworkQuery->where('rc.approved', 0)->where('rc.canceled', 0);
                        }
                    }

                    // Apply search filter to cowork reservations
                    if ($searchTerm && $coworkQuery) {
                        $searchTermLower = strtolower($searchTerm);
                        $coworkQuery->where(function($q) use ($searchTermLower, $searchTerm) {
                            $q->whereRaw('LOWER(u.name) LIKE ?', ['%' . $searchTermLower . '%'])
                              ->orWhereRaw('rc.day LIKE ?', ['%' . $searchTerm . '%'])
                              ->orWhere('rc.table', 'LIKE', '%' . $searchTerm . '%');
                        });
                    }
                }
            }

            $filename = 'reservations_export_' . now()->format('Y-m-d_H-i-s') . '.csv';

            $response = new StreamedResponse(function () use ($query, $coworkQuery, $requestedFields, $placeByReservation) {
                $handle = fopen('php://output', 'w');

                // Add BOM for Excel UTF-8 compatibility
                fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

                // Use semicolon delimiter for Excel
                fputcsv($handle, $requestedFields, ';');

                // Process regular reservations
                $query->chunk(500, function ($reservations) use ($handle, $requestedFields, $placeByReservation) {
                    foreach ($reservations as $reservation) {
                        $row = [];

                        foreach ($requestedFields as $field) {
                            $value = null;

                            if ($field === 'place_name' || $field === 'place_type') {
                                $value = $placeByReservation[$reservation->id][$field] ?? '';
                            } elseif ($field === 'approved' || $field === 'canceled' || $field === 'passed' || $field === 'start_signed' || $field === 'end_signed') {
                                $value = (isset($reservation->$field) && $reservation->$field) ? 'Yes' : 'No';
                            } elseif ($field === 'created_at' || $field === 'updated_at') {
                                $value = isset($reservation->$field) ? date('Y-m-d H:i:s', strtotime($reservation->$field)) : '';
                            } elseif ($field === 'date' && empty($reservation->date) && !empty($reservation->day)) {
                                $value = $reservation->day;
                            } else {
                                $value = $reservation->$field ?? '';
                            }

                            if (is_string($value)) {
                                $value = str_replace(["\r\n", "\n", "\r"], ' ', $value);
                            }

                            $row[] = $value;
                        }

                        // Use semicolon delimiter
                        fputcsv($handle, $row, ';');
                    }
                });

                // Process cowork reservations if they exist
                if ($coworkQuery) {
                    $coworkQuery->chunk(500, function ($coworkReservations) use ($handle, $requestedFields) {
                        foreach ($coworkReservations as $reservation) {
                            $row = [];

                            foreach ($requestedFields as $field) {
                                $value = null;

                                if ($field === 'approved' || $field === 'canceled') {
                                    $value = (isset($reservation->$field) && $reservation->$field) ? 'Yes' : 'No';
                                } elseif ($field === 'created_at' || $field === 'updated_at') {
                                    $value = isset($reservation->$field) ? date('Y-m-d H:i:s', strtotime($reservation->$field)) : '';
                                } elseif ($field === 'date' && empty($reservation->date) && !empty($reservation->day)) {
                                    $value = $reservation->day;
                                } elseif ($field === 'type') {
                                    $value = 'cowork';
                                } elseif ($field === 'table') {
                                    $value = $reservation->table ?? '';
                                } else {
                                    $value = $reservation->$field ?? '';
                                }

                                if (is_string($value)) {
                                    $value = str_replace(["\r\n", "\n", "\r"], ' ', $value);
                                }

                                $row[] = $value;
                            }

                            // Use semicolon delimiter
                            fputcsv($handle, $row, ';');
                        }
                    });
                }

                fclose($handle);
            });

            $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
            $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');

            return $response;
        } catch (\Exception $e) {
            \Log::error('Export failed: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response('Export failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Show material verification page for reservation end
     */
    public function verifyEnd(int $reservation)
    {
        // Get reservation details
        $reservationData = DB::table('reservations as r')
            ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
            ->where('r.id', $reservation)
            ->select('r.*', 'u.name as user_name')
            ->first();

        if (!$reservationData) {
            return redirect()->route('home')->with('error', 'Reservation not found');
        }

        // Check if reservation has already been verified
        if ($reservationData->end_signed) {
            return redirect()->route('home')->with('info', 'This reservation has already been verified.');
        }

        // Get equipment/materials for this reservation
        $equipments = [];
        if (Schema::hasTable('reservation_equipment') && Schema::hasTable('equipment')) {
            $equipments = DB::table('reservation_equipment as re')
                ->leftJoin('equipment as e', 'e.id', '=', 're.equipment_id')
                ->leftJoin('equipment_types as et', 'et.id', '=', 'e.equipment_type_id')
                ->where('re.reservation_id', $reservation)
                ->select('e.id', 'e.reference', 'e.mark', 'e.image', 'e.state', 'et.name as type_name')
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
                        'image' => $img ? asset($img) : null,
                        'state' => (bool) $e->state,
                        'type_name' => $e->type_name ?? 'Unknown',
                    ];
                })
                ->toArray();
        }

        return Inertia::render('admin/reservations/partials/verify-end', [
            'reservation' => [
                'id' => $reservationData->id,
                'title' => $reservationData->title,
                'description' => $reservationData->description,
                'day' => $reservationData->day,
                'start' => $reservationData->start,
                'end' => $reservationData->end,
                'user_name' => $reservationData->user_name,
            ],
            'equipments' => $equipments,
        ]);
    }

    /**
     * Submit material verification
     */
    public function submitVerification(Request $request, int $reservation)
    {
        $request->validate([
            'equipment_status' => 'required|array',
            'equipment_status.*' => 'required|array',
            'equipment_status.*.goodCondition' => 'nullable|boolean',
            'equipment_status.*.badCondition' => 'nullable|boolean',
            'equipment_status.*.notReturned' => 'nullable|boolean',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $verificationData = null;
            $equipmentStatus = $request->input('equipment_status', []);
            $notes = $request->input('notes', '');

            DB::transaction(function () use ($request, $reservation, $equipmentStatus, $notes, &$verificationData) {
                // Update reservation as verified and store notes
                $updateReservation = [
                    'end_signed' => true,
                    'updated_at' => now(),
                ];
                if ($notes) {
                    $updateReservation['verification_notes'] = $notes;
                }
                DB::table('reservations')->where('id', $reservation)->update($updateReservation);

                // Get reservation details for PDF (before loop to avoid overwriting)
                $reservationData = DB::table('reservations as r')
                    ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
                    ->where('r.id', $reservation)
                    ->select('r.*', 'u.name as user_name')
                    ->first();

                // Get equipment details for PDF
                $equipments = [];
                if (Schema::hasTable('reservation_equipment') && Schema::hasTable('equipment')) {
                    $equipments = DB::table('reservation_equipment as re')
                        ->leftJoin('equipment as e', 'e.id', '=', 're.equipment_id')
                        ->leftJoin('equipment_types as et', 'et.id', '=', 'e.equipment_type_id')
                        ->where('re.reservation_id', $reservation)
                        ->select('e.id', 'e.reference', 'e.mark', 'et.name as type_name')
                        ->get()
                        ->map(function ($e) use ($equipmentStatus) {
                            $status = $equipmentStatus[$e->id] ?? [];
                            return [
                                'id' => $e->id,
                                'reference' => $e->reference,
                                'mark' => $e->mark,
                                'type_name' => $e->type_name ?? 'Unknown',
                                'goodCondition' => !empty($status['goodCondition']) && ($status['goodCondition'] === true || $status['goodCondition'] === '1' || $status['goodCondition'] === 1),
                                'badCondition' => !empty($status['badCondition']) && ($status['badCondition'] === true || $status['badCondition'] === '1' || $status['badCondition'] === 1),
                                'notReturned' => !empty($status['notReturned']) && ($status['notReturned'] === true || $status['notReturned'] === '1' || $status['notReturned'] === 1),
                            ];
                        })
                        ->toArray();
                }

                // Build verification data structure
                $verificationData = [
                    'reservation' => [
                        'id' => $reservationData->id,
                        'title' => $reservationData->title,
                        'description' => $reservationData->description,
                        'day' => $reservationData->day,
                        'start' => $reservationData->start,
                        'end' => $reservationData->end,
                        'user_name' => $reservationData->user_name,
                    ],
                    'equipments' => $equipments,
                    'notes' => $notes,
                ];

                // Log the verification data for debugging
                \Log::info('Verification data for PDF:', $verificationData);

                foreach ($equipmentStatus as $equipmentId => $status) {
                    // Determine equipment state based on checkboxes
                    $isGood = isset($status['goodCondition']) && $status['goodCondition'];
                    $isBad = isset($status['badCondition']) && $status['badCondition'];
                    $isNotReturned = isset($status['notReturned']) && $status['notReturned'];

                    // Set equipment state (good = 1, bad/not returned = 0)
                    $equipmentState = $isGood ? 1 : 0;

                    DB::table('equipment')->where('id', $equipmentId)->update([
                        'state' => $equipmentState,
                        'updated_at' => now(),
                    ]);

                    // Save equipment verification record
                    if (Schema::hasTable('equipment_verifications')) {
                        // Check if verification record already exists
                        $existing = DB::table('equipment_verifications')
                            ->where('reservation_id', $reservation)
                            ->where('equipment_id', $equipmentId)
                            ->first();

                        $verificationRecord = [
                            'reservation_id' => $reservation,
                            'equipment_id' => $equipmentId,
                            'good_condition' => $isGood ? 1 : 0,
                            'bad_condition' => $isBad ? 1 : 0,
                            'not_returned' => $isNotReturned ? 1 : 0,
                            'updated_at' => now(),
                        ];

                        if ($existing) {
                            DB::table('equipment_verifications')
                                ->where('id', $existing->id)
                                ->update($verificationRecord);
                        } else {
                            $verificationRecord['created_at'] = now();
                            DB::table('equipment_verifications')->insert($verificationRecord);
                        }
                    }

                    // Optionally, persist status flags on pivot if columns exist
                    if (Schema::hasTable('reservation_equipment')) {
                        $updateData = ['updated_at' => now()];

                        if (Schema::hasColumn('reservation_equipment', 'good_condition')) {
                            $updateData['good_condition'] = $isGood ? 1 : 0;
                        }
                        if (Schema::hasColumn('reservation_equipment', 'bad_condition')) {
                            $updateData['bad_condition'] = $isBad ? 1 : 0;
                        }
                        if (Schema::hasColumn('reservation_equipment', 'not_returned')) {
                            $updateData['not_returned'] = $isNotReturned ? 1 : 0;
                        }

                        if (count($updateData) > 1) { // More than just updated_at
                            DB::table('reservation_equipment')
                                ->where('reservation_id', $reservation)
                                ->where('equipment_id', $equipmentId)
                                ->update($updateData);
                        }
                    }
                }
            });


            // Log equipment usage to activity_log on end verification (event = verified_end)
            try {
                if (Schema::hasTable('activity_log') && Schema::hasTable('reservation_equipment')) {
                    $reservationDataForLog = DB::table('reservations')->where('id', $reservation)->first();
                    $equipmentLinksForLog = DB::table('reservation_equipment')
                        ->where('reservation_id', $reservation)
                        ->get();

                    if ($reservationDataForLog && $equipmentLinksForLog->count() > 0) {
                        $rowsToInsert = [];
                        foreach ($equipmentLinksForLog as $link) {
                            $day = $link->day ?? ($reservationDataForLog->day ?? null);
                            $startTime = $link->start ?? ($reservationDataForLog->start ?? null);
                            $endTime = $link->end ?? ($reservationDataForLog->end ?? null);


                            $startDate = (string) ($day ?? '') . ' ' . ($startTime ?? '');
                            $endDate = (string) ($day ?? '') . ' ' . ($endTime ?? '');

                            $properties = json_encode([
                                'start' => $startDate,
                                'end' => $endDate,
                            ]);

                            $exists = DB::table('activity_log')
                                ->where('log_name', 'equipment')
                                ->where('description', 'equipment history')
                                ->where('subject_type', 'App\\Models\\Equipment')
                                ->where('subject_id', $link->equipment_id)
                                ->where('causer_type', 'App\\Models\\User')
                                ->where('causer_id', $reservationDataForLog->user_id)
                                ->where('event', 'verified_end')
                                ->where('properties', $properties)
                                ->exists();

                            if (!$exists) {
                                $rowsToInsert[] = [
                                    'log_name' => 'equipment',
                                    'description' => 'equipment history',
                                    'subject_type' => 'App\\Models\\Equipment',
                                    'subject_id' => $link->equipment_id,
                                    'event' => 'verified_end',
                                    'causer_type' => 'App\\Models\\User',
                                    'causer_id' => $reservationDataForLog->user_id,
                                    'properties' => $properties,
                                    'created_at' => now()->toDateTimeString(),
                                    'updated_at' => now()->toDateTimeString(),
                                ];
                            }
                        }

                        if (!empty($rowsToInsert)) {
                            DB::table('activity_log')->insert($rowsToInsert);
                        }
                    }
                }
            } catch (\Throwable $e) {
                \Log::error('Failed to write equipment verified_end activity logs: ' . $e->getMessage());
            }

            // Generate PDF and download it
            $userName = str_replace(' ', '_', $verificationData['reservation']['user_name'] ?? 'User');
            $date = \Carbon\Carbon::now()->format('Y-m-d_H-i-s');
            $filename = "Verification_Report_{$userName}_{$date}.pdf";

            try {
                $pdf = Pdf::loadView('pdf.verification_report_simple', [
                    'reservation' => $verificationData['reservation'],
                    'verificationData' => $verificationData
                ])
                    ->setPaper('a4', 'portrait')
                    ->setOptions([
                        'isHtml5ParserEnabled' => true,
                        'isRemoteEnabled' => true,
                        'defaultFont' => 'Arial',
                        'isPhpEnabled' => true,
                        'isFontSubsettingEnabled' => true
                    ]);

                // Store PDF data in session for download route
                session(['verification_pdf_data' => [
                    'reservation' => $verificationData['reservation'],
                    'verificationData' => $verificationData,
                    'filename' => $filename
                ]]);
                
                // Check if this is an Inertia request
                if (request()->header('X-Inertia')) {
                    // For Inertia, return JSON with download URL
                    $downloadUrl = route('reservations.download-report', $reservation);
                    return response()->json([
                        'success' => true,
                        'message' => 'Verification completed successfully!',
                        'downloadUrl' => $downloadUrl
                    ]);
                } else {
                    // For regular form submissions, download directly
                    return $pdf->download($filename);
                }
            } catch (\Exception $pdfError) {
                \Log::error('PDF generation error in submitVerification: ' . $pdfError->getMessage());
                \Log::error('PDF generation stack trace: ' . $pdfError->getTraceAsString());
                
                // Still save the data even if PDF fails
                session(['verification_pdf_data' => [
                    'reservation' => $verificationData['reservation'],
                    'verificationData' => $verificationData,
                    'filename' => $filename
                ]]);
                
                if (request()->header('X-Inertia')) {
                    $downloadUrl = route('reservations.download-report', $reservation);
                    return redirect()->route('admin.reservations')
                        ->with('success', 'Verification completed successfully!')
                        ->with('downloadUrl', $downloadUrl)
                        ->with('warning', 'PDF generation had issues, but you can try downloading it from the link.');
                } else {
                    return redirect()->route('reservations.download-report', $reservation)
                        ->with('warning', 'PDF generation had issues, but you can try downloading it.');
                }
            }
        } catch (\Exception $e) {
            \Log::error('PDF generation failed: ' . $e->getMessage());
            return redirect()->route('reservations.verify-end', $reservation)
                ->with('error', 'Verification completed successfully! PDF generation failed, but data was saved.');
        }
    }

    /**
     * Show reservation details page
     */
    public function details(int $reservation)
    {
        if (!Schema::hasTable('reservations')) {
            return redirect()->route('admin.reservations')->with('error', 'Reservations table missing');
        }

        // Get reservation details
        $reservationData = DB::table('reservations as r')
            ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
            ->leftJoin('studios as s', 's.id', '=', 'r.studio_id')
            ->where('r.id', $reservation)
            ->select('r.*', 'u.name as user_name', 'u.email as user_email', 's.name as studio_name')
            ->first();

        if (!$reservationData) {
            return redirect()->route('admin.reservations')->with('error', 'Reservation not found');
        }

        // Get equipment details
        $equipments = [];
        if (Schema::hasTable('reservation_equipment') && Schema::hasTable('equipment')) {
            $hasEquipmentImage = Schema::hasColumn('equipment', 'image');
            $query = DB::table('reservation_equipment as re')
                ->leftJoin('equipment as e', 'e.id', '=', 're.equipment_id')
                ->leftJoin('equipment_types as et', 'et.id', '=', 'e.equipment_type_id')
                ->where('re.reservation_id', $reservation)
                ->select('e.id', 'e.reference', 'e.mark', 'et.name as type_name');

            if ($hasEquipmentImage) {
                $query->addSelect('e.image');
            }

            $equipments = $query->get()
                ->map(function ($equipment) use ($reservation) {
                    $img = isset($equipment->image) ? $equipment->image : null;
                    if ($img) {
                        if (!Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                            $img = 'storage/img/equipment/' . ltrim($img, '/');
                        }
                        $img = asset($img);
                    }

                    // Get verification data for this equipment if available
                    $verification = null;
                    if (Schema::hasTable('equipment_verifications')) {
                        $verification = DB::table('equipment_verifications')
                            ->where('reservation_id', $reservation)
                            ->where('equipment_id', $equipment->id)
                            ->first();
                    }

                    return [
                        'id' => $equipment->id,
                        'reference' => $equipment->reference,
                        'mark' => $equipment->mark,
                        'type_name' => $equipment->type_name,
                        'image' => $img,
                        'verification' => $verification ? [
                            'good_condition' => (bool) $verification->good_condition,
                            'bad_condition' => (bool) $verification->bad_condition,
                            'not_returned' => (bool) $verification->not_returned,
                            'equipment_notes' => $verification->equipment_notes,
                        ] : null,
                    ];
                })
                ->values()
                ->toArray();
        }

        // Get team members
        $teamMembers = [];
        if (Schema::hasTable('reservation_teams')) {
            $userImageColumn = Schema::hasColumn('users', 'image') ? 'image' : (Schema::hasColumn('users', 'profile_photo_path') ? 'profile_photo_path' : null);
            $query = DB::table('reservation_teams as rt')
                ->leftJoin('users as u', 'u.id', '=', 'rt.user_id')
                ->where('rt.reservation_id', $reservation)
                ->select('u.id', 'u.name', 'u.email');

            if ($userImageColumn) {
                $query->addSelect('u.' . $userImageColumn . ' as image');
            }

            $teamMembers = $query->get()
                ->map(function ($member) {
                    $img = isset($member->image) ? $member->image : null;
                    if ($img) {
                        if (!Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                            $img = 'storage/img/profile/' . ltrim($img, '/');
                        }
                        $img = asset($img);
                    }
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'email' => $member->email,
                        'image' => $img,
                    ];
                })
                ->values()
                ->toArray();
        }

        // Get approver details
        $approverName = null;
        if ($reservationData->approve_id) {
            $approver = DB::table('users')->where('id', $reservationData->approve_id)->first();
            $approverName = $approver ? $approver->name : null;
        }

        return Inertia::render('admin/reservations/details', [
            'reservation' => [
                'id' => $reservationData->id,
                'user_name' => $reservationData->user_name,
                'user_email' => $reservationData->user_email,
                'date' => $reservationData->date ?? $reservationData->day,
                'start' => $reservationData->start,
                'end' => $reservationData->end,
                'title' => $reservationData->title,
                'description' => $reservationData->description,
                'type' => $reservationData->type,
                'studio_name' => $reservationData->studio_name,
                'approved' => (bool) ($reservationData->approved ?? 0),
                'canceled' => (bool) ($reservationData->canceled ?? 0),
                'passed' => (bool) ($reservationData->passed ?? 0),
                'start_signed' => (bool) ($reservationData->start_signed ?? 0),
                'end_signed' => (bool) ($reservationData->end_signed ?? 0),
                'verification_notes' => $reservationData->verification_notes ?? null,
                'approver_name' => $approverName,
                'created_at' => $reservationData->created_at,
                'updated_at' => $reservationData->updated_at,
            ],
            'equipments' => $equipments,
            'teamMembers' => $teamMembers,
        ]);
    }

    /**
     * Download verification report PDF
     */
    public function downloadReport(int $reservation)
    {
        $pdfData = session('verification_pdf_data');

        if (!$pdfData) {
            return redirect()->route('reservations.verify-end', $reservation)
                ->with('error', 'No verification data found. Please submit the verification form first.');
        }

        try {
            $pdf = Pdf::loadView('pdf.verification_report_simple', [
                'reservation' => $pdfData['reservation'],
                'verificationData' => $pdfData['verificationData']
            ])
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'isHtml5ParserEnabled' => true,
                    'isRemoteEnabled' => true,
                    'defaultFont' => 'Arial',
                    'isPhpEnabled' => true,
                    'isFontSubsettingEnabled' => true
                ]);

            // Clear the session data after download
            session()->forget('verification_pdf_data');

            return $pdf->download($pdfData['filename']);
        } catch (\Exception $e) {
            \Log::error('PDF download failed: ' . $e->getMessage());
            return redirect()->route('reservations.verify-end', $reservation)
                ->with('error', 'Failed to generate PDF. Please try again.');
        }
    }

    /**
     * Show analytics and reporting page
     */
    public function analytics()
    {
        $analytics = [];

        // Studio Reservations Count
        $studioReservationsCount = [];
        if (Schema::hasTable('reservations') && Schema::hasTable('studios')) {
            $studioReservationsCount = DB::table('reservations as r')
                ->leftJoin('studios as s', 's.id', '=', 'r.studio_id')
                ->select('s.name as studio_name', DB::raw('COUNT(*) as count'))
                ->where('r.type', 'studio')
                ->where('r.canceled', 0)
                ->groupBy('s.id', 's.name')
                ->orderByDesc('count')
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => $item->studio_name ?? 'Unknown',
                        'count' => $item->count
                    ];
                })
                ->toArray();
        }

        // Most Active Times (Hours)
        $timeSlotStats = [];
        if (Schema::hasTable('reservations')) {
            $timeSlots = DB::table('reservations')
                ->select('start', DB::raw('COUNT(*) as count'))
                ->where('canceled', 0)
                ->whereNotNull('start')
                ->groupBy('start')
                ->orderByDesc('count')
                ->get()
                ->toArray();

            $timeSlotStats = [
                'most_reserved' => count($timeSlots) > 0 ? [
                    'time' => $timeSlots[0]->start,
                    'count' => $timeSlots[0]->count
                ] : null,
                'least_reserved' => count($timeSlots) > 0 ? [
                    'time' => end($timeSlots)->start,
                    'count' => end($timeSlots)->count
                ] : null,
            ];
        }

        // Most Active Users
        $topUsers = [];
        if (Schema::hasTable('reservations')) {
            $userImageColumn = Schema::hasColumn('users', 'image') ? 'image' : (Schema::hasColumn('users', 'profile_photo_path') ? 'profile_photo_path' : null);
            $query = DB::table('reservations as r')
                ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
                ->select('u.name', 'u.email', DB::raw('COUNT(*) as count'));

            if ($userImageColumn) {
                $query->addSelect('u.' . $userImageColumn . ' as image');
            }

            $topUsers = $query
                ->where('r.canceled', 0)
                ->groupBy('u.id', 'u.name', 'u.email')
                ->orderByDesc('count')
                ->limit(10)
                ->get()
                ->map(function ($user) {
                    $img = isset($user->image) ? $user->image : null;
                    if ($img) {
                        if (!Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                            $img = 'storage/img/profile/' . ltrim($img, '/');
                        }
                        $img = asset($img);
                    }
                    return [
                        'name' => $user->name ?? 'Unknown',
                        'email' => $user->email ?? '',
                        'count' => $user->count,
                        'image' => $img
                    ];
                })
                ->toArray();
        }

        // Most Reserved Equipment
        $topEquipment = [];
        if (Schema::hasTable('reservation_equipment') && Schema::hasTable('equipment')) {
            $hasEquipmentImage = Schema::hasColumn('equipment', 'image');

            // First get the count per equipment
            $topEquipmentData = DB::table('reservation_equipment as re')
                ->select('re.equipment_id', DB::raw('COUNT(*) as count'))
                ->groupBy('re.equipment_id')
                ->orderByDesc('count')
                ->limit(10)
                ->get();

            // Then get equipment details with images
            $equipmentIds = $topEquipmentData->pluck('equipment_id')->toArray();

            if (!empty($equipmentIds)) {
                $query = DB::table('equipment as e')
                    ->leftJoin('equipment_types as et', 'et.id', '=', 'e.equipment_type_id')
                    ->select('e.id', 'e.reference', 'e.mark', 'et.name as type_name');

                if ($hasEquipmentImage) {
                    $query->addSelect('e.image');
                }

                $equipmentDetails = $query->whereIn('e.id', $equipmentIds)->get()->keyBy('id');

                $topEquipment = $topEquipmentData->map(function ($item) use ($equipmentDetails) {
                    $eq = $equipmentDetails->get($item->equipment_id);
                    if (!$eq) return null;

                    $img = isset($eq->image) ? $eq->image : null;
                    if ($img) {
                        if (!Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                            $img = 'storage/img/equipment/' . ltrim($img, '/');
                        }
                        $img = asset($img);
                    }

                    return [
                        'reference' => $eq->reference ?? 'Unknown',
                        'mark' => $eq->mark ?? '',
                        'type_name' => $eq->type_name ?? 'Unknown',
                        'count' => $item->count,
                        'image' => $img
                    ];
                })
                    ->filter()
                    ->values()
                    ->toArray();
            }
        }

        // Active / Damaged Equipment snapshots
        $activeEquipment = [];
        $damagedEquipment = [];
        if (Schema::hasTable('equipment')) {
            $hasEquipmentImage = Schema::hasColumn('equipment', 'image');
            $equipmentBaseQuery = DB::table('equipment as e')
                ->leftJoin('equipment_types as et', 'et.id', '=', 'e.equipment_type_id')
                ->select('e.id', 'e.reference', 'e.mark', 'et.name as type_name', 'e.state');

            if ($hasEquipmentImage) {
                $equipmentBaseQuery->addSelect('e.image');
            }

            $formatEquipment = function ($equipment) {
                $img = isset($equipment->image) ? $equipment->image : null;
                if ($img) {
                    if (!Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                        $img = 'storage/img/equipment/' . ltrim($img, '/');
                    }
                    $img = asset($img);
                }

                return [
                    'id' => $equipment->id,
                    'reference' => $equipment->reference ?? 'Unknown',
                    'mark' => $equipment->mark ?? '',
                    'type_name' => $equipment->type_name ?? 'Unknown',
                    'image' => $img,
                ];
            };

            $damagedEquipment = (clone $equipmentBaseQuery)
                ->where('e.state', 0)
                ->orderByDesc(DB::raw('COALESCE(e.updated_at, e.created_at)'))
                ->limit(50)
                ->get()
                ->map($formatEquipment)
                ->toArray();

            $activeEquipment = (clone $equipmentBaseQuery)
                ->where('e.state', 1)
                ->orderByDesc(DB::raw('COALESCE(e.updated_at, e.created_at)'))
                ->limit(50)
                ->get()
                ->map($formatEquipment)
                ->toArray();
        }

        // Equipment Not Reserved
        $unusedEquipment = [];
        if (Schema::hasTable('reservation_equipment') && Schema::hasTable('equipment')) {
            $usedEquipmentIds = DB::table('reservation_equipment')
                ->distinct()
                ->pluck('equipment_id')
                ->toArray();

            $hasEquipmentImage = Schema::hasColumn('equipment', 'image');
            $query = DB::table('equipment as e')
                ->leftJoin('equipment_types as et', 'et.id', '=', 'e.equipment_type_id')
                ->select('e.id', 'e.reference', 'e.mark', 'et.name as type_name');

            if ($hasEquipmentImage) {
                $query->addSelect('e.image');
            }

            $unusedEquipment = $query
                ->whereNotIn('e.id', $usedEquipmentIds)
                ->limit(10)
                ->get()
                ->map(function ($eq) {
                    $img = isset($eq->image) ? $eq->image : null;
                    if ($img) {
                        if (!Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                            $img = 'storage/img/equipment/' . ltrim($img, '/');
                        }
                        $img = asset($img);
                    }
                    return [
                        'id' => $eq->id,
                        'reference' => $eq->reference ?? 'Unknown',
                        'mark' => $eq->mark ?? '',
                        'type_name' => $eq->type_name ?? 'Unknown',
                        'image' => $img
                    ];
                })
                ->toArray();
        }

        // Monthly reservations trend
        $monthlyTrend = [];
        if (Schema::hasTable('reservations')) {
            // Use SQLite-compatible date formatting
            $monthlyTrend = DB::table('reservations')
                ->select(
                    DB::raw("strftime('%Y-%m', created_at) as month"),
                    DB::raw('COUNT(*) as count')
                )
                ->where('canceled', 0)
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => $item->month,
                        'count' => $item->count
                    ];
                })
                ->toArray();
        }

        // Total Statistics
        $totalStats = [
            'total_reservations' => DB::table('reservations')->where('canceled', 0)->count(),
            'total_cowork_reservations' => Schema::hasTable('reservation_coworks')
                ? DB::table('reservation_coworks')->where('canceled', 0)->count()
                : 0,
            'total_equipment' => Schema::hasTable('equipment')
                ? DB::table('equipment')->count()
                : 0,
            'total_users' => DB::table('users')->count(),
            'total_studios' => Schema::hasTable('studios')
                ? DB::table('studios')->count()
                : 0,
        ];

        $analytics = [
            'totalStats' => $totalStats,
            'studioReservations' => $studioReservationsCount,
            'timeSlotStats' => $timeSlotStats,
            'topUsers' => $topUsers,
            'topEquipment' => $topEquipment,
            'damagedEquipment' => $damagedEquipment,
            'activeEquipment' => $activeEquipment,
            'unusedEquipment' => $unusedEquipment,
            'monthlyTrend' => $monthlyTrend,
        ];

        return Inertia::render('admin/reservations/analytics', $analytics);
    }

    /**
     * Show reservation history page
     */
    /**
     * Show individual reservation details
     */
    public function show(int $reservation)
    {
        // if (!Schema::hasTable('reservations')) {
        //     return Inertia::render('reservations/ReservationDetails', [
        //         'reservation' => null
        //     ]);
        // }

        // Get reservation details
        $reservationData = DB::table('reservations as r')
            ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
            ->leftJoin('studios as s', 's.id', '=', 'r.studio_id')
            ->where('r.id', $reservation)
            ->select(
                'r.*',
                'u.name as user_name',
                'u.email as user_email',
                'u.phone as user_phone',
                'u.image as user_avatar',
                's.name as studio_name'
            )
            ->first();

        // if (!$reservationData) {
        //     return Inertia::render('reservations/ReservationDetails', [
        //         'reservation' => null
        //     ]);
        // }

        // Normalize user avatar path
        $userAvatar = $reservationData->user_avatar ?? null;
        if ($userAvatar && !Str::startsWith($userAvatar, ['http://', 'https://', 'storage/'])) {
            $userAvatar = 'img/profile/' . ltrim($userAvatar, '/');
        }

        // Get approver details
        $approverName = null;
        if ($reservationData->approve_id) {
            $approver = DB::table('users')->where('id', $reservationData->approve_id)->first();
            $approverName = $approver ? $approver->name : null;
        }

        // Determine status
        $status = 'ended';
        if ($reservationData->canceled) {
            $status = 'cancelled';
        } elseif ($reservationData->approved && $reservationData->day > now()->toDateString()) {
            $status = 'upcoming';
        } elseif ($reservationData->approved && $reservationData->day == now()->toDateString()) {
            $status = 'active';
        }

        // Get equipment information
        $equipments = [];
        if (Schema::hasTable('reservation_equipment') && Schema::hasTable('equipment')) {
            $equipments = DB::table('reservation_equipment as re')
                ->leftJoin('equipment as e', 'e.id', '=', 're.equipment_id')
                ->leftJoin('equipment_types as et', 'et.id', '=', 'e.equipment_type_id')
                ->where('re.reservation_id', $reservation)
                ->select(
                    'e.id',
                    'e.reference',
                    'e.mark',
                    'e.image',
                    'et.name as type_name',
                    're.day as equipment_day',
                    're.start as equipment_start',
                    're.end as equipment_end'
                )
                ->get()
                ->map(function ($equipment) {
                    $img = $equipment->image ?? null;
                    if ($img && !Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                        $img = 'img/equipment/' . ltrim($img, '/');
                    }
                    return [
                        'id' => $equipment->id,
                        'reference' => $equipment->reference,
                        'mark' => $equipment->mark,
                        'name' => $equipment->reference . ' - ' . $equipment->mark,
                        'image' => $img,
                        'type_name' => $equipment->type_name,
                        'day' => $equipment->equipment_day,
                        'start' => $equipment->equipment_start,
                        'end' => $equipment->equipment_end,
                    ];
                });
        }

        // Get team members
        $members = [];
        if (Schema::hasTable('reservation_teams')) {
            $members = DB::table('reservation_teams as rt')
                ->leftJoin('users as u', 'u.id', '=', 'rt.user_id')
                ->where('rt.reservation_id', $reservation)
                ->select('u.id as user_id', 'u.name', 'u.email', 'u.image as avatar', 'u.phone')
                ->get()
                ->map(function ($member) {
                    $img = $member->avatar ?? null;
                    if ($img && !Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                        $img = 'img/profile/' . ltrim($img, '/');
                    }
                    return [
                        'id' => $member->user_id,
                        'user_id' => $member->user_id,
                        'name' => $member->name,
                        'email' => $member->email,
                        'phone' => $member->phone,
                        'avatar' => $img,
                        'role' => 'Team Member'
                    ];
                });
        }

        $reservation = [
            'id' => $reservationData->id,
            'title' => $reservationData->title,
            'description' => $reservationData->description,
            'type' => $reservationData->type,
            'day' => $reservationData->day,
            'start' => $reservationData->start,
            'end' => $reservationData->end,
            'start_time' => $reservationData->day . ' ' . $reservationData->start,
            'end_time' => $reservationData->day . ' ' . $reservationData->end,
            'status' => $status,
            'approved' => (bool) $reservationData->approved,
            'canceled' => (bool) $reservationData->canceled,
            'passed' => (bool) $reservationData->passed,
            'start_signed' => (bool) $reservationData->start_signed,
            'end_signed' => (bool) $reservationData->end_signed,
            'notes' => $reservationData->description,
            'created_at' => $reservationData->created_at,
            'updated_at' => $reservationData->updated_at,
            'user_id' => $reservationData->user_id,
            'studio_id' => $reservationData->studio_id,
            'user_name' => $reservationData->user_name,
            'user_email' => $reservationData->user_email,
            'user_phone' => $reservationData->user_phone,
            'user_avatar' => $userAvatar,
            'studio_name' => $reservationData->studio_name,
            'approver_name' => $approverName,
            'equipments' => $equipments,
            'members' => $members,
        ];

        $studioOptions = [];
        if (Schema::hasTable('studios')) {
            $studioOptions = DB::table('studios')
                ->select('id', 'name')
                ->orderBy('name')
                ->get()
                ->map(function ($studio) {
                    return [
                        'id' => $studio->id,
                        'name' => $studio->name,
                    ];
                })
                ->values()
                ->toArray();
        }

        return Inertia::render('admin/reservations/[id]', [
            'reservation' => $reservation,
            'equipmentOptions' => $this->getEquipmentOptions(),
            'teamMemberOptions' => $this->getTeamMemberOptions(),
            'studios' => $studioOptions,
        ]);
    }

    public function storeReservationMeetingRoom(Request $request)
    {
        $request->validate([
            'meeting_room_id' => 'required|exists:meeting_rooms,id',
            'day' => 'required|date',
            'start' => 'required',
            'end' => 'required',
        ]);

        $lastId = (int) (DB::table('reservation_meeting_rooms')->max('id') ?? 0);
        $reservationId = $lastId + 1;

        // Get user data for email
        $user = DB::table('users')->where('id', Auth::id())->first();
        if (!$user) {
            return back()->with('error', 'User not found');
        }

        // Get meeting room name
        $meetingRoom = DB::table('meeting_rooms')->where('id', $request->meeting_room_id)->first();

        // Create meeting room reservation as auto-approved
        DB::table('reservation_meeting_rooms')->insert([
            'id' => $reservationId,
            'meeting_room_id' => $request->meeting_room_id,
            'user_id' => Auth::id(),
            'day' => $request->day,
            'start' => $request->start,
            'end' => $request->end,
            'passed' => 0,
            'approved' => 1,
            'canceled' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Send approval email for auto-approved meeting room reservation
        try {
            $reservationData = (object) [
                'id' => $reservationId,
                'title' => "Meeting Room - {$meetingRoom->name}",
                'date' => $request->day,
                'start' => $request->start,
                'end' => $request->end,
                'description' => 'Meeting room reservation',
                'type' => 'meeting_room'
            ];

            $this->sendMailToReservationOwner($user, new ReservationApprovedMail($user, $reservationData));
        } catch (\Exception $e) {
            \Log::error('Failed to send meeting room approval email: ' . $e->getMessage());
        }

        return back()->with('success', 'Meeting room reservation created and approved automatically');
    }

    public function cancelMeetingRoom(int $reservation)
    {
        if (!Schema::hasTable('reservation_meeting_rooms')) {
            return back()->with('error', 'Reservation meeting rooms table missing');
        }

        $reservationData = DB::table('reservation_meeting_rooms')->where('id', $reservation)->first();
        if (!$reservationData) {
            return back()->with('error', 'Meeting room reservation not found');
        }

        $user = DB::table('users')->where('id', $reservationData->user_id)->first();
        if (!$user) {
            return back()->with('error', 'User not found');
        }

        $meetingRoom = DB::table('meeting_rooms')->where('id', $reservationData->meeting_room_id)->first();

        DB::table('reservation_meeting_rooms')->where('id', $reservation)->update([
            'canceled' => 1,
            'approved' => 0,
            'updated_at' => now(),
        ]);

        try {
            $reservationForEmail = (object) [
                'id' => $reservationData->id,
                'title' => "Meeting Room - {$meetingRoom->name}",
                'date' => $reservationData->day,
                'start' => $reservationData->start,
                'end' => $reservationData->end,
                'description' => 'Meeting room reservation',
                'type' => 'meeting_room'
            ];

            $this->sendMailToReservationOwner($user, new ReservationCanceledMail($user, $reservationForEmail));
        } catch (\Exception $e) {
            \Log::error('Failed to send meeting room cancellation email: ' . $e->getMessage());
        }

        return back()->with('success', 'Meeting room reservation canceled');
    }

    private function studioResponsableEmails(): array
    {
        // Get all users and filter by role (since role is JSON array, User model handles casting)
        $users = User::whereNotNull('email')->get();
        
        $emails = $users->filter(function ($user) {
            $roles = $this->normalizeRolesList($user->role);
            return in_array('studio_responsable', $roles);
        })->pluck('email')
          ->filter()
          ->unique()
          ->values();

        \Log::info('Studio responsable emails found: ' . $emails->count() . ' - ' . $emails->implode(', '));

        if ($emails->isEmpty()) {
            \Log::warning('No studio_responsable users found, using fallback email from env');
            $fallback = collect(array_filter(array_map('trim', explode(',', env('STUDIO_RESPONSABLE_EMAILS', env('ADMIN_NOTIFICATION_EMAILS', ''))))));
            $emails = $fallback->filter()->unique()->values();
            \Log::info('Fallback emails: ' . $emails->implode(', '));
        }

        return $emails->all();
    }

    private function sendMailToReservationOwner($user, $mailable): void
    {
        $email = data_get($user, 'email') ?? data_get($user, 'user_email');

        if (!$email) {
            $fallback = env('RESERVATION_USER_FALLBACK_EMAIL', env('MAIL_FROM_ADDRESS'));
            $email = $fallback ?: null;
        }

        if ($email) {
            Mail::to($email)->send($mailable);
        }
    }

    private function normalizeRolesList($roles): array
    {
        if (is_array($roles)) {
            $list = $roles;
        } elseif (is_string($roles) && $roles !== '') {
            $decoded = json_decode($roles, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $list = $decoded;
            } else {
                $list = array_map('trim', explode(',', $roles));
            }
        } else {
            $list = [];
        }

        return array_filter(array_map(fn ($role) => strtolower((string) $role), $list));
    }

    private function userHasAccessFlag($user, string $field): bool
    {
        if (!$user) {
            return false;
        }

        $roles = $this->normalizeRolesList(data_get($user, 'role'));
        if (!empty(array_intersect($roles, self::ACCESS_BYPASS_ROLES))) {
            return true;
        }

        $directValue = data_get($user, $field);
        if ($directValue !== null) {
            return (bool) $directValue;
        }

        if ($user instanceof User) {
            $relationValue = optional($user->access)->{$field};
            if ($relationValue !== null) {
                return (bool) $relationValue;
            }
        } else {
            $relationValue = data_get($user, "access.$field");
            if ($relationValue !== null) {
                return (bool) $relationValue;
            }
        }

        return false;
    }

    private function getEquipmentOptions(): array
    {
        if (!Schema::hasTable('equipment')) {
            return [];
        }

        return DB::table('equipment as e')
            ->leftJoin('equipment_types as et', 'et.id', '=', 'e.equipment_type_id')
            ->select('e.id', 'e.reference', 'e.mark', 'e.image', 'et.name as type_name')
            ->orderBy('e.mark')
            ->get()
            ->map(function ($equipment) {
                $image = $equipment->image ?? null;
                if ($image) {
                    if (Str::startsWith($image, ['http://', 'https://'])) {
                        $imageUrl = $image;
                    } else {
                        $imageUrl = asset(Str::startsWith($image, ['storage/', '/storage/']) ? $image : 'storage/' . ltrim($image, '/'));
                    }
                } else {
                    $imageUrl = null;
                }

                return [
                    'id' => $equipment->id,
                    'reference' => $equipment->reference,
                    'mark' => $equipment->mark,
                    'image' => $imageUrl,
                    'type_name' => $equipment->type_name,
                ];
            })
            ->values()
            ->toArray();
    }

    private function getTeamMemberOptions(): array
    {
        if (!Schema::hasTable('users')) {
            return [];
        }

        return DB::table('users')
            ->select('id', 'name', 'email', 'image', 'last_online')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                $image = $user->image ?? null;
                if ($image) {
                    if (Str::startsWith($image, ['http://', 'https://'])) {
                        $imageUrl = $image;
                    } else {
                        $imageUrl = asset(Str::startsWith($image, ['storage/', '/storage/']) ? $image : 'storage/' . ltrim($image, '/'));
                    }
                } else {
                    $imageUrl = null;
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'image' => $imageUrl,
                    'last_online' => $user->last_online,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * User's own reservations
     */
    public function myReservations(Request $request)
    {
        $userId = auth()->id();
       $reservations = DB::table('reservations as r')
            ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
            ->select('r.*', 'u.name as user_name')
            ->where('r.user_id', $userId)
            ->orderByDesc('r.created_at')
            ->get()
            ->map(function ($r) {
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
                    'canceled' => (bool) ($r->canceled ?? 0),
                    'created_at' => $r->created_at ?? null,
                ];
            });
       // Include user's cowork reservations as well
       if (\Schema::hasTable('reservation_coworks')) {
           $coworkUserReservations = DB::table('reservation_coworks as rc')
               ->leftJoin('users as u', 'u.id', '=', 'rc.user_id')
               ->leftJoin('coworks as c', 'c.id', '=', 'rc.table')
               ->select('rc.*', 'u.name as user_name', 'c.table as table_number')
               ->where('rc.user_id', $userId)
               ->orderByDesc('rc.created_at')
               ->get()
               ->map(function ($r) {
                   return [
                       'id' => $r->id,
                       'user_name' => $r->user_name,
                       'date' => $r->day ?? null,
                       'start' => $r->start ?? null,
                       'end' => $r->end ?? null,
                       'type' => 'cowork',
                       'title' => $r->title ?? ('Cowork Table ' . ($r->table_number ?? $r->table ?? '')),
                       'description' => $r->description ?? null,
                       'approved' => (bool) ($r->approved ?? 0),
                       'canceled' => (bool) ($r->canceled ?? 0),
                       'created_at' => $r->created_at ?? null,
                   ];
               });
           // Merge and sort by created_at desc
           $reservations = $reservations->merge($coworkUserReservations)->sortByDesc(function ($r) {
               return $r['created_at'] ?? null;
           })->values();
       }
        // Add available studios
        $studios = DB::table('studios')
            ->select('id', 'name', 'state', 'image')
            ->orderBy('name')
            ->get()
            ->map(function ($studio) {
                $img = $studio->image ? (
                    str_starts_with($studio->image, 'http') || str_starts_with($studio->image, 'storage/')
                    ? $studio->image
                    : ('storage/img/studio/' . ltrim($studio->image, '/'))
                ) : null;
                return [
                    'id' => $studio->id,
                    'name' => $studio->name,
                    'state' => (bool) $studio->state,
                    'image' => $img ? asset($img) : null,
                    'type' => 'studio'
                ];
            });
        // Add available coworks
        $coworks = DB::table('coworks')
            ->select('id', 'table', 'state', 'image')
            ->orderBy('table')
            ->get()
            ->map(function ($cowork) {
                $img = $cowork->image ? (
                    str_starts_with($cowork->image, 'http') || str_starts_with($cowork->image, 'storage/')
                    ? $cowork->image
                    : ('storage/img/cowork/' . ltrim($cowork->image, '/'))
                ) : null;
                return [
                    'id' => $cowork->id,
                    'name' => 'Table ' . $cowork->table,
                    'state' => (bool) $cowork->state,
                    'image' => $img ? asset($img) : null,
                    'type' => 'cowork',
                ];
            });
        return Inertia::render('students/reservations/index', [
            'reservations' => $reservations,
            'studios' => $studios,
            'coworks' => $coworks,
        ]);
    }

    /**
     * Allow authenticated user to cancel their own reservation (handles both regular and cowork)
     */
    public function cancelOwn(int $reservation)
    {
        $userId = auth()->id();

        // Try regular reservations first
        if (Schema::hasTable('reservations')) {
            $row = DB::table('reservations')->where('id', $reservation)->first();
            if ($row && (int) ($row->user_id ?? 0) === (int) $userId) {
                DB::table('reservations')->where('id', $reservation)->update([
                    'canceled' => 1,
                    'approved' => 0,
                    'updated_at' => now(),
                ]);
                return back()->with('success', 'Reservation canceled');
            }
        }

        // Try cowork reservations
        if (Schema::hasTable('reservation_coworks')) {
            $coworkRow = DB::table('reservation_coworks')->where('id', $reservation)->first();
            if ($coworkRow && (int) ($coworkRow->user_id ?? 0) === (int) $userId) {
                DB::table('reservation_coworks')->where('id', $reservation)->update([
                    'canceled' => 1,
                    'approved' => 0,
                    'updated_at' => now(),
                ]);

                // Send cancellation email if needed
                try {
                    $reservationForEmail = (object) [
                        'user_name' => auth()->user()->name,
                        'title' => $coworkRow->title ?? 'Cowork Reservation',
                        'day' => $coworkRow->day,
                        'start' => $coworkRow->start,
                        'end' => $coworkRow->end,
                        'type' => 'cowork'
                    ];
                    $this->sendMailToReservationOwner(auth()->user(), new ReservationCanceledMail(auth()->user(), $reservationForEmail));
                } catch (\Exception $e) {
                    \Log::error('Failed to send cowork cancellation email: ' . $e->getMessage());
                }

                return back()->with('success', 'Reservation canceled');
            }
        }

        return back()->with('error', 'Reservation not found or you do not have permission to cancel it');
    }

    /**
     * Show details for a reservation belonging to the authenticated user only
     */
    // public function userDetails(int $reservation)
    // {
    //     $row = \DB::table('reservations as r')
    //         ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
    //         ->leftJoin('studios as s', 's.id', '=', 'r.studio_id')
    //         ->where('r.id', $reservation)
    //         ->select('r.*', 'u.name as user_name', 'u.email as user_email', 's.name as studio_name')
    //         ->first();
    //     if (!$row || $row->user_id != auth()->id()) {
    //         abort(404, 'Reservation not found.');
    //     }
    //     $equipments = [];
    //     if (\Schema::hasTable('reservation_equipment') && \Schema::hasTable('equipment')) {
    //         $equipments = \DB::table('reservation_equipment as re')
    //             ->leftJoin('equipment as e', 'e.id', '=', 're.equipment_id')
    //             ->leftJoin('equipment_types as et', 'et.id', '=', 'e.equipment_type_id')
    //             ->where('re.reservation_id', $reservation)
    //             ->select('e.id', 'e.reference', 'e.mark', 'e.image', 'et.name as type_name')
    //             ->get()
    //             ->map(function ($e) {
    //                 $img = $e->image;
    //                 if ($img && !str_starts_with($img, 'http') && !str_starts_with($img, 'storage/')) {
    //                     $img = 'img/equipment/' . ltrim($img, '/');
    //                 }
    //                 return [
    //                     'id' => $e->id,
    //                     'reference' => $e->reference,
    //                     'mark' => $e->mark,
    //                     'type_name' => $e->type_name,
    //                     'image' => $img,
    //                 ];
    //             });
    //     }
    //     $teamMembers = [];
    //     if (\Schema::hasTable('reservation_teams')) {
    //         $teamMembers = \DB::table('reservation_teams as rt')
    //             ->leftJoin('users as u', 'u.id', '=', 'rt.user_id')
    //             ->where('rt.reservation_id', $reservation)
    //             ->select('u.id', 'u.name', 'u.email', 'u.image')
    //             ->get()
    //             ->map(function ($u) {
    //                 $img = $u->image;
    //                 if ($img && !str_starts_with($img, 'http') && !str_starts_with($img, 'storage/')) {
    //                     $img = 'img/profile/' . ltrim($img, '/');
    //                 }
    //                 return [
    //                     'id' => $u->id,
    //                     'name' => $u->name,
    //                     'email' => $u->email,
    //                     'image' => $img,
    //                 ];
    //             });
    //     }
    //     $details = [
    //         'id' => $row->id,
    //         'user_name' => $row->user_name,
    //         'user_email' => $row->user_email,
    //         'studio_name' => $row->studio_name ?? null,
    //         'date' => $row->date ?? $row->day,
    //         'start' => $row->start,
    //         'end' => $row->end,
    //         'title' => $row->title,
    //         'description' => $row->description,
    //         'type' => $row->type,
    //         'approved' => (bool) ($row->approved ?? 0),
    //         'canceled' => (bool) ($row->canceled ?? 0),
    //         'equipments' => $equipments,
    //         'team_members' => $teamMembers,
    //     ];
    //     return Inertia::render('reservations/details', ['reservation' => $details]);
    // }
}
