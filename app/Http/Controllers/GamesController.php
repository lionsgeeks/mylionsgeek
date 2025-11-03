<?php

namespace App\Http\Controllers;

use App\Models\GameSession;
use Illuminate\Http\Request;
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
     * Update game state (POST)
     */
    public function updateGameState(Request $request, $roomId)
    {
        $request->validate([
            'game_type' => 'required|string',
            'game_state' => 'required|array',
        ]);

        $session = GameSession::getOrCreate(
            $roomId,
            $request->game_type,
            $request->game_state
        );

        $session->updateState($request->game_state);

        return response()->json([
            'success' => true,
            'game_state' => $session->game_state,
            'last_activity' => $session->last_activity->toIso8601String(),
        ]);
    }

    /**
     * Reset game session
     */
    public function resetGameSession(Request $request, $roomId)
    {
        $session = GameSession::where('room_id', $roomId)->first();
        
        if ($session) {
            $session->updateState($request->get('initial_state', []));
        } else {
            GameSession::getOrCreate(
                $roomId,
                $request->get('game_type', 'tictactoe'),
                $request->get('initial_state', [])
            );
        }

        return response()->json(['success' => true]);
    }
}

