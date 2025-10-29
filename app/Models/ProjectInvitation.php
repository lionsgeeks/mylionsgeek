<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ProjectInvitation extends Model
{
    protected $fillable = [
        'token',
        'project_id',
        'email',
        'username',
        'role',
        'message',
        'is_used',
        'expires_at',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public static function createInvitation($projectId, $email = null, $username = null, $role = 'member', $message = null)
    {
        return self::create([
            'token' => Str::random(32),
            'project_id' => $projectId,
            'email' => $email,
            'username' => $username,
            'role' => $role,
            'message' => $message,
            'expires_at' => now()->addDays(7), // 7 days expiry
        ]);
    }

    public function isExpired()
    {
        return $this->expires_at->isPast();
    }

    public function isValid()
    {
        return ! $this->is_used && ! $this->isExpired();
    }
}
