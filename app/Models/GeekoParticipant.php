<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GeekoParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'user_id',
        'nickname',
        'total_score',
        'correct_answers',
        'wrong_answers',
        'joined_at',
        'last_activity',
        'question_scores',
    ];

    protected $casts = [
        'question_scores' => 'array',
        'joined_at' => 'datetime',
        'last_activity' => 'datetime',
    ];

    /**
     * Get the session this participant belongs to.
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(GeekoSession::class, 'session_id');
    }

    /**
     * Get the user (student) participating.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the answers by this participant.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(GeekoAnswer::class, 'user_id', 'user_id')
            ->where('session_id', $this->session_id);
    }

    /**
     * Add score for a question.
     */
    public function addQuestionScore(int $questionId, int $score, bool $isCorrect): void
    {
        $questionScores = $this->question_scores ?? [];
        $questionScores[$questionId] = $score;

        $this->update([
            'question_scores' => $questionScores,
            'total_score' => $this->total_score + $score,
            'correct_answers' => $isCorrect ? $this->correct_answers + 1 : $this->correct_answers,
            'wrong_answers' => ! $isCorrect ? $this->wrong_answers + 1 : $this->wrong_answers,
            'last_activity' => now(),
        ]);
    }

    /**
     * Get accuracy percentage.
     */
    public function getAccuracy(): float
    {
        $totalAnswered = $this->correct_answers + $this->wrong_answers;

        return $totalAnswered > 0 ? ($this->correct_answers / $totalAnswered) * 100 : 0;
    }

    /**
     * Check if participant has answered a specific question.
     */
    public function hasAnsweredQuestion(int $questionId): bool
    {
        return $this->answers()->where('question_id', $questionId)->exists();
    }
}
