<?php

namespace App\Http\Controllers;

use App\Models\StudentProject;
use App\Models\User;
use Illuminate\Http\Request;

class AdminProjectController extends Controller
{
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
}
