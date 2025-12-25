<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    //
    protected $fillable = [
        'school',
        'degree',
        'field_of_study',
        'start_month',
        'start_year',
        'end_month',
        'end_year',
        'description',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }
}
