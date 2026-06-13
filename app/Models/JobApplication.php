<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobApplication extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_UNDER_REVIEW = 'under_review';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_ACCEPTED = 'accepted';

    /** @var list<string> */
    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_UNDER_REVIEW,
        self::STATUS_REJECTED,
        self::STATUS_ACCEPTED,
    ];

    /** Statuses recruiters may set without recording an interview outcome. */
    public const RECRUITER_MANUAL_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_UNDER_REVIEW,
        self::STATUS_REJECTED,
        self::STATUS_ACCEPTED,
    ];

    protected $fillable = [
        'job_posting_id',
        'user_id',
        'subject',
        'cover_letter',
        'cv_path',
        'status',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class, 'job_posting_id');
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function recruiterInterviews(): HasMany
    {
        return $this->hasMany(RecruiterInterview::class, 'job_application_id');
    }
}
