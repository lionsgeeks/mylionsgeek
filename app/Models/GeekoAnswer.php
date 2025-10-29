<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeekoAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'question_id',
        'user_id',
        'selected_answer',
        'is_correct',
        'points_earned',
        'time_taken',
        'answered_at',
    ];

    protected $casts = [
        'selected_answer' => 'array',
        'is_correct' => 'boolean',
        'answered_at' => 'datetime',
    ];

    /**
     * Get the session this answer belongs to.
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(GeekoSession::class, 'session_id');
    }

    /**
     * Get the question this answer is for.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(GeekoQuestion::class, 'question_id');
    }

    /**
     * Get the user who gave this answer.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the participant record for this answer.
     */
    public function participant(): BelongsTo
    {
        return $this->belongsTo(GeekoParticipant::class, 'user_id', 'user_id')
            ->where('session_id', $this->session_id);
    }
}
