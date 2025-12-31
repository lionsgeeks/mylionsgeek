<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = [
        'name',
        'description',
        'badge1',
        'badge2',
        'badge3',
    ];

    public function exercices()
    {
        return $this->hasMany(Exercices::class, 'course_id');
    }
}
