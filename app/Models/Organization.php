<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    protected $fillable = [
        'email',
        'enterprise_name',
        'contact_name',
        'sector',
        'location',
        'linkedin_url',
        'phone',
        'invited_by',
        'onboarding_completed_at',
        'account_state',
    ];

    protected function casts(): array
    {
        return [
            'onboarding_completed_at' => 'datetime',
            'account_state' => 'integer',
        ];
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'organization_id');
    }

    public function jobPostings(): BelongsToMany
    {
        return $this->belongsToMany(Job::class, 'job_posting_organization', 'organization_id', 'job_posting_id')->withTimestamps();
    }

    public function hasCompletedOnboarding(): bool
    {
        return $this->onboarding_completed_at !== null;
    }

    public function displayName(): string
    {
        return $this->enterprise_name
            ?? $this->contact_name
            ?? $this->email;
    }
}
