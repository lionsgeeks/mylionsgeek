<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectMessage extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'content',
        'reply_to',
        'attachment_path',
        'attachment_type',
        'attachment_name',
        'audio_duration',
    ];

    /**
     * Get the project this message belongs to
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who sent this message
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the message this is a reply to
     */
    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(ProjectMessage::class, 'reply_to');
    }

    /**
     * Get all reactions for this message
     */
    public function reactions(): HasMany
    {
        return $this->hasMany(ProjectMessageReaction::class, 'message_id');
    }
}
