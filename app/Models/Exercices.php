<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exercices extends Model
{
    protected $fillable = [
        'title',
        'description',
        'file',
        'file_type',
        'training_id',
        'course_id',
        'xp',
    ];

    public function training()
    {
        return $this->belongsTo(Formation::class, 'training_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function submissions()
    {
        return $this->hasMany(ExerciseSubmission::class, 'exercice_id');
    }
}
