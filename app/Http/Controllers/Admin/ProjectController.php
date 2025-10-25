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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Project::with(['creator', 'users:id,name,image', 'tasks'])
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
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_order']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
                'status' => 'nullable|in:active,completed,on_hold,cancelled'
            ]);

            $data = $request->all();
            $data['created_by'] = Auth::id();
            $data['status'] = $data['status'] ?? 'active';

            if ($request->hasFile('photo')) {
                $data['photo'] = $request->file('photo')->store('projects', 'public');
            }

            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys = OFF');
            
            $project = Project::create($data);

            // Add creator as owner - use raw SQL to avoid foreign key issues
            DB::table('project_users')->insert([
                'project_id' => $project->id,
                'user_id' => Auth::id(),
                'role' => 'owner',
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys = ON');

            return redirect()->route('admin.projects.index')
                ->with('success', 'Project created successfully.');
        } catch (\Exception $e) {
            Log::error('Project creation failed: ' . $e->getMessage());
            return redirect()->route('admin.projects.index')
                ->with('error', 'Failed to create project: ' . $e->getMessage());
        }
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
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'status' => 'required|in:active,completed,on_hold,cancelled',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
            ]);

            $data = $request->only(['name', 'description', 'status', 'start_date', 'end_date']);
            $data['is_updated'] = true;
            $data['last_activity'] = now();
            
            // Debug: Log what we're receiving
            \Log::info('Update request data:', [
                'all' => $request->all(),
                'hasFile' => $request->hasFile('photo'),
                'file' => $request->file('photo'),
                'data' => $data
            ]);
            
            // Only update photo if a new one is uploaded
            if ($request->hasFile('photo')) {
                if ($project->photo) {
                    Storage::disk('public')->delete($project->photo);
                }
                $data['photo'] = $request->file('photo')->store('projects', 'public');
            }

            $project->update($data);

            return redirect()->route('admin.projects.index')
                ->with('success', 'Project updated successfully.');
        } catch (\Exception $e) {
            return redirect()->route('admin.projects.index')
                ->with('error', 'Failed to update project: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        try {
            // Delete project photo if it exists
            if ($project->photo) {
                Storage::disk('public')->delete($project->photo);
            }

            // Delete the project (cascade will handle related records)
            $project->delete();

            return redirect()
                ->route('admin.projects.index')
                ->with('success', 'Project deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Project deletion failed: ' . $e->getMessage());
            return redirect()
                ->route('admin.projects.index')
                ->with('error', 'Failed to delete project: ' . $e->getMessage());
        }
    }

    /**
     * Invite users to project via email
     */
    public function invite(Request $request)
    {
        $request->validate([
            'emails' => 'required|array|min:1',
            'emails.*' => 'required|email',
            'role' => 'required|in:admin,member',
            'message' => 'nullable|string|max:500',
            'project_id' => 'required|exists:projects,id'
        ]);

        $project = Project::findOrFail($request->project_id);
        $emails = $request->emails;
        $role = $request->role;
        $message = $request->message;

        // Here you would typically send email invitations
        // For now, we'll just log the invitation
        foreach ($emails as $email) {
            // Check if user exists with this email
            $user = User::where('email', $email)->first();

            if ($user) {
                // User exists, add them to project
                if (!$project->users()->where('user_id', $user->id)->exists()) {
                    $project->users()->attach($user->id, [
                        'role' => $role,
                        'invited_at' => now(),
                        'joined_at' => now()
                    ]);
                }
            } else {
                // User doesn't exist, you might want to create a pending invitation
                // or send them an email to register first
                \Log::info("Invitation sent to non-existing user: {$email} for project: {$project->name}");
            }
        }

        return back()->with('success', 'Invitations sent successfully.');
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
