<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventNotification extends Model
{
    protected $fillable = [
        'lionsgeek_event_id',
        'title',
        'message',
    ];

    public function reads(): HasMany
    {
        return $this->hasMany(EventNotificationRead::class);
    }
}
