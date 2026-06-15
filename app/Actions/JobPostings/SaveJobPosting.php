<?php

namespace App\Actions\JobPostings;

use App\Models\Job;
use Illuminate\Support\Carbon;

class SaveJobPosting
{
    /**
     * @param  array{
     *   title: string,
     *   description: string,
     *   location?: string|null,
     *   job_type: string,
     *   skills?: array<int, string>|null,
     *   is_published?: bool|null,
     *   application_deadline: string
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
            'application_deadline' => $data['application_deadline'],
            'is_published' => $this->resolveIsPublished($data),
            'user_id' => $creatorUserId,
        ]);

        $job->organizations()->sync($organizationIds);

        return $job;
    }

    /**
     * @param  array{
     *   title: string,
     *   description: string,
     *   location?: string|null,
     *   job_type: string,
     *   skills?: array<int, string>|null,
     *   is_published?: bool|null,
     *   application_deadline: string
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
            'application_deadline' => $data['application_deadline'],
            'is_published' => $this->resolveIsPublished($data),
        ]);

        $job->organizations()->sync($organizationIds);

        return $job;
    }

    /**
     * @param  array{ is_published?: bool|null, application_deadline: string }  $data
     */
    private function resolveIsPublished(array $data): bool
    {
        $deadline = Carbon::parse($data['application_deadline'])->startOfDay();
        if ($deadline->lt(now()->startOfDay())) {
            return false;
        }

        return (bool) ($data['is_published'] ?? true);
    }
}
