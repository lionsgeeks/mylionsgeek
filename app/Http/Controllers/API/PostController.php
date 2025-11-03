<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $feed = [];

        // Get recent projects with creators
        $recentProjects = Project::with('creator')
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'type' => 'project',
                    'title' => $project->name,
                    'description' => $project->description,
                    'image' => $project->photo ? url('storage/' . $project->photo) : null,
                    'created_at' => $project->created_at ? (is_string($project->created_at) ? $project->created_at : $project->created_at->toDateTimeString()) : null,
                    'user' => [
                        'id' => $project->creator->id ?? null,
                        'name' => $project->creator->name ?? 'Project Team',
                        'avatar' => $project->creator->image ? url('storage/' . $project->creator->image) : null,
                        'image' => $project->creator->image ?? null,
                    ],
                    'likes' => 0,
                    'comments' => 0,
                    'reposts' => 0,
                ];
            });

        // Get recent reservations
        $recentReservations = Reservation::with('user')
            ->where('canceled', 0)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => 'res_' . $reservation->id,
                    'type' => 'reservation',
                    'title' => ucfirst($reservation->type) . ' Reservation',
                    'description' => "Booked from " . ($reservation->start ?? 'N/A') . " to " . ($reservation->end ?? 'N/A'),
                    'created_at' => $reservation->created_at ? (is_string($reservation->created_at) ? $reservation->created_at : $reservation->created_at->toDateTimeString()) : null,
                    'user' => [
                        'id' => $reservation->user->id ?? null,
                        'name' => $reservation->user->name ?? 'User',
                        'avatar' => $reservation->user->image ? url('storage/' . $reservation->user->image) : null,
                        'image' => $reservation->user->image ?? null,
                    ],
                    'likes' => 0,
                    'comments' => 0,
                    'reposts' => 0,
                ];
            });

        // Merge and sort by created_at
        $feed = $recentProjects->merge($recentReservations)
            ->sortByDesc('created_at')
            ->values()
            ->take(25)
            ->toArray();

        return response()->json(['feed' => $feed]);
    }

    public function store(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'content' => 'required|string|max:5000',
            'type' => 'nullable|in:post,photo,video,article',
        ]);

        // TODO: Create post in database
        // For now, return success
        return response()->json([
            'message' => 'Post created successfully',
            'post' => [
                'id' => uniqid(),
                'content' => $request->content,
                'type' => $request->type ?? 'post',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $user->image ? url('storage/' . $user->image) : null,
                    'image' => $user->image ?? null,
                ],
                'created_at' => now()->toDateTimeString(),
            ],
        ], 201);
    }

    public function repost(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'post_id' => 'required|string',
        ]);

        // TODO: Create repost in database
        // For now, return success
        return response()->json([
            'message' => 'Post reposted successfully',
            'repost' => [
                'post_id' => $request->post_id,
                'user_id' => $user->id,
                'created_at' => now()->toDateTimeString(),
            ],
        ], 201);
    }
}

