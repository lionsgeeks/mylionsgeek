<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    //
    protected $fillable = [
        'title',
        'description',
        'employement_type',
        'company',
        'start_month',
        'start_year',
        'end_month',
        'end_year',
        'location',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }
}
