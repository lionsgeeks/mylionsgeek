<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingWeek extends Model
{
    use HasFactory;

    protected $fillable = [
        'formation_id',
        'week_number',
        'title',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'week_number' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class, 'training_week_id');
    }
}
