<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $reservations = Reservation::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'type' => $reservation->type,
                    'start' => $reservation->start,
                    'end' => $reservation->end,
                    'status' => $reservation->status ?? 'pending',
                    'canceled' => $reservation->canceled,
                    'created_at' => $reservation->created_at ? (is_string($reservation->created_at) ? $reservation->created_at : $reservation->created_at->toDateTimeString()) : null,
                    'updated_at' => $reservation->updated_at ? (is_string($reservation->updated_at) ? $reservation->updated_at : $reservation->updated_at->toDateTimeString()) : null,
                ];
            });

        return response()->json(['reservations' => $reservations]);
    }

    public function show(Request $request, $id)
    {
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
}
