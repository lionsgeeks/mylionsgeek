<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMessageNotification extends Model
{
    protected $fillable = [
        'project_id',
        'message_id',
        'notified_user_id', // User who receives the notification
        'sender_user_id', // User who sent the message
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
        return $this->belongsTo(Project::class, 'project_id');
    }

    /**
     * Get the message that this notification is about
     */
    public function message(): BelongsTo
    {
        return $this->belongsTo(ProjectMessage::class, 'message_id');
    }

    /**
     * Get the user who receives the notification
     */
    public function notifiedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'notified_user_id');
    }

    /**
     * Get the user who sent the message
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }
}

