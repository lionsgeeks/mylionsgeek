<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class GeekoSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'geeko_id',
        'session_code',
        'started_by',
        'status',
        'current_question_index',
        'current_question_started_at',
        'started_at',
        'ended_at',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
        'current_question_started_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->session_code)) {
                $model->session_code = strtoupper(Str::random(8));
            }
        });
    }

    /**
     * Get the Geeko that owns this session.
     */
    public function geeko(): BelongsTo
    {
        return $this->belongsTo(Geeko::class);
    }

    /**
     * Get the user who started this session.
     */
    public function starter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'started_by');
    }

    /**
     * Get the participants in this session.
     */
    public function participants(): HasMany
    {
        return $this->hasMany(GeekoParticipant::class, 'session_id');
    }

    /**
     * Get the answers for this session.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(GeekoAnswer::class, 'session_id');
    }

    /**
     * Get the current question for this session.
     */
    public function currentQuestion()
    {
        $questions = $this->geeko->questions()->get();
        return $questions->skip($this->current_question_index)->first();
    }

    /**
     * Get the next question for this session.
     */
    public function nextQuestion()
    {
        $nextIndex = $this->current_question_index + 1;
        return $this->geeko->questions()->skip($nextIndex)->first();
    }

    /**
     * Check if session has more questions.
     */
    public function hasMoreQuestions(): bool
    {
        return $this->current_question_index < $this->geeko->questions()->count() - 1;
    }

    /**
     * Move to the next question.
     */
    public function moveToNextQuestion(): bool
    {
        if ($this->hasMoreQuestions()) {
            $this->increment('current_question_index');
            $this->update(['current_question_started_at' => now()]);
            return true;
        }
        return false;
    }

    /**
     * Complete the session.
     */
    public function complete(): void
    {
        $this->update([
            'status' => 'completed',
            'ended_at' => now(),
        ]);
    }

    /**
     * Get leaderboard for this session.
     */
    public function getLeaderboard()
    {
        return $this->participants()
            ->with('user')
            ->orderBy('total_score', 'desc')
            ->orderBy('correct_answers', 'desc')
            ->get();
    }
}