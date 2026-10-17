<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSchoolNetworkRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user instanceof User) {
            return false;
        }

        return (bool) array_intersect($user->normalizedRoles(), ['admin', 'super_admin']);
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'ips' => ['required', 'array', 'size:3'],
            'ips.*' => ['required', 'string', 'max:45', 'ip', 'distinct'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ips.required' => 'Enter all three school network IPs.',
            'ips.size' => 'Enter all three school network IPs.',
            'ips.*.required' => 'Enter all three school network IPs.',
            'ips.*.ip' => 'Enter a valid IPv4 or IPv6 address.',
            'ips.*.distinct' => 'Each school network IP must be different.',
        ];
    }
}
