<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventNotificationRead extends Model
{
    protected $fillable = [
        'user_id',
        'event_notification_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function eventNotification(): BelongsTo
    {
        return $this->belongsTo(EventNotification::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
