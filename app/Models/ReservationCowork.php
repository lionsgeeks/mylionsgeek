<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationCowork extends Model
{
    protected $table = 'reservation_coworks';

    protected $fillable = [
        'table',
        'seats',
        'day',
        'start',
        'end',
        'user_id',
        'approved',
        'canceled',
        'passed',
    ];

    protected $casts = [
        'canceled' => 'boolean',
        'passed' => 'boolean',
        'approved' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ✅ Relationship with Cowork (optional)
    public function cowork()
    {
        return $this->belongsTo(cowork::class, 'table', 'id');
    }
}
