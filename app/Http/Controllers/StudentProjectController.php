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
     * Show a single project's details
     */
    public function show(StudentProject $studentProject)
    {
        $user = auth()->user();
        $isAdmin = ! empty(array_intersect(
            $user->role,
            ['admin', 'moderateur', 'coach']
        ));

        // dd($isAdmin);
        // dd($user->role);

        // Check authorization - student can only view their own projects, admins can view any
        if (!$isAdmin && $studentProject->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Load relationships
        $studentProject->load(['user:id,name,image', 'approvedBy:id,name,image']);

        // Format the project data
        $project = [
            'id' => $studentProject->id,
            'title' => $studentProject->title,
            'description' => $studentProject->description,
            'image' => $studentProject->image,
            'project' => $studentProject->project,
            'status' => $studentProject->status,
            'rejection_reason' => $studentProject->rejection_reason,
            'created_at' => (string) $studentProject->created_at,
            'updated_at' => (string) $studentProject->updated_at,
            'approved_at' => $studentProject->approved_at ? (string) $studentProject->approved_at : null,
            'user' => $studentProject->user ? [
                'id' => $studentProject->user->id,
                'name' => $studentProject->user->name,
                'image' => $studentProject->user->image,
            ] : null,
            'approved_by' => $studentProject->approvedBy ? [
                'id' => $studentProject->approvedBy->id,
                'name' => $studentProject->approvedBy->name,
                'image' => $studentProject->approvedBy->image,
            ] : null,
            'user_id' => $studentProject->user_id,
        ];

        return Inertia::render('students/projects/[id]', [
            'project' => $project,
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
