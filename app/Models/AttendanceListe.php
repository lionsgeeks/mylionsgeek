<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceListe extends Model
{
    protected $table = 'attendance_lists';

    protected $fillable = [
        'user_id',
        'attendance_id',
        'attendance_day',
        'morning',
        'lunch',
        'evening',
    ];

    public $timestamps = true;
}
