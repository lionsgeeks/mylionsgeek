<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostReportNotification extends Model
{
    protected $fillable = [
        'notified_user_id',
        'post_report_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function notifiedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'notified_user_id');
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(PostReport::class, 'post_report_id');
    }
}

