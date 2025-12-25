<?php

namespace App\Http\Controllers;

use App\Models\Exercices;
use App\Models\ExerciseSubmission;
use App\Models\ExerciseReviewNotification;
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

        // Get review request status for each submission
        $submissionIds = $exercices->flatMap(function($exercice) {
            return $exercice->submissions->pluck('id');
        })->toArray();

        $reviewRequests = \App\Models\ExerciseReviewNotification::whereIn('submission_id', $submissionIds)
            ->whereNull('read_at')
            ->pluck('submission_id')
            ->toArray();

        // Add review_requested flag to each exercice's submission
        $exercices->each(function($exercice) use ($reviewRequests) {
            if ($exercice->submissions) {
                $exercice->submissions->each(function($submission) use ($reviewRequests) {
                    $submission->review_requested = in_array($submission->id, $reviewRequests);
                });
            }
        });

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

    /**
     * Request review for a submission
     */
    public function requestReview($submissionId)
    {
        $user = Auth::user();
        
        // Get the submission and verify it belongs to the user
        $submission = ExerciseSubmission::with(['exercice.training.coach', 'user'])
            ->where('id', $submissionId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Get the training and coach
        $exercice = $submission->exercice;
        $training = $exercice->training;
        
        if (!$training) {
            return back()->withErrors(['error' => 'No training found for this exercise.']);
        }

        $coach = $training->coach;
        
        if (!$coach) {
            return back()->withErrors(['error' => 'No coach assigned to this training.']);
        }

        // Check if a review request already exists for this submission
        $existingNotification = ExerciseReviewNotification::where('submission_id', $submission->id)
            ->where('coach_id', $coach->id)
            ->first();

        if ($existingNotification) {
            return back()->with('info', 'You have already requested a review for this submission.');
        }

        // Create the notification with link to the training
        ExerciseReviewNotification::create([
            'submission_id' => $submission->id,
            'user_id' => $user->id,
            'coach_id' => $coach->id,
            'exercice_id' => $exercice->id,
            'message_notification' => "{$user->name} asked you to review his exercise: {$exercice->title}",
            'path' => "/trainings/{$training->id}",
        ]);

        return back()->with('success', 'Review request sent to your coach!');
    }
}
