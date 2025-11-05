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

    public function show(Request $request, $id)
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

        $reservation = Reservation::where('user_id', $user->id)->find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }

        return response()->json([
            'id' => $reservation->id,
            'type' => $reservation->type,
            'start' => $reservation->start,
            'end' => $reservation->end,
            'status' => $reservation->status ?? 'pending',
            'canceled' => $reservation->canceled,
            'created_at' => $reservation->created_at ? (is_string($reservation->created_at) ? $reservation->created_at : $reservation->created_at->toDateTimeString()) : null,
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
