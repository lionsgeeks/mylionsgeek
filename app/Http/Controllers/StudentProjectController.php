<?php

namespace App\Http\Controllers;

use App\Models\UserProject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class StudentProjectController extends Controller
{
    /**
     * Show all projects (no rejected)
     */
    public function index()
    {
        $projects = auth()->user()->studentProjects()
            ->where('status', '!=', 'rejected')
            ->latest()
            ->paginate(15)
            ->through(fn($project) => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'image' => $project->image,
                'project' => $project->project,
                'status' => $project->status,
                'created_at' => (string) $project->created_at,
            ]);

        return Inertia::render('student/projects/index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Store project
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'project' => 'nullable|url',
            'image' => 'nullable|image|max:2048',
        ]);

        $hasImage = $request->hasFile('image');
        $hasProject = !empty($validated['project']);

        $isValid = ($hasProject || $hasImage);

        if (!$isValid) {
            return back()->withErrors([
                'message' => 'khassek t3emer chi haja.',
            ]);
        }

        $imagePath = null;
        if ($hasImage) {
            $imagePath = $request->file('image')->store('projects', 'public');
        }

        auth()->user()->studentProjects()->create([
            'title' => $validated['title'] ?? null,
            'description' => $validated['description'] ?? null,
            'project' => $validated['project'] ?? null,
            'image' => $imagePath,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Project created!');
    }
}
