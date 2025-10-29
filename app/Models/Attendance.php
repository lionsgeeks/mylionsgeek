<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    // Use default auto-incrementing integer primary key (matches migrations)
    protected $keyType = 'int';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'formation_id',
        'attendance_day',
        'staff_name',
    ];
}
