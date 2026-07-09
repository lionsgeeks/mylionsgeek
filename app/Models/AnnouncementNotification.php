<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnnouncementNotification extends Model
{
    protected $fillable = [
        'user_id',
        'announcement_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function announcement()
    {
        return $this->belongsTo(Announcement::class);
    }
}
