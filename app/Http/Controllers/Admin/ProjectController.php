<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Models\Task;
use App\Models\Attachment;
use App\Models\ProjectInvitation;
use App\Models\ProjectUser;
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

        // Get all users for invite suggestions
        $users = User::select('id', 'name', 'email', 'image')->get();

        return Inertia::render('admin/projects/index', [
            'projects' => $projects,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_order']),
            'users' => $users,
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
            'tasks.assignedTo',
            'tasks.creator',
            'tasks.comments.user',
            'attachments.uploader'
        ]);

        $teamMembers = ProjectUser::with('user')
            ->where('project_id', $project->id)
            ->get()
            ->filter(function ($projectUser) {
                return $projectUser->user !== null && $projectUser->user->id !== null;
            })
            ->map(function ($projectUser) {
                return [
                    'id' => $projectUser->user->id,
                    'name' => $projectUser->user->name ?? 'Unknown',
                    'email' => $projectUser->user->email ?? '',
                    'image' => $projectUser->user->image ?? null,
                    'last_online' => $projectUser->user->last_online ?? null,
                    'role' => $projectUser->role ?? 'member',
                    'project_user_id' => $projectUser->id,
                ];
            })
            ->values();

        $tasks = $project->tasks()->with(['assignedTo', 'creator'])->get();
        $attachments = $project->attachments()->with(['uploader:id,name,image,last_online'])->get();
        $notes = $project->notes()->with('user')->orderBy('is_pinned', 'desc')->orderBy('created_at', 'desc')->get();
        $user = ProjectUser::where('user_id', auth()->id())->first();



        // dd($teamMembers);
        return Inertia::render('admin/projects/show', [
            'project' => $project,
            'teamMembers' => $teamMembers,
            'tasks' => $tasks,
            'attachments' => $attachments,
            'notes' => $notes,
            "userr" => $user
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
                // 'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'status' => 'required|in:active,completed,on_hold,cancelled',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
            ]);

            $data = $request->only(['name', 'description', 'status', 'start_date', 'end_date']);
            $data['is_updated'] = true;
            $data['last_activity'] = now();

            // Debug: Log what we're receiving
            Log::info('Update request data:', [
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
            'emails' => 'nullable|array',
            'emails.*' => 'required|email',
            'usernames' => 'nullable|array',
            'usernames.*' => 'required|string',
            'role' => 'required|in:admin,member',
            'message' => 'nullable|string|max:500',
            'project_id' => 'required|exists:projects,id'
        ]);

        $project = Project::findOrFail($request->project_id);
        $emails = $request->emails ?? [];
        $usernames = $request->usernames ?? [];
        $role = $request->role;
        $message = $request->message;

        $invitedUsers = [];

        // Process email invitations
        foreach ($emails as $email) {
            $user = User::where('email', $email)->first();
            if ($user && !$project->users()->where('user_id', $user->id)->exists()) {
                $project->users()->attach($user->id, [
                    'role' => $role,
                    'invited_at' => now(),
                    'joined_at' => now()
                ]);
                $invitedUsers[] = $user->name;
            } else {
                // Create invitation token for non-existing users
                ProjectInvitation::createInvitation($project->id, $email, null, $role, $message);
            }
        }

        // Process username invitations
        foreach ($usernames as $username) {
            $user = User::where('name', $username)->first();
            if ($user && !$project->users()->where('user_id', $user->id)->exists()) {
                $project->users()->attach($user->id, [
                    'role' => $role,
                    'invited_at' => now(),
                    'joined_at' => now()
                ]);
                $invitedUsers[] = $user->name;
            } else {
                // Create invitation token for non-existing users
                ProjectInvitation::createInvitation($project->id, null, $username, $role, $message);
            }
        }

        return back()->with('success', 'Invitations sent successfully.');
    }

    /**
     * Invite user to project
     */
    public function inviteUser(Request $request, Project $project)
    {
        //    dd($request->all());
        $request->validate([
            'email' => 'nullable|email',
            'role' => 'required|in:admin,member'
        ]);

        // Either user_id or email must be provided
        if (!$request->email) {
            return back()->with('error', 'Email must be provided.');
        }

        // Find user by email
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return back()->with('error', 'User not found with the provided email address.');
        }

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

    /**
     * Join project via invitation token
     */
    public function join(Project $project, $token)
    {
        $invitation = ProjectInvitation::where('token', $token)
            ->where('project_id', $project->id)
            ->first();

        if (!$invitation) {
            return redirect('/')->with('error', 'Invalid invitation link.');
        }

        if (!$invitation->isValid()) {
            return redirect('/')->with('error', 'This invitation has expired or has already been used.');
        }

        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'Please log in to join the project.');
        }

        $user = Auth::user();

        // Check if user matches invitation (by email or username)
        $canJoin = false;
        if ($invitation->email && $user->email === $invitation->email) {
            $canJoin = true;
        } elseif ($invitation->username && $user->name === $invitation->username) {
            $canJoin = true;
        }

        if (!$canJoin) {
            return redirect('/')->with('error', 'This invitation is not for your account.');
        }

        // Check if user is already in the project
        if ($project->users()->where('user_id', $user->id)->exists()) {
            return redirect()->route('admin.projects.show', $project->id)
                ->with('info', 'You are already a member of this project.');
        }

        // Add user to project
        $project->users()->attach($user->id, [
            'role' => $invitation->role,
            'invited_at' => $invitation->created_at,
            'joined_at' => now()
        ]);

        // Mark invitation as used
        $invitation->update(['is_used' => true]);

        return redirect()->route('admin.projects.show', $project->id)
            ->with('success', "You have successfully joined the project: {$project->name}");
    }

    /**
     * Upload attachment to project
     */
    public function uploadAttachment(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'project_id' => 'required|exists:projects,id'
        ]);

        $project = Project::findOrFail($request->project_id);

        // Check if user has access to this project
        if (!$project->users()->where('user_id', Auth::id())->exists() && $project->created_by !== Auth::id()) {
            return redirect()->back()->with('error', 'You do not have permission to upload files to this project.');
        }

        try {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $mimeType = $file->getMimeType();
            $size = $file->getSize();

            // Generate unique filename
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('attachments', $filename, 'public');

            // Create attachment record
            $attachment = $project->attachments()->create([
                'name' => $filename,
                'original_name' => $originalName,
                'path' => $path,
                'mime_type' => $mimeType,
                'size' => $size,
                'uploaded_by' => Auth::id()
            ]);

            return redirect()->back()->with('success', 'File uploaded successfully.');
        } catch (\Exception $e) {
            Log::error('File upload failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to upload file: ' . $e->getMessage());
        }
    }

    /**
     * Delete project attachment
     */
    public function deleteAttachment(Attachment $attachment)
    {
        try {
            // Check if user has permission to delete this attachment
            $project = $attachment->project;
            if (!$project->users()->where('user_id', Auth::id())->exists() && $project->created_by !== Auth::id()) {
                return redirect()->back()->with('error', 'You do not have permission to delete this file.');
            }

            // Delete file from storage
            if ($attachment->path && Storage::disk('public')->exists($attachment->path)) {
                Storage::disk('public')->delete($attachment->path);
            }

            // Delete attachment record
            $attachment->delete();

            return redirect()->back()->with('success', 'File deleted successfully.');
        } catch (\Exception $e) {
            Log::error('File deletion failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete file: ' . $e->getMessage());
        }
    }

    public function shareProject(Project $project)
    {
        dd($request->all());
    }
}
