<?php

namespace App\Http\Controllers;

use App\Models\Experience;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExperienceController extends Controller
{
    //
    //! create experience
    public function create(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'title' => 'string|required',
            'description' => 'string|required',
            'employment_type' => 'string|required',
            'company' => 'string|required',
            'start_month' => 'string|required',
            'start_year' => 'string|required',
            'end_month' => 'string|nullable',
            'end_year' => 'string|nullable',
            'location' => 'string|required',
        ]);
        $experience = Experience::create([
            'title' => $request->title,
            'description' => $request->description,
            'employement_type' => $request->employment_type,
            'company' => $request->company,
            'start_month' => $request->start_month,
            'start_year' => $request->start_year,
            'end_month' => $request->end_month,
            'end_year' => $request->end_year,
            'location' => $request->location,
        ]);

        $user->experiences()->attach($experience->id);
        return redirect()->back()->with('success', 'Experience created successfuly');
    }
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $experience = Experience::find($id);

        // Check if user owns this experience
        if (!$user->experiences()->where('experience_id', $id)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'string|required',
            'description' => 'string|required',
            'company' => 'string|required',
            'employment_type' => 'string|required',
            'start_month' => 'string|required',
            'start_year' => 'string|required',
            'end_month' => 'string|nullable',
            'end_year' => 'string|nullable',
            'location' => 'string|required',
        ]);
        $experience->update([
            'title' => $request->title,
            'description' => $request->description,
            'employement_type' => $request->employment_type,
            'company' => $request->company,
            'start_month' => $request->start_month,
            'start_year' => $request->start_year,
            'end_month' => $request->end_month,
            'end_year' => $request->end_year,
            'location' => $request->location,
        ]);
        return redirect()->back()->with('success', 'Experience Updated successfuly');
    }
    public function delete($id)
    {
        $user = Auth::user();
        $experience = Experience::find($id);

        // Check if user owns this experience
        if (!$user->experiences()->where('experience_id', $id)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $experience->delete();
        return redirect()->back()->with('success', 'Experience Deleted successfuly');
    }
}
