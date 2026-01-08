<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessRequestResponseNotification extends Model
{
    protected $fillable = [
        'user_id',
        'access_request_notification_id',
        'status', // 'approved' or 'denied'
        'denial_reason',
        'reviewed_by',
        'message_notification',
        'path',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Get the user who requested access
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the access request notification
     */
    public function accessRequest(): BelongsTo
    {
        return $this->belongsTo(AccessRequestNotification::class, 'access_request_notification_id');
    }

    /**
     * Get the admin who reviewed the request
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}

