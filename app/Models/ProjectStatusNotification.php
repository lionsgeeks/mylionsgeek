<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectStatusNotification extends Model
{
    protected $fillable = [
        'project_id',
        'student_id',
        'reviewer_id',
        'status',
        'rejection_reason',
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
     * Get the student who owns the project
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the reviewer (admin/coach) who approved/rejected
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
