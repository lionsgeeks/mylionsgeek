<?php

namespace App\Actions\JobPostings;

use App\Models\Job;

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
     * @param  list<int>  $recruiterIds
     */
    public function create(array $data, int $creatorUserId, array $recruiterIds = []): Job
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

        $job->recruiters()->sync($recruiterIds);

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
     * @param  list<int>  $recruiterIds
     */
    public function update(Job $job, array $data, array $recruiterIds = []): Job
    {
        $job->update([
            'title' => $data['title'],
            'description' => $data['description'],
            'location' => $data['location'] ?? null,
            'job_type' => $data['job_type'],
            'skills' => array_values(array_filter($data['skills'] ?? [])),
            'is_published' => (bool) ($data['is_published'] ?? true),
        ]);

        $job->recruiters()->sync($recruiterIds);

        return $job;
    }
}

