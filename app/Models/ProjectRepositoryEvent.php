<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectRepositoryEvent extends Model
{
    protected $fillable = [
        'project_id',
        'provider',
        'event_type',
        'action',
        'actor_name',
        'actor_avatar',
        'repository_name',
        'repository_url',
        'branch',
        'commit_sha',
        'title',
        'url',
        'payload',
        'occurred_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
