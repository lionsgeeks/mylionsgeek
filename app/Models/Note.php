<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $table = 'notes'; 

    protected $fillable = [
        'id',
        'user_id',
        'attendance_id',
        'note',
        'author',
    ];

    public $timestamps = true; 
}
