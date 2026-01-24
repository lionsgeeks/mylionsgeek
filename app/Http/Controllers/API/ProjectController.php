<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $projects = Project::whereHas('users', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'status' => $project->status ?? 'active',
                    'photo' => $project->photo ? url('storage/' . $project->photo) : null,
                    'created_at' => $project->created_at ? (is_string($project->created_at) ? $project->created_at : $project->created_at->toDateTimeString()) : null,
                    'updated_at' => $project->updated_at ? (is_string($project->updated_at) ? $project->updated_at : $project->updated_at->toDateTimeString()) : null,
                ];
            })
            ->values()
            ->toArray();

        return response()->json(['projects' => $projects]);
    }

    public function show(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $project = Project::whereHas('users', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })->find($id);

        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        return response()->json([
            'id' => $project->id,
            'name' => $project->name,
            'description' => $project->description,
            'status' => $project->status ?? 'active',
            'photo' => $project->photo ? url('storage/' . $project->photo) : null,
            'created_at' => $project->created_at ? (is_string($project->created_at) ? $project->created_at : $project->created_at->toDateTimeString()) : null,
        ]);
    }
}

