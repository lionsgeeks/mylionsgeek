<?php

namespace App\Http\Controllers;

use App\Models\Education;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EducationController extends Controller
{

    public function create(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'school' => 'string|required',
            'degree' => 'string|required',
            'fieldOfStudy' => 'string|required',
            'startMonth' => 'string|required',
            'startYear' => 'string|required',
            'endMonth' => 'string|nullable',
            'endYear' => 'string|nullable',
            'description' => 'string|required',
        ]);

        $education = Education::create([
            'user_id' => $user->id,
            'school' => $request->school,
            'degree' => $request->degree,
            'field_of_study' => $request->fieldOfStudy,
            'start_month' => $request->startMonth,
            'start_year' => $request->startYear,
            'end_month' => $request->endMonth,
            'end_year' => $request->endYear,
            'description' => $request->description,
        ]);
        $user->educations()->attach($education->id);
        return redirect()->back()->with('success', 'Experience created successfuly');
    }
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $education = Education::find($id);

        // Check if user owns this education
        if (!$user->educations()->where('education_id', $id)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $request->validate([
            'school' => 'string|required',
            'degree' => 'string|required',
            'fieldOfStudy' => 'string|required',
            'start_month' => 'string|required',
            'start_year' => 'string|required',
            'end_month' => 'string|nullable',
            'endYear' => 'string|nullable',
            'description' => 'string|required',
        ]);

        $education->update([
            'school' => $request->school,
            'degree' => $request->degree,
            'field_of_study' => $request->fieldOfStudy,
            'start_month' => $request->start_month,
            'start_year' => $request->start_year,
            'end_month' => $request->end_month,
            'end_year' => $request->endYear,
            'description' => $request->description,
        ]);
        return redirect()->back()->with('success', 'Experience Updated successfuly');
    }
    public function delete($id)
    {
        $user = Auth::user();
        $education = Education::find($id);

        // Check if user owns this education
        if (!$user->educations()->where('education_id', $id)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $education->delete();
        return redirect()->back()->with('success', 'Experience Deleted successfuly');
    }
}
