<?php

namespace App\Http\Controllers;

use App\Models\Exercices;
use App\Models\ExerciseSubmission;
use App\Models\Formation;
use App\Models\User;
use Illuminate\Http\Request;

class ExercicesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $trainingId = $request->query('training_id');

        $exercices = Exercices::with(['model', 'submissions.user'])
            ->when($trainingId, function ($query) use ($trainingId) {
                $query->where('training_id', $trainingId);
            })
            ->latest()
            ->get();

        return response()->json($exercices);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,mp4,avi,mov,wmv',
            'training_id' => 'required|exists:formations,id',
            'model_id' => 'required|exists:models,id',
            'xp' => 'nullable|integer|min:0',
        ]);

        $data = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'training_id' => $validated['training_id'],
            'model_id' => $validated['model_id'] ?? null,
            'xp' => $validated['xp'] ?? 0,
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $mimeType = $file->getMimeType();

            if (str_starts_with($mimeType, 'image/')) {
                $fileType = 'image';
                $directory = 'exercices/images';
            } elseif ($mimeType === 'application/pdf') {
                $fileType = 'pdf';
                $directory = 'exercices/pdf';
            } elseif (str_starts_with($mimeType, 'video/')) {
                $fileType = 'video';
                $directory = 'exercices/videos';
            } else {
                $fileType = 'file';
                $directory = 'exercices/files';
            }

            $exercicesDir = public_path('/storage/' . $directory);
            if (!file_exists($exercicesDir)) {
                mkdir($exercicesDir, 0755, true);
            }

            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move($exercicesDir, $filename);

            $data['file'] = $directory . '/' . $filename;
            $data['file_type'] = $fileType;
        }

        $exercice = Exercices::create($data);

        return redirect()->back()->with('success', 'Exercise created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Exercices $exercices)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Exercices $exercices)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Exercices $exercices)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Exercices $exercices)
    {
        // Delete file if exists
        if ($exercices->file && file_exists(public_path('/storage/' . $exercices->file))) {
            unlink(public_path('/storage/' . $exercices->file));
        }

        $exercices->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Rate a submission
     */
    public function rateSubmission(Request $request, $submissionId)
    {
        $validated = $request->validate([
            'rating' => 'required|numeric|min:0|max:100',
            'rating_comment' => 'nullable|string|max:1000',
        ]);

        $submission = ExerciseSubmission::with('exercice', 'user')->findOrFail($submissionId);
        $exercice = $submission->exercice;
        $user = $submission->user;

        // Check if rating was already set (to avoid awarding XP multiple times)
        $previousRating = $submission->rating;
        $isNewRating = $previousRating === null;

        $submission->update([
            'rating' => $validated['rating'],
            'rating_comment' => $validated['rating_comment'] ?? null,
        ]);

        // Award XP only if this is a new rating and exercise has XP
        if ($isNewRating && $exercice->xp > 0 && $user) {
            // Calculate XP based on rating percentage
            // If rating is 100%, student gets full XP
            // Otherwise, student gets XP proportional to rating
            $xpToAward = ($validated['rating'] / 100) * $exercice->xp;

            // Award XP to the user (XP column is uppercase)
            $user->increment('XP', (int)round($xpToAward));
        } elseif (!$isNewRating && $previousRating !== null && $exercice->xp > 0 && $user) {
            // If rating is being updated, adjust XP based on the difference
            // Calculate previous XP awarded
            $previousXpAwarded = ($previousRating / 100) * $exercice->xp;
            // Calculate new XP to award
            $newXpToAward = ($validated['rating'] / 100) * $exercice->xp;
            // Calculate difference
            $xpDifference = $newXpToAward - $previousXpAwarded;

            // Only update if there's a difference
            if (abs($xpDifference) > 0.01) {
                if ($xpDifference > 0) {
                    // Award additional XP
                    $user->increment('XP', (int)round($xpDifference));
                } else {
                    // Remove XP (if rating decreased)
                    $user->decrement('XP', (int)round(abs($xpDifference)));
                }
            }
        }

        return response()->json([
            'success' => true,
            'submission' => $submission->load('user'),
        ]);
    }
}
