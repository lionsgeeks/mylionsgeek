<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Computer extends Model
{
    use HasFactory;
    // Use default auto-increment integer ID
    protected $fillable = [
        'id',
        'reference', 
        'cpu', 
        'gpu', 
        'state', 
        'mark', 
        'user_id', 
        'start', 
        'end'
    ];

    protected $casts = [
        'start' => 'date',
        'end' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(ComputerHistory::class, 'computer_id', 'id')->orderBy('start', 'desc');
    }

    /**
     * Normalize stored state to working | not_working | damaged.
     */
    public static function normalizeState(mixed $state, ?int $userId = null): string
    {
        if ($state !== null && $state !== '') {
            $normalized = strtolower(trim((string) $state));

            if (in_array($normalized, ['working', 'not_working', 'damaged'], true)) {
                return $normalized;
            }

            $legacyMap = [
                '0' => 'not_working',
                '1' => 'working',
                '2' => 'damaged',
            ];

            if (isset($legacyMap[$normalized])) {
                return $legacyMap[$normalized];
            }
        }

        return ($userId && (int) $userId !== 0) ? 'working' : 'not_working';
    }
}


