<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'name',
        'description',
        'photo',
        'status',
        'start_date',
        'end_date',
        'created_by',
        'is_updated',
        'last_activity'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'last_activity' => 'datetime',
        'is_updated' => 'boolean'
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_users')
            ->withPivot('role', 'invited_at', 'joined_at')
            ->withTimestamps();
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(ProjectNote::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ProjectMessage::class)->orderBy('created_at', 'asc');
    }

    public function getActiveTasksCountAttribute()
    {
        return $this->tasks()->whereIn('status', ['todo', 'in_progress', 'review'])->count();
    }

    public function getCompletedTasksCountAttribute()
    {
        return $this->tasks()->where('status', 'completed')->count();
    }

    public function getProgressPercentageAttribute()
    {
        $total = $this->tasks()->count();
        if ($total === 0) return 0;
        return round(($this->completed_tasks_count / $total) * 100);
    }
}
