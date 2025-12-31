<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProject extends Model
{
    protected $table = 'student_projects';
    
    protected $fillable = [
        'user_id',
        'model_id',
        'title',
        'description',
        'image',
        'project',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'review_ratings',
        'review_notes',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'review_ratings' => 'array',
    ];

    public function getRouteKeyName()
    {
        return 'id';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(Models::class, 'model_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
