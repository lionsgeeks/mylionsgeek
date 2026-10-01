<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TrainingSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_week_id',
        'formation_id',
        'date',
        'start_time',
        'end_time',
        'title',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function trainingWeek(): BelongsTo
    {
        return $this->belongsTo(TrainingWeek::class, 'training_week_id');
    }

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }

    public function coaches(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'session_coach', 'session_id', 'user_id')
            ->withTimestamps();
    }
}
