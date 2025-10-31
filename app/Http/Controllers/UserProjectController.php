<?php

namespace App\Http\Controllers;

use App\Models\UserProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserProjectController extends Controller
{
    public function store(Request $request, $id) {
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        'description' => 'required|string',
        'url' => 'required|url',
    ]);

    $validated['user_id'] = $id; // important
    if ($request->hasFile('image')) {
        $validated['image'] = $request->file('image')->store('user_projects', 'public');
    }

    $project = UserProject::create($validated);
    return response()->json(['success' => true, 'project' => $project, 'message' => 'Project added successfully']);
    }


    
    public function destroy($id, $projectId)
    {
        $userProject = UserProject::findOrFail($projectId);

        // Security check - only owner can delete
        if ($userProject->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete image if exists
        if ($userProject->image) {
            Storage::disk('public')->delete($userProject->image);
        }

        $userProject->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }
}
