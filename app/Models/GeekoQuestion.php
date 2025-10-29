<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GeekoQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'geeko_id',
        'question',
        'question_image',
        'type',
        'options',
        'correct_answers',
        'points',
        'time_limit',
        'order_index',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_answers' => 'array',
    ];

    /**
     * Get the Geeko that owns this question.
     */
    public function geeko(): BelongsTo
    {
        return $this->belongsTo(Geeko::class);
    }

    /**
     * Get the answers for this question.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(GeekoAnswer::class, 'question_id');
    }

    /**
     * Check if the given answer is correct.
     */
    public function isCorrectAnswer($answer): bool
    {
        $correctAnswers = $this->correct_answers;

        // Ensure correct_answers is always an array
        if (is_string($correctAnswers)) {
            $correctAnswers = json_decode($correctAnswers, true) ?: [];
        }

        if (! is_array($correctAnswers)) {
            $correctAnswers = [];
        }

        if ($this->type === 'multiple_choice') {
            return in_array($answer, $correctAnswers);
        } elseif ($this->type === 'true_false') {
            return $answer === $correctAnswers[0];
        } elseif ($this->type === 'type_answer') {
            // Case-insensitive comparison for typed answers
            return in_array(strtolower(trim($answer)), array_map('strtolower', $correctAnswers));
        }

        return false;
    }

    /**
     * Calculate points based on time taken.
     */
    public function calculatePoints(int $timeTaken): int
    {
        $timeLimit = $this->time_limit ?? $this->geeko->time_limit;
        $basePoints = $this->points;

        // Give full points if answered quickly, reduce points as time increases
        $timeRatio = max(0, ($timeLimit - $timeTaken) / $timeLimit);

        return (int) ($basePoints * $timeRatio);
    }
}
