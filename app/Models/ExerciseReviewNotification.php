<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExerciseReviewNotification extends Model
{
    protected $fillable = [
        'submission_id',
        'user_id',
        'coach_id',
        'exercice_id',
        'message_notification',
        'path',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Get the submission that this notification belongs to
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(ExerciseSubmission::class, 'submission_id');
    }

    /**
     * Get the student who requested the review
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the coach who should receive the notification
     */
    public function coach(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    /**
     * Get the exercise that this notification is about
     */
    public function exercice(): BelongsTo
    {
        return $this->belongsTo(Exercices::class, 'exercice_id');
    }
}
