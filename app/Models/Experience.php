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
        'start_date',
        'end_date',
        'location',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }
}
