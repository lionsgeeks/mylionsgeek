<?php

namespace App\Http\Controllers;

use Ably\AblyRest;
use App\Models\GameSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GamesController extends Controller
{
    public function index()
    {
        return Inertia::render('Games/Index');
    }

    public function snake()
    {
        return Inertia::render('Games/Snake');
    }

    public function ticTacToe()
    {
        return Inertia::render('Games/TicTacToe');
    }

    public function memory()
    {
        return Inertia::render('Games/Memory');
    }

    public function tetris()
    {
        return Inertia::render('Games/Tetris');
    }

    public function connectFour()
    {
        return Inertia::render('Games/ConnectFour');
    }

    public function rockPaperScissors()
    {
        return Inertia::render('Games/RockPaperScissors');
    }

    public function pacman()
    {
        return Inertia::render('Games/Pacman');
    }

    /**
     * Get Ably token for real-time game updates
     * Jib token dial Ably bach n3tiw access l channels dial games
     */
    public function getAblyToken()
    {
        $user = Auth::user();
        
        try {
            $ablyKey = config('services.ably.key');
            if (!$ablyKey) {
                return response()->json(['error' => 'Ably not configured'], 500);
            }

            // Generate token request using Ably PHP SDK
            $tokenRequest = [
                'capability' => json_encode([
                    'game:*' => ['subscribe', 'publish'], // Access l kolchi games
                ]),
                'clientId' => (string) $user->id,
            ];

            // Use Ably REST client to create token request
            $ably = new AblyRest($ablyKey);
            $tokenDetails = $ably->auth->requestToken($tokenRequest);

            return response()->json([
                'token' => $tokenDetails->token,
                'expires' => $tokenDetails->expires,
                'clientId' => (string) $user->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to generate token: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get game state for polling
     */
    public function getGameState(Request $request, $roomId)
    {
        $session = GameSession::where('room_id', $roomId)->first();
        
        if (!$session) {
            return response()->json([
                'exists' => false,
                'game_state' => null,
                'last_activity' => null,
            ]);
        }

        return response()->json([
            'exists' => true,
            'game_state' => $session->game_state,
            'last_activity' => $session->last_activity ? $session->last_activity->toIso8601String() : null,
        ]);
    }

    /**
     * Update game state (POST) - Saves to database and broadcasts via Ably
     * When Ayman (X) or Yahya (O) makes a move, the other sees it IMMEDIATELY
     */
    public function updateGameState(Request $request, $roomId)
    {
        $request->validate([
            'game_type' => 'required|string',
            'game_state' => 'required|array',
        ]);

        // Get or create session
        $session = GameSession::where('room_id', $roomId)->first();
        
        if (!$session) {
            // Create new session
            $session = GameSession::create([
                'room_id' => $roomId,
                'game_type' => $request->game_type,
                'game_state' => $request->game_state,
                'last_activity' => now(),
            ]);
        } else {
            // Update existing session - preserves players array
            $session->updateState($request->game_state);
        }
        
        // Refresh to get latest state from database
        $session->refresh();

        // Broadcast game state update via Ably for REAL-TIME updates
        // This ensures ALL players (Ayman and Yahya) see moves IMMEDIATELY
        try {
            $ablyKey = config('services.ably.key');
            if ($ablyKey) {
                $ably = new AblyRest($ablyKey);
                $channel = $ably->channels->get("game:{$roomId}");
                
                $broadcastData = [
                    'game_state' => $session->game_state,
                    'last_activity' => $session->last_activity->toIso8601String(),
                ];
                
                // Publish IMMEDIATELY with latest state from database
                // This broadcasts to ALL players in the room (Ayman and Yahya)
                $channel->publish('game-state-updated', $broadcastData);
                
                // Log for debugging
                \Illuminate\Support\Facades\Log::info("✅ REAL-TIME: Broadcasted game state to ALL players", [
                    'room_id' => $roomId,
                    'channel' => "game:{$roomId}",
                    'board' => $session->game_state['board'] ?? null,
                    'isXNext' => $session->game_state['isXNext'] ?? null,
                    'players_count' => isset($session->game_state['players']) ? count($session->game_state['players']) : 0,
                    'players' => $session->game_state['players'] ?? [],
                ]);
            } else {
                \Illuminate\Support\Facades\Log::warning('❌ Ably key not configured - real-time updates disabled');
            }
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Illuminate\Support\Facades\Log::error('❌ Failed to broadcast game state via Ably: ' . $e->getMessage(), [
                'room_id' => $roomId,
                'error' => $e->getTraceAsString(),
            ]);
        }

        return response()->json([
            'success' => true,
            'game_state' => $session->game_state,
            'last_activity' => $session->last_activity->toIso8601String(),
        ]);
    }

    /**
     * Reset game session - Saves to database and broadcasts via Ably
     */
    public function resetGameSession(Request $request, $roomId)
    {
        $session = GameSession::where('room_id', $roomId)->first();
        
        if ($session) {
            $session->updateState($request->get('initial_state', []));
        } else {
            $session = GameSession::getOrCreate(
                $roomId,
                $request->get('game_type', 'tictactoe'),
                $request->get('initial_state', [])
            );
        }
        
        // Refresh to get latest state
        $session->refresh();

        // Broadcast game reset via Ably for real-time updates
        try {
            $ablyKey = config('services.ably.key');
            if ($ablyKey) {
                $ably = new AblyRest($ablyKey);
                $channel = $ably->channels->get("game:{$roomId}");
                
                $broadcastData = [
                    'game_state' => $session->game_state,
                    'last_activity' => $session->last_activity->toIso8601String(),
                ];
                
                $channel->publish('game-reset', $broadcastData);
                
                \Illuminate\Support\Facades\Log::info("✅ Broadcasted game reset to ALL players in room game:{$roomId}");
            }
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Illuminate\Support\Facades\Log::error('❌ Failed to broadcast game reset via Ably: ' . $e->getMessage());
        }

        return response()->json(['success' => true]);
    }
}

