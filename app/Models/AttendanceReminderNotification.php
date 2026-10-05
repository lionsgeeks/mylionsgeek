<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceReminderNotification extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'slot',
        'message_notification',
        'path',
        'read_at',
    ];

    protected $casts = [
        'date' => 'date',
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
