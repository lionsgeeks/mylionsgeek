<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessRequestNotification extends Model
{
    protected $fillable = [
        'user_id',
        'requested_access_type', // 'studio', 'cowork', or 'both'
        'message',
        'status', // 'pending', 'approved', 'denied'
        'denial_reason',
        'reviewed_by',
        'reviewed_at',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the user who requested access
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the admin who reviewed the request
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}

