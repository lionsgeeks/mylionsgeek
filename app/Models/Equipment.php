<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Equipment extends Model
{
    use HasFactory;

    protected $table = 'equipment';

    protected $fillable = [
        'id',
        'reference',
        'mark',
        'state',
        'equipment_type_id',
        'image',
    ];

    protected $casts = [
        'state' => 'boolean',
    ];

    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imagable');
    }
}


