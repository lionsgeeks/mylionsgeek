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
        'model_id',
        'xp',
    ];

    public function training()
    {
        return $this->belongsTo(Formation::class, 'training_id');
    }

    public function model()
    {
        return $this->belongsTo(Models::class, 'model_id');
    }

    public function submissions()
    {
        return $this->hasMany(ExerciseSubmission::class, 'exercice_id');
    }
}
