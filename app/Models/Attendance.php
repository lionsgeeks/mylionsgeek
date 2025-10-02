<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'id',
        'formation_id',
        'attendance_day',
        'staff_name',
    ];
}
