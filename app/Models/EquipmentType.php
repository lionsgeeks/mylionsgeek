<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EquipmentType extends Model
{
    use HasFactory;

    protected $table = 'equipment_types';

    protected $fillable = [
        'name',
    ];

    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class, 'equipment_type_id');
    }
}


