<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeetingRoomImage extends Model
{
    protected $fillable = [
        'image',
        'meeting_room_id',
    ];

    public function meetingRoom()
    {
        return $this->belongsTo(MeetingRoom::class);
    }
}
