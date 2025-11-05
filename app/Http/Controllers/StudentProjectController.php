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
        $projects = auth()->user()
            ->projects()
            ->where('status', '!=', 'rejected')
            ->latest()
            ->paginate(15)
            ->through(fn($project) => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'image' => $project->image,
                'url' => $project->url,
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
            'url' => 'nullable|url',
            'image' => 'nullable|image|max:2048',
        ]);

        $hasImage = $request->hasFile('image');
        $hasUrl = !empty($validated['url']);
        $hasTitle = !empty($validated['title']);
        $hasDescription = !empty($validated['description']);

        $isValid = (
            //title + img + desc + url
            ($hasTitle && $hasImage && $hasDescription && $hasUrl) ||
            //title + img + desc
            ($hasTitle && $hasImage && $hasDescription && !$hasUrl) ||
            //title + img + url
            ($hasTitle && $hasImage && !$hasDescription && $hasUrl) ||
            //title + desc + url
            ($hasTitle && !$hasImage && $hasDescription && $hasUrl) ||
            //img + desc + url
            (!$hasTitle && $hasImage && $hasDescription && $hasUrl) ||
            //title + img 
            ($hasTitle && $hasImage && !$hasDescription && !$hasUrl) ||
            //img
            (!$hasTitle && $hasImage && !$hasDescription && !$hasUrl) ||
            //img + desc
            (!$hasTitle && $hasImage && $hasDescription && !$hasUrl) ||
            //img + url
            (!$hasTitle && $hasImage && !$hasDescription && $hasUrl) ||
            //title + url        
            ($hasTitle && !$hasImage && !$hasDescription && $hasUrl) ||
            //url        
            (!$hasTitle && !$hasImage && !$hasDescription && $hasUrl) ||
            //desc + url        
            (!$hasTitle && !$hasImage && $hasDescription && $hasUrl)
        );

        if (!$isValid) {
            throw ValidationException::withMessages([
                'message' => 'add url or image',
            ]);
        }

        $imagePath = null;
        if ($hasImage) {
            $imagePath = $request->file('image')->store('projects', 'public');
        }

        auth()->user()->projects()->create([
            'title' => $validated['title'] ?? null,
            'description' => $validated['description'] ?? null,
            'url' => $validated['url'] ?? null,
            'image' => $imagePath,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Project created!');
    }
}
