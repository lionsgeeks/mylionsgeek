<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'game_type',
        'game_state',
        'last_activity',
    ];

    protected $casts = [
        'game_state' => 'array',
        'last_activity' => 'datetime',
    ];

    /**
     * Get or create a game session for the given room
     */
    public static function getOrCreate($roomId, $gameType, $initialState = [])
    {
        return static::firstOrCreate(
            ['room_id' => $roomId],
            [
                'game_type' => $gameType,
                'game_state' => $initialState,
                'last_activity' => now(),
            ]
        );
    }

    /**
     * Update game state
     */
    public function updateState($newState)
    {
        // Preserve existing keys like 'players' if caller omits them
        $current = is_array($this->game_state) ? $this->game_state : [];
        $incoming = is_array($newState) ? $newState : [];
        // Shallow merge is enough because game_state is flat (board, isXNext, winner, gameOver, scores, players)
        $merged = array_merge($current, $incoming);

        $this->update([
            'game_state' => $merged,
            'last_activity' => now(),
        ]);
    }
}
