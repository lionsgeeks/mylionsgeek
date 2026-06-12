<?php

namespace App\Actions\JobPostings;

use App\Models\Job;
use Illuminate\Validation\ValidationException;

class DeleteJobPosting
{
    public function delete(Job $job): void
    {
        if ($job->applications()->exists()) {
            throw ValidationException::withMessages([
                'job' => [__('Cannot delete this job posting because it has applications. Unpublish it or wait until applications are removed.')],
            ]);
        }

        $job->delete();
    }
}
