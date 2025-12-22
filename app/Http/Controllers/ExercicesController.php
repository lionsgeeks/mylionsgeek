<?php

namespace App\Http\Controllers;

use App\Models\Exercices;
use App\Models\Formation;
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
            'file' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,mp4,avi,mov,wmv', // 10MB max
            'training_id' => 'required|exists:formations,id',
            'model_id' => 'required|exists:models,id',
        ]);

        $data = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'training_id' => $validated['training_id'],
            'model_id' => $validated['model_id'] ?? null,
        ];

        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $mimeType = $file->getMimeType();
            
            // Determine file type
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

            // Ensure directory exists
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
}
