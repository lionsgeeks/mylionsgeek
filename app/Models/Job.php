<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Job extends Model
{
    public const JOB_TYPES = ['full_time', 'part_time', 'internship', 'contract'];

    /** Laravel reserves the `jobs` table for the database queue driver. */
    protected $table = 'job_postings';

    protected $fillable = [
        'reference',
        'title',
        'description',
        'location',
        'job_type',
        'skills',
        'is_published',
        'application_deadline',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'is_published' => 'boolean',
            'application_deadline' => 'date',
        ];
    }

    public function isApplicationDeadlinePassed(): bool
    {
        if ($this->application_deadline === null) {
            return true;
        }

        return $this->application_deadline->toDateString() < now()->toDateString();
    }

    public function isOpenForApplications(): bool
    {
        if (! $this->is_published || $this->application_deadline === null) {
            return false;
        }

        return ! $this->isApplicationDeadlinePassed();
    }

    /** Admin user who created this posting (not assigned recruiters). */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class, 'job_posting_organization', 'job_posting_id', 'organization_id')->withTimestamps();
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'job_posting_id');
    }

    public function scopePublished($query)
    {
        return $query
            ->where('is_published', true)
            ->whereNotNull('application_deadline')
            ->whereDate('application_deadline', '>=', now()->toDateString());
    }

    public function scopeForOrganization($query, int $organizationId)
    {
        return $query->whereHas('organizations', fn ($q) => $q->where('organizations.id', $organizationId));
    }

    public static function generateUniqueReference(): string
    {
        do {
            $reference = 'LG-JOB-'.now()->format('Y').'-'.Str::upper(Str::random(6));
        } while (static::query()->where('reference', $reference)->exists());

        return $reference;
    }
}
