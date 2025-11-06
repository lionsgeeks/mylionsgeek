<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProject;
use Illuminate\Http\Request;

class AdminProjectController extends Controller
{
    public function getUserProjects(User $user)
    {
        $projects = $user->projects()
            ->latest()
            ->get()
            ->map(fn($project) => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'image' => $project->image,
                'url' => $project->url,
                'status' => $project->status,
                'created_at' => (string) $project->created_at,
            ]);

        return response()->json(['projects' => $projects]);
    }

    public function approve(Request $request, UserProject $userProject)
    {
        $userProject->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Project approved!');
    }

    public function reject(Request $request, UserProject $userProject)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:1',
        ]);

        $userProject->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return back()->with('success', 'Project rejected!');
    }
}
