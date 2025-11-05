<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\Reservation;
use App\Models\ReservationCowork;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        // Check authentication
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $reservations = Reservation::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'title' => $reservation->title,
                    'description' => $reservation->description,
                    'day' => $reservation->day,
                    'start' => $reservation->start,
                    'end' => $reservation->end,
                    'approved' => $reservation->approved,
                    'canceled' => $reservation->canceled,
                    'created_at' => $reservation->created_at ? (is_string($reservation->created_at) ? $reservation->created_at : $reservation->created_at->toDateTimeString()) : null,
                    'updated_at' => $reservation->updated_at ? (is_string($reservation->updated_at) ? $reservation->updated_at : $reservation->updated_at->toDateTimeString()) : null,
                ];
            });

        return response()->json(['reservations' => $reservations]);
    }
    public function indexcowork(Request $request)
    {
        // Check authentication
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $reservations = ReservationCowork::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'title' => $reservation->table,
                    'start' => $reservation->start,
                    'end' => $reservation->end,
                    'day' => $reservation->day,
                    'approved' => $reservation->approved,
                    'canceled' => $reservation->canceled,
                    'created_at' => $reservation->created_at ? (is_string($reservation->created_at) ? $reservation->created_at : $reservation->created_at->toDateTimeString()) : null,
                    'updated_at' => $reservation->updated_at ? (is_string($reservation->updated_at) ? $reservation->updated_at : $reservation->updated_at->toDateTimeString()) : null,
                ];
            });

        return response()->json(['reservations' => $reservations]);
    }

    public function show(int $id)
    {
        if (!Schema::hasTable('reservations')) {
            return response()->json(['error' => 'reservations table not found'], 500);
        }

        $reservationData = DB::table('reservations as r')
            ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
            ->leftJoin('users as a', 'a.id', '=', 'r.approve_id')
            ->leftJoin('studios as s', 's.id', '=', 'r.studio_id')
            ->where('r.id', $id)
            ->select(
                'r.*',
                'u.name as user_name',
                'u.email as user_email',
                'u.phone as user_phone',
                'u.image as user_avatar',
                'a.name as approver_name',
                's.name as studio_name'
            )
            ->first();

        if (!$reservationData) {
            return response()->json(['error' => 'Reservation not found'], 404);
        }

        // Normalize user avatar path
        $userAvatar = $reservationData->user_avatar ?? null;
        if ($userAvatar && !Str::startsWith($userAvatar, ['http://', 'https://', 'storage/'])) {
            $userAvatar = 'img/profile/' . ltrim($userAvatar, '/');
        }

        // Get approver name (prefer joined value; fallback to direct lookup)
        $approverName = $reservationData->approver_name ?? null;
        if (!$approverName && $reservationData->approve_id) {
            $approver = DB::table('users')->where('id', $reservationData->approve_id)->value('name');
            $approverName = $approver ?: null;
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

        // Equipments
        $equipments = [];
        if (Schema::hasTable('reservation_equipment') && Schema::hasTable('equipment')) {
            $equipments = DB::table('reservation_equipment as re')
                ->leftJoin('equipment as e', 'e.id', '=', 're.equipment_id')
                ->leftJoin('equipment_types as et', 'et.id', '=', 'e.equipment_type_id')
                ->where('re.reservation_id', $id)
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

        // Team Members
        $members = [];
        if (Schema::hasTable('reservation_teams')) {
            $members = DB::table('reservation_teams as rt')
                ->leftJoin('users as u', 'u.id', '=', 'rt.user_id')
                ->where('rt.reservation_id', $id)
                ->select('u.name', 'u.email', 'u.image as avatar', 'u.phone')
                ->get()
                ->map(function ($member) {
                    $img = $member->avatar ?? null;
                    if ($img && !Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                        $img = 'img/profile/' . ltrim($img, '/');
                    }
                    return [
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
            'status' => $status,
            'approved' => (bool) $reservationData->approved,
            'canceled' => (bool) $reservationData->canceled,
            'passed' => (bool) $reservationData->passed,
            'start_signed' => (bool) $reservationData->start_signed,
            'end_signed' => (bool) $reservationData->end_signed,
            'notes' => $reservationData->description,
            'user_name' => $reservationData->user_name,
            'user_email' => $reservationData->user_email,
            'user_phone' => $reservationData->user_phone,
            'user_avatar' => $userAvatar,
            'studio_name' => $reservationData->studio_name,
            'approver_name' => $approverName,
            'equipments' => $equipments,
            'members' => $members,
        ];

        return response()->json([
            'reservation' => $reservation
        ]);
    }



    public function storemobile(Request $request)
    {
        // Check authentication
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }
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
            'user_id' => 'required|integer|exists:users,id', // added
        ]);


        try {
            $reservationId = null;

            DB::transaction(function () use ($validated, &$reservationId) {
                $lastId = (int) (DB::table('reservations')->max('id') ?? 0);
                $reservationId = $lastId + 1;

                DB::table('reservations')->insert([
                    'id' => $reservationId,
                    'studio_id' => $validated['studio_id'],
                    'user_id' => $validated['user_id'],
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
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);


                // Insert team members
                if (!empty($validated['team_members'])) {
                    $teamData = array_map(function ($userId) use ($reservationId) {
                        return [
                            'reservation_id' => $reservationId,
                            'user_id' => $userId,
                            'created_at' => now(),
                            'updated_at' => now(),
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
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }, $validated['equipment']);

                    DB::table('reservation_equipment')->insert($equipmentData);
                }
            });

            // Return JSON for API
            return response()->json([
                'success' => true,
                'reservation_id' => $reservationId,
                'message' => 'Reservation created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create reservation: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getEquipment()
    {
        // Check authentication
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }
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

    public function getUserss()
    {
        // Check authentication
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }

        $query = User::select('id', 'name', 'image')->orderBy('name');


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
}
