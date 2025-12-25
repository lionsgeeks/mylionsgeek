<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExerciseSubmission extends Model
{
    protected $fillable = [
        'exercice_id',
        'user_id',
        'submission_link',
        'notes',
        'rating',
        'rating_comment',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
    ];

    public function exercice()
    {
        return $this->belongsTo(Exercices::class, 'exercice_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
