<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileExperienceController extends Controller
{
    private const EMPLOYMENT_TYPES = [
        'full_time',
        'part_time',
        'contract',
        'freelance',
        'internship',
    ];

    public function store(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
            // Keep DB column name spelling: employement_type
            'employment_type' => 'required|string|in:full_time,part_time,contract,freelance,internship',
            'start_month' => 'required|integer|min:1|max:12',
            'start_year' => 'required|integer|min:1900|max:2100',
            'end_month' => 'nullable|integer|min:1|max:12',
            'end_year' => 'nullable|integer|min:1900|max:2100',
            'is_current' => 'nullable|boolean',
        ]);

        $isCurrent = (bool) ($data['is_current'] ?? false);

        $experience = Experience::create([
            'title' => $data['title'],
            'company' => $data['company'] ?? null,
            'location' => $data['location'] ?? null,
            'description' => $data['description'] ?? null,
            'employement_type' => $data['employment_type'] ?? null,
            'start_month' => isset($data['start_month']) ? (string) $data['start_month'] : null,
            'start_year' => isset($data['start_year']) ? (string) $data['start_year'] : null,
            'end_month' => $isCurrent ? null : (isset($data['end_month']) ? (string) $data['end_month'] : null),
            'end_year' => $isCurrent ? null : (isset($data['end_year']) ? (string) $data['end_year'] : null),
        ]);

        $user->experiences()->syncWithoutDetaching([$experience->id]);

        return response()->json([
            'message' => 'Experience created',
            'data' => $experience,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $experience = Experience::find($id, ['*']);
        if (! $experience) {
            return response()->json(['message' => 'Experience not found'], 404);
        }
        /** @var Experience $experience */

        $owns = $user->experiences()->where('experience_id', $experience->id)->exists();
        if (! $owns) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'company' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'employment_type' => 'sometimes|required|string|in:full_time,part_time,contract,freelance,internship',
            'start_month' => 'sometimes|required|integer|min:1|max:12',
            'start_year' => 'sometimes|required|integer|min:1900|max:2100',
            'end_month' => 'sometimes|nullable|integer|min:1|max:12',
            'end_year' => 'sometimes|nullable|integer|min:1900|max:2100',
            'is_current' => 'sometimes|nullable|boolean',
        ]);

        $isCurrent = array_key_exists('is_current', $data)
            ? (bool) $data['is_current']
            : false;

        $experience->fill([
            'title' => $data['title'] ?? $experience->title,
            'company' => array_key_exists('company', $data) ? $data['company'] : $experience->company,
            'location' => array_key_exists('location', $data) ? $data['location'] : $experience->location,
            'description' => array_key_exists('description', $data) ? $data['description'] : $experience->description,
            'employement_type' => array_key_exists('employment_type', $data) ? $data['employment_type'] : $experience->employement_type,
            'start_month' => array_key_exists('start_month', $data)
                ? (isset($data['start_month']) ? (string) $data['start_month'] : null)
                : $experience->start_month,
            'start_year' => array_key_exists('start_year', $data)
                ? (isset($data['start_year']) ? (string) $data['start_year'] : null)
                : $experience->start_year,
            'end_month' => $isCurrent
                ? null
                : (array_key_exists('end_month', $data) ? (isset($data['end_month']) ? (string) $data['end_month'] : null) : $experience->end_month),
            'end_year' => $isCurrent
                ? null
                : (array_key_exists('end_year', $data) ? (isset($data['end_year']) ? (string) $data['end_year'] : null) : $experience->end_year),
        ]);
        $experience->save();

        return response()->json([
            'message' => 'Experience updated',
            'data' => $experience,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $experience = Experience::find($id, ['*']);
        if (! $experience) {
            return response()->json(['message' => 'Experience not found'], 404);
        }
        /** @var Experience $experience */

        $owns = $user->experiences()->where('experience_id', $experience->id)->exists();
        if (! $owns) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Detach first to keep pivot clean, then delete the experience record.
        $user->experiences()->detach($experience->id);
        Experience::destroy($experience->id);

        return response()->json(['message' => 'Experience deleted']);
    }
}

