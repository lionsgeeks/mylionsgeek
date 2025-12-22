<?php

namespace App\Http\Controllers;

use App\Models\Exercices;
use App\Models\ExerciseSubmission;
use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExerciseSubmissionController extends Controller
{
    /**
     * Display exercises for the student's training
     */
    public function index()
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }
        
        // Get the student's training
        $training = null;
        if ($user->formation_id) {
            $training = Formation::with(['exercices.model', 'exercices.submissions' => function($query) use ($user) {
                $query->where('user_id', $user->id);
            }])->find($user->formation_id);
        }

        if (!$training) {
            return Inertia::render('students/exercises/index', [
                'training' => null,
                'exercices' => [],
            ]);
        }

        $exercices = $training->exercices()->with(['model', 'submissions' => function($query) use ($user) {
            $query->where('user_id', $user->id);
        }])->latest()->get();

        return Inertia::render('students/exercises/index', [
            'training' => $training,
            'exercices' => $exercices,
        ]);
    }

    /**
     * Store or update a submission
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'exercice_id' => 'required|exists:exercices,id',
            'submission_link' => 'required|url|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();

        // Verify the exercise belongs to the user's training
        $exercice = Exercices::findOrFail($validated['exercice_id']);
        if ($exercice->training_id !== $user->formation_id) {
            return back()->withErrors(['exercice_id' => 'This exercise does not belong to your training.']);
        }

        // Create or update submission
        $submission = ExerciseSubmission::updateOrCreate(
            [
                'exercice_id' => $validated['exercice_id'],
                'user_id' => $user->id,
            ],
            [
                'submission_link' => $validated['submission_link'],
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return back()->with('success', 'Submission saved successfully!');
    }

    /**
     * Delete a submission
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $submission = ExerciseSubmission::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $submission->delete();

        return back()->with('success', 'Submission deleted successfully!');
    }
}
