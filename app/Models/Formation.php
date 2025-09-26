<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    use HasFactory;

    protected $fillable = [
        "name",
        "img",
        "start_time",
        "end_time",
    ];

    // public function attendances()
    // {
    //     return $this->hasMany(Attendance::class);
    // }
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
