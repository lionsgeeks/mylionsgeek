<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use App\Models\StudentProject;
use App\Models\User;

class StudentProjectController extends Controller
{
    /**
     * Show all projects (no rejected)
     */
    public function index()
    {
        $projects = auth()->user()->studentProjects()
            ->latest()
            ->paginate(15)
            ->through(fn($project) => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'image' => $project->image,
                'project' => $project->project,
                'rejection_reason' => $project->rejection_reason,
                'status' => $project->status,
                'created_at' => (string) $project->created_at,
            ]);

        return Inertia::render('students/projects/index', [
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

        // xp lpgique
        // $user = auth()->user();
        // $user->xp = ($user->xp ?? 0) + 500;
        // $user->save();

        return back()->with('success', 'Project created!');
    }

    public function getUserProjects(User $user)
    {
        $projects = $user->studentProjects()
            ->latest()
            ->get()
            ->map(fn($project) => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'image' => $project->image,
                'project' => $project->project,
                'status' => $project->status,
                'created_at' => (string) $project->created_at,
            ]);

        return response()->json(['projects' => $projects]);
    }

    public function approve(Request $request, StudentProject $studentProject)
    {
        $studentProject->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Project approved!');
    }

    public function reject(Request $request, StudentProject $studentProject)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:1',
        ]);

        $studentProject->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return back()->with('success', 'Project rejected!');
    }

    public function update(Request $request, StudentProject $studentProject)
    {
        if ($studentProject->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        if (!in_array($studentProject->status, ['pending', 'rejected'])) {
            return back()->withErrors(['message' => 'You can only update pending or rejected projects.']);
        }

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
            return back()->withErrors(['message' => 'Khassek t3emer chi haja.']);
        }

        $imagePath = $studentProject->image;
        if ($hasImage) {
            $imagePath = $request->file('image')->store('projects', 'public');
        }

        $studentProject->update([
            'title' => $validated['title'] ?? null,
            'description' => $validated['description'] ?? null,
            'project' => $validated['project'] ?? null,
            'image' => $imagePath,
            'status' => 'pending',
            'rejection_reason' => null,
        ]);

        return back()->with('success', 'Project updated!');
    }

}
