<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Models\Task;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Project::with(['creator', 'users', 'tasks'])
            ->withCount(['tasks', 'users']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $projects = $query->paginate(12);

        // Statistics
        $stats = [
            'total' => Project::count(),
            'active' => Project::where('status', 'active')->count(),
            'completed' => Project::where('status', 'completed')->count(),
            'on_hold' => Project::where('status', 'on_hold')->count(),
            'cancelled' => Project::where('status', 'cancelled')->count(),
        ];

        return Inertia::render('admin/projects/index', [
            'projects' => $projects,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_order'])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $data = $request->all();
        $data['created_by'] = Auth::id();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('projects', 'public');
        }

        $project = Project::create($data);

        // Add creator as owner
        $project->users()->attach(Auth::id(), [
            'role' => 'owner',
            'joined_at' => now()
        ]);

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        $project->load([
            'creator',
            'users',
            'tasks.assignee',
            'tasks.creator',
            'tasks.comments.user',
            'attachments.uploader'
        ]);

        $teamMembers = $project->users()->get();
        $tasks = $project->tasks()->with(['assignee', 'creator', 'comments.user'])->get();
        $attachments = $project->attachments()->with('uploader')->get();

        return Inertia::render('admin/projects/show', [
            'project' => $project,
            'teamMembers' => $teamMembers,
            'tasks' => $tasks,
            'attachments' => $attachments
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:active,completed,on_hold,cancelled',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $data = $request->all();
        $data['is_updated'] = true;
        $data['last_activity'] = now();

        if ($request->hasFile('photo')) {
            if ($project->photo) {
                Storage::disk('public')->delete($project->photo);
            }
            $data['photo'] = $request->file('photo')->store('projects', 'public');
        }

        $project->update($data);

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        if ($project->photo) {
            Storage::disk('public')->delete($project->photo);
        }

        $project->delete();

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project deleted successfully.');
    }

    /**
     * Invite user to project
     */
    public function inviteUser(Request $request, Project $project)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:admin,member'
        ]);

        $user = User::findOrFail($request->user_id);

        // Check if user is already in project
        if ($project->users()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'User is already in this project.');
        }

        $project->users()->attach($user->id, [
            'role' => $request->role,
            'invited_at' => now()
        ]);

        return back()->with('success', 'User invited to project successfully.');
    }

    /**
     * Remove user from project
     */
    public function removeUser(Project $project, User $user)
    {
        $project->users()->detach($user->id);

        return back()->with('success', 'User removed from project successfully.');
    }

    /**
     * Update user role in project
     */
    public function updateRole(Request $request, Project $project, User $user)
    {
        $request->validate([
            'role' => 'required|in:admin,member'
        ]);

        $project->users()->updateExistingPivot($user->id, [
            'role' => $request->role
        ]);

        return back()->with('success', 'User role updated successfully.');
    }

    /**
     * Get project statistics
     */
    public function statistics()
    {
        $stats = [
            'total_projects' => Project::count(),
            'active_projects' => Project::where('status', 'active')->count(),
            'completed_projects' => Project::where('status', 'completed')->count(),
            'total_tasks' => Task::count(),
            'completed_tasks' => Task::where('status', 'completed')->count(),
            'overdue_tasks' => Task::where('due_date', '<', now())->where('status', '!=', 'completed')->count(),
        ];

        return response()->json($stats);
    }
}
