<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class JobApplicationNotification extends Model
{
    protected $fillable = [
        'notified_user_id',
        'job_application_id',
        'applicant_id',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    public function notifiedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'notified_user_id');
    }

    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class, 'job_application_id');
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'applicant_id');
    }

    /**
     * Notify organisation account and employer recruiters for a new application.
     */
    public static function notifyRecruiters(Job $job, JobApplication $application, User $applicant): void
    {
        $job->loadMissing(['organizations.accountUser', 'organizations.employers']);

        $recipients = $job->organizations
            ->flatMap(function (Organization $org) {
                $users = collect();
                if ($org->accountUser) {
                    $users->push($org->accountUser);
                }

                return $users->merge($org->employers);
            })
            ->filter(fn ($u) => $u instanceof User && $u->isRecruiter());

        if ($recipients->isEmpty() && $job->creator) {
            $recipients = collect([$job->creator]);
        }

        $sentTo = [];
        foreach ($recipients as $recipient) {
            $userId = (int) $recipient->id;
            if ($userId === (int) $applicant->id || isset($sentTo[$userId])) {
                continue;
            }
            $sentTo[$userId] = true;

            static::create([
                'notified_user_id' => $userId,
                'job_application_id' => $application->id,
                'applicant_id' => $applicant->id,
            ]);
        }
    }
}
