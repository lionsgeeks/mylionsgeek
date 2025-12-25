<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DisciplineNotification extends Model
{
    protected $fillable = [
        'user_id',
        'message_notification',
        'discipline_change',
        'path',
        'type',
    ];

    protected $casts = [
        'discipline_change' => 'decimal:2',
    ];

    /**
     * Get the user that this notification belongs to
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the coach for this user's formation
     */
    public function getCoach()
    {
        if ($this->user && $this->user->formation) {
            return $this->user->formation->coach;
        }
        return null;
    }
}

