<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PushTokenController extends Controller
{
    /**
     * Save or update the Expo push token for the authenticated user
     */
    public function store(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'expo_push_token' => 'required|string',
        ]);

        try {
            $user->expo_push_token = $request->expo_push_token;
            $user->save();

            Log::info('Expo push token saved', [
                'user_id' => $user->id,
                'token_preview' => substr($request->expo_push_token, 0, 20) . '...',
            ]);

            return response()->json([
                'message' => 'Push token saved successfully',
                'success' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to save Expo push token', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to save push token',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
