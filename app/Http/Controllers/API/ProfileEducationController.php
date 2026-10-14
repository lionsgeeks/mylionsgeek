<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Education;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProfileEducationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate($this->rules(partial: false));
        $this->assertValidPeriod($data);

        $education = DB::transaction(function () use ($user, $data) {
            $education = Education::create($this->attributes($data));
            $user->educations()->attach($education->id);

            return $education;
        });

        return response()->json([
            'message' => 'Education created',
            'data' => $this->present($education),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $education = Education::find($id);
        if (! $education) {
            return response()->json(['message' => 'Education not found'], 404);
        }

        if (! $this->owns($user, $education)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate($this->rules(partial: true));
        $this->assertValidPeriod($data, $education);

        $education->fill($this->attributes($data, $education));
        $education->save();

        return response()->json([
            'message' => 'Education updated',
            'data' => $this->present($education),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $education = Education::find($id);
        if (! $education) {
            return response()->json(['message' => 'Education not found'], 404);
        }

        if (! $this->owns($user, $education)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        DB::transaction(function () use ($user, $education) {
            $user->educations()->detach($education->id);
            $education->delete();
        });

        return response()->json(['message' => 'Education deleted']);
    }

    private function rules(bool $partial): array
    {
        $required = $partial ? 'sometimes|required' : 'required';
        $optional = $partial ? 'sometimes|nullable' : 'nullable';
        $currentYear = (int) date('Y');

        return [
            'institution' => $required.'|string|max:255',
            'degree' => $optional.'|string|max:255',
            'field' => $optional.'|string|max:255',
            'start_month' => $required.'|integer|min:1|max:12',
            'start_year' => $required.'|integer|min:1900|max:'.$currentYear,
            'end_month' => 'sometimes|nullable|integer|min:1|max:12',
            'end_year' => 'sometimes|nullable|integer|min:1900|max:'.$currentYear,
            'is_current' => 'sometimes|nullable|boolean',
            'description' => $optional.'|string|max:255',
        ];
    }

    /**
     * A finished entry needs an end date that is not before the start date.
     * An entry marked as current has no end date.
     */
    private function assertValidPeriod(array $data, ?Education $existing = null): void
    {
        if (! empty($data['is_current'])) {
            return;
        }

        $startYear = (int) ($data['start_year'] ?? $existing?->start_year);
        $startMonth = (int) ($data['start_month'] ?? $existing?->start_month);
        $endYear = array_key_exists('end_year', $data) ? $data['end_year'] : $existing?->end_year;
        $endMonth = array_key_exists('end_month', $data) ? $data['end_month'] : $existing?->end_month;

        if ($existing === null && ($endYear === null || $endMonth === null)) {
            throw ValidationException::withMessages([
                'end_year' => 'An end date is required unless the education is current.',
            ]);
        }

        if ($endYear === null || $endMonth === null) {
            return;
        }

        $endYear = (int) $endYear;
        $endMonth = (int) $endMonth;

        if ($endYear < $startYear || ($endYear === $startYear && $endMonth < $startMonth)) {
            throw ValidationException::withMessages([
                'end_year' => 'The end date cannot be before the start date.',
            ]);
        }
    }

    /**
     * Map validated mobile fields to the education table columns.
     */
    private function attributes(array $data, ?Education $existing = null): array
    {
        $isCurrent = (bool) ($data['is_current'] ?? false);
        $has = fn (string $key) => array_key_exists($key, $data);
        $string = fn ($value) => $value === null ? null : (string) $value;

        $attributes = [];

        if ($has('institution')) {
            $attributes['school'] = $data['institution'];
        }
        if ($has('degree')) {
            $attributes['degree'] = $data['degree'];
        }
        if ($has('field')) {
            $attributes['field_of_study'] = $data['field'];
        }
        if ($has('start_month')) {
            $attributes['start_month'] = $string($data['start_month']);
        }
        if ($has('start_year')) {
            $attributes['start_year'] = $string($data['start_year']);
        }
        if ($has('description')) {
            $attributes['description'] = $data['description'];
        }

        if ($isCurrent) {
            $attributes['end_month'] = null;
            $attributes['end_year'] = null;
        } else {
            if ($has('end_month')) {
                $attributes['end_month'] = $string($data['end_month']);
            }
            if ($has('end_year')) {
                $attributes['end_year'] = $string($data['end_year']);
            }
        }

        return $attributes;
    }

    private function owns($user, Education $education): bool
    {
        return $user->educations()->where('education.id', $education->id)->exists();
    }

    private function present(Education $education): array
    {
        return [
            'id' => $education->id,
            'school' => $education->school,
            'degree' => $education->degree,
            'field_of_study' => $education->field_of_study,
            'start_month' => $education->start_month,
            'start_year' => $education->start_year,
            'end_month' => $education->end_month,
            'end_year' => $education->end_year,
            'description' => $education->description,
        ];
    }
}
