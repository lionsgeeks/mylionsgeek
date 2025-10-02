<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Studio extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'state',
        'image',
    ];

    protected $casts = [
        'state' => 'boolean',
    ];

    /**
     * Studio has many reservations
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
