<?php

namespace App\Http\Requests;

use App\Models\Job;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JobPostingRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    protected function prepareForValidation(): void
    {
        $skillsInput = $this->input('skills');
        if (is_string($skillsInput)) {
            $parsed = array_values(array_unique(array_filter(array_map('trim', explode(',', $skillsInput)))));
            $this->merge(['skills' => $parsed]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'job_type' => ['required', 'string', Rule::in(Job::JOB_TYPES)],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:80'],
            'is_published' => ['sometimes', 'boolean'],
            'recruiter_ids' => ['nullable', 'array'],
            'recruiter_ids.*' => [
                'integer',
                Rule::exists('users', 'id')->where(fn ($q) => $q->whereJsonContains('role', 'recruiter')),
            ],
        ];
    }
}

