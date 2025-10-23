<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'id',
        'title',
        'description',
        'day',
        'start',
        'end',
        'user_id',
        'studio_id',
        'type',
        'approved',
        'approve_id',
        'canceled',
        'passed',
        'start_signed',
        'end_signed',
    ];

    public $incrementing = true;
    protected $keyType = 'int';
    
    protected $casts = [
        'approved' => 'boolean',
        'canceled' => 'boolean',
        'passed' => 'boolean',
        'start_signed' => 'boolean',
        'end_signed' => 'boolean',
    ];

    // Relations...
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function studio()
    {
        return $this->belongsTo(Studio::class);
    }

    public function teamMembers()
    {
        return $this->belongsToMany(User::class, 'reservation_teams', 'reservation_id', 'user_id')->withTimestamps();
    }

    public function equipment()
    {
        return $this->belongsToMany(Equipment::class, 'reservation_equipment', 'reservation_id', 'equipment_id')->withPivot('day', 'start', 'end')->withTimestamps();
    }
}
