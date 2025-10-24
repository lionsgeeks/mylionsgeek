<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    protected $fillable = [
        'title',
        'description',
        'priority',
        'status',
        'project_id',
        'assigned_to',
        'created_by',
        'due_date',
        'sort_order'
    ];

    protected $casts = [
        'due_date' => 'date'
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    public function getPriorityColorAttribute()
    {
        return match($this->priority) {
            'low' => 'text-green-600 bg-green-100',
            'medium' => 'text-yellow-600 bg-yellow-100',
            'high' => 'text-orange-600 bg-orange-100',
            'urgent' => 'text-red-600 bg-red-100',
            default => 'text-gray-600 bg-gray-100'
        };
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'todo' => 'text-gray-600 bg-gray-100',
            'in_progress' => 'text-blue-600 bg-blue-100',
            'review' => 'text-purple-600 bg-purple-100',
            'completed' => 'text-green-600 bg-green-100',
            default => 'text-gray-600 bg-gray-100'
        };
    }
}
