<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Models extends Model
{
    protected $fillable = [
        'name',
        'description',
        'badge1',
        'badge2',
        'badge3',
    ];
}
