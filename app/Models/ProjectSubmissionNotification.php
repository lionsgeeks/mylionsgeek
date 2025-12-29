<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectSubmissionNotification extends Model
{
    protected $fillable = [
        'project_id',
        'student_id',
        'notified_user_id',
        'message_notification',
        'path',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Get the project that this notification belongs to
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(StudentProject::class, 'project_id');
    }

    /**
     * Get the student who submitted the project
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the user who should receive the notification (admin or coach)
     */
    public function notifiedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'notified_user_id');
    }
}
