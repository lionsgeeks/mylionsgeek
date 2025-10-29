<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeetingRoom extends Model
{
    protected $fillable = [
        'name',
        'state',
    ];

    protected $casts = [
        'state' => 'integer',
    ];

    public function images()
    {
        return $this->hasMany(MeetingRoomImage::class);
    }

    public function reservations()
    {
        return $this->hasMany(ReservationMeetingRoom::class);
    }
}
