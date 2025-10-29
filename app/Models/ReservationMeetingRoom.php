<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationMeetingRoom extends Model
{
    protected $fillable = [
        'meeting_room_id',
        'day',
        'start',
        'end',
        'canceled',
        'passed',
        'approved',
        'user_id',
    ];

    protected $casts = [
        'canceled' => 'boolean',
        'passed' => 'boolean',
        'approved' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function meetingRoom()
    {
        return $this->belongsTo(MeetingRoom::class);
    }
}
