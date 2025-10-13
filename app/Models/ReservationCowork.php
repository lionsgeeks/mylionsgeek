<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReservationCowork extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'table',
        'user_id',
        'day',
        'start',
        'end',
        
    ];

    protected $casts = [
        'canceled' => 'boolean',
        'passed' => 'boolean',
        'approved' => 'boolean',
    ];

    
    public function user()
    {
        return $this->hasMany(User::class);
    }
}
