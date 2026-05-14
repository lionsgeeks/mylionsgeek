<?php

namespace App\Actions\JobPostings;

use App\Models\Job;
use App\Models\User;

class SaveJobPosting
{
    /**
     * @param  array{
     *   title: string,
     *   description: string,
     *   location?: string|null,
     *   job_type: string,
     *   skills?: array<int, string>|null,
     *   is_published?: bool|null
     * }  $data
     * @param  list<int>  $organizationIds
     */
    public function create(array $data, int $creatorUserId, array $organizationIds = []): Job
    {
        $job = Job::query()->create([
            'reference' => Job::generateUniqueReference(),
            'title' => $data['title'],
            'description' => $data['description'],
            'location' => $data['location'] ?? null,
            'job_type' => $data['job_type'],
            'skills' => array_values(array_filter($data['skills'] ?? [])),
            'is_published' => (bool) ($data['is_published'] ?? true),
            'user_id' => $creatorUserId,
        ]);

        $job->organizations()->sync($organizationIds);
        $this->syncLegacyRecruiterPivot($job, $organizationIds);

        return $job;
    }

    /**
     * @param  array{
     *   title: string,
     *   description: string,
     *   location?: string|null,
     *   job_type: string,
     *   skills?: array<int, string>|null,
     *   is_published?: bool|null
     * }  $data
     * @param  list<int>  $organizationIds
     */
    public function update(Job $job, array $data, array $organizationIds = []): Job
    {
        $job->update([
            'title' => $data['title'],
            'description' => $data['description'],
            'location' => $data['location'] ?? null,
            'job_type' => $data['job_type'],
            'skills' => array_values(array_filter($data['skills'] ?? [])),
            'is_published' => (bool) ($data['is_published'] ?? true),
        ]);

        $job->organizations()->sync($organizationIds);
        $this->syncLegacyRecruiterPivot($job, $organizationIds);

        return $job;
    }

    /**
     * Keep job_posting_recruiter in sync for legacy code paths during transition.
     *
     * @param  list<int>  $organizationIds
     */
    private function syncLegacyRecruiterPivot(Job $job, array $organizationIds): void
    {
        if ($organizationIds === []) {
            $job->recruiters()->sync([]);

            return;
        }

        $recruiterUserIds = User::query()
            ->whereIn('organization_id', $organizationIds)
            ->whereJsonContains('role', 'recruiter')
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $job->recruiters()->sync($recruiterUserIds);
    }
}
