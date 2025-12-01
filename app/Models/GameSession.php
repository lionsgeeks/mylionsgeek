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
     * Update game state - Preserves players array and other important data
     */
    public function updateState($newState)
    {
        // Get current state from database
        $current = is_array($this->game_state) ? $this->game_state : [];
        $incoming = is_array($newState) ? $newState : [];
        
        // Preserve players array if not in incoming state
        if (!isset($incoming['players']) && isset($current['players'])) {
            $incoming['players'] = $current['players'];
        }
        
        // Preserve scores if not in incoming state (for move updates)
        if (!isset($incoming['scores']) && isset($current['scores'])) {
            $incoming['scores'] = $current['scores'];
        }
        
        // Merge: incoming state overwrites current, but we preserve players and scores
        $merged = array_merge($current, $incoming);
        
        // Ensure players array is preserved (don't overwrite with empty)
        if (isset($current['players']) && is_array($current['players']) && count($current['players']) > 0) {
            if (!isset($merged['players']) || !is_array($merged['players']) || count($merged['players']) === 0) {
                $merged['players'] = $current['players'];
            }
        }

        // Save to database
        $this->update([
            'game_state' => $merged,
            'last_activity' => now(),
        ]);
        
        // Refresh to ensure we have the latest data
        $this->refresh();
    }
}
