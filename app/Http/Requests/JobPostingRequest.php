<?php

namespace App\Http\Requests;

use App\Models\Job;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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
        $deadlineRules = ['required', 'date'];
        if ($this->isMethod('post')) {
            $deadlineRules[] = 'after_or_equal:today';
        }

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:50000', function (string $attribute, mixed $value, \Closure $fail): void {
                if (! is_string($value) || trim(strip_tags($value)) === '') {
                    $fail(__('The description field is required.'));
                }
            }],
            'location' => ['nullable', 'string', 'max:255'],
            'job_type' => ['required', 'string', Rule::in(Job::JOB_TYPES)],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:80'],
            'application_deadline' => $deadlineRules,
            'is_published' => ['sometimes', 'boolean'],
            'organization_ids' => ['nullable', 'array'],
            'organization_ids.*' => [
                'integer',
                Rule::exists('organizations', 'id')->whereNotNull('onboarding_completed_at'),
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $deadline = $this->input('application_deadline');
            if (! is_string($deadline) || $deadline === '') {
                return;
            }

            $deadlineDay = Carbon::parse($deadline)->startOfDay();
            if ($this->boolean('is_published') && $deadlineDay->lt(now()->startOfDay())) {
                $validator->errors()->add(
                    'is_published',
                    __('Cannot publish a job after its application deadline has passed. Extend the deadline or leave it unpublished.')
                );
            }
        });
    }
}
