<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectNote extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'title',
        'content',
        'is_pinned',
        'tags',
        'attachments'
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'tags' => 'array',
        'attachments' => 'array'
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
