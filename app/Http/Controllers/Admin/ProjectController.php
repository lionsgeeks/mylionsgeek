<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Models\Task;
use App\Models\Attachment;
use App\Models\ProjectInvitation;
use App\Models\ProjectUser;
use App\Models\ProjectMessage;
use App\Mail\ProjectInvitationMail;
use Ably\AblyRest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif',
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

            // Create predefined tasks if any were selected
            if ($request->has('predefined_tasks')) {
                $predefinedTasks = $request->predefined_tasks;
                
                // Handle different input types: string (JSON), array, or null/empty
                if (is_string($predefinedTasks) && !empty($predefinedTasks)) {
                    $decoded = json_decode($predefinedTasks, true);
                    $predefinedTasks = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
                } elseif (!is_array($predefinedTasks)) {
                    $predefinedTasks = [];
                }
                
                // Ensure we have a valid array with items
                if (is_array($predefinedTasks) && count($predefinedTasks) > 0) {
                    // Map task values to their titles
                    $taskTitles = [
                        'creation_du_site_web' => 'Creation du site web',
                        'creation_de_contenue_reseaux_sociaux' => 'Creation de contenue sur les reseau sociaux',
                        'shooting_images_videos' => 'Shooting and images and videos'
                    ];

                    // Temporarily disable foreign key checks for SQLite
                    DB::statement('PRAGMA foreign_keys = OFF');

                    foreach ($predefinedTasks as $taskValue) {
                        if (isset($taskTitles[$taskValue])) {
                            Task::create([
                                'title' => $taskTitles[$taskValue],
                                'description' => null,
                                'project_id' => $project->id,
                                'created_by' => Auth::id(),
                                'priority' => 'medium',
                                'status' => 'todo',
                                'progress' => 0,
                                'sort_order' => 0
                            ]);
                        }
                    }

                    // Re-enable foreign key checks
                    DB::statement('PRAGMA foreign_keys = ON');
                }
            }

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
            'attachments.uploader'
        ]);

        $teamMembers = ProjectUser::with('user')
            ->where('project_id', $project->id)
            ->get()
            ->filter(function ($projectUser) {
                return $projectUser->user !== null && $projectUser->user->id !== null;
            })
            ->map(function ($projectUser) use ($project) {
                // Check if this user is the project owner (created_by or has owner role)
                $isOwner = $project->created_by === $projectUser->user_id || $projectUser->role === 'owner';
                
                return [
                    'id' => $projectUser->user->id,
                    'name' => $projectUser->user->name ?? 'Unknown',
                    'email' => $projectUser->user->email ?? '',
                    'image' => $projectUser->user->image ?? null,
                    'last_online' => $projectUser->user->last_online ?? null,
                    'role' => $projectUser->role ?? 'member',
                    'project_user_id' => $projectUser->id,
                    'isOwner' => $isOwner,
                ];
            })
            ->values();

        $tasks = $project->tasks()->with(['assignedTo', 'creator'])->get();
        $attachments = $project->attachments()->with(['uploader:id,name,image,last_online'])->get();
        $notes = $project->notes()->with('user')->orderBy('is_pinned', 'desc')->orderBy('created_at', 'desc')->get();
        
        // Get current user's role in this project
        $currentUserProjectRole = ProjectUser::where('project_id', $project->id)
            ->where('user_id', Auth::id())
            ->first();
        
        // Check if user is project owner or has admin/owner role
        $isProjectOwner = $project->created_by === Auth::id();
        $isProjectAdmin = $currentUserProjectRole && in_array($currentUserProjectRole->role, ['owner', 'admin']);
        $canManageTeam = $isProjectOwner || $isProjectAdmin;

        return Inertia::render('admin/projects/[id]', [
            'project' => $project,
            'teamMembers' => $teamMembers,
            'tasks' => $tasks,
            'attachments' => $attachments,
            'notes' => $notes,
            'currentUserProjectRole' => $currentUserProjectRole ? $currentUserProjectRole->role : null,
            'canManageTeam' => $canManageTeam,
            'isProjectOwner' => $isProjectOwner
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
        try {
            Log::info('Invite request received:', [
                'project_id' => $request->project_id,
                'emails' => $request->emails ?? [],
                'usernames' => $request->usernames ?? [],
                'emails_count' => count($request->emails ?? []),
                'usernames_count' => count($request->usernames ?? []),
                'role' => $request->role,
                'all_request_data' => $request->all()
            ]);

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

            // Validate that at least one email or username is provided
            if (empty($emails) && empty($usernames)) {
                return back()->with('error', 'Please provide at least one email address or username to invite.');
            }

        $invitationsSent = 0;
        $invitationsCreated = 0;
        $emailsLogged = 0;
        $errors = [];
        $mailDriver = config('mail.default');

        // Process email invitations - always create invitations, never add directly
        foreach ($emails as $email) {
            // Check if user is already in project
            $user = User::where('email', $email)->first();
            if ($user && $project->users()->where('user_id', $user->id)->exists()) {
                $errors[] = "{$email} is already a member of this project.";
                continue;
            }

            // Check if invitation already exists and is still valid
            $existingInvitation = ProjectInvitation::where('project_id', $project->id)
                ->where('email', $email)
                ->where('is_used', false)
                ->where('expires_at', '>', now())
                ->first();

            if ($existingInvitation) {
                $errors[] = "An invitation has already been sent to {$email}.";
                continue;
            }

            // Create invitation
            $invitation = ProjectInvitation::createInvitation($project->id, $email, null, $role, $message);
            $invitationsCreated++;

            // Send email invitation
            try {
                $mailHost = config('mail.mailers.smtp.host');
                $mailPort = config('mail.mailers.smtp.port');
                $mailEncryption = config('mail.mailers.smtp.encryption');
                $mailFrom = config('mail.from.address');

                Log::info("Attempting to send project invitation email to: {$email}");
                Log::info("Mail config - Driver: {$mailDriver}, Host: {$mailHost}, Port: {$mailPort}, Encryption: {$mailEncryption}, From: {$mailFrom}");

                Mail::to($email)->send(new ProjectInvitationMail($project, $invitation, $message));

                if ($mailDriver === 'log') {
                    Log::warning("Email logged to storage/logs/laravel.log (driver: log) - Email was NOT actually sent!");
                    $emailsLogged++;
                } else {
                    Log::info("✅ Project invitation email sent successfully to: {$email}");
                    $invitationsSent++;
                }
            } catch (\Exception $e) {
                $errorMessage = $e->getMessage();
                Log::error("❌ Failed to send project invitation email to {$email}: {$errorMessage}");
                Log::error('Exception class: ' . get_class($e));
                Log::error('Exception trace: ' . $e->getTraceAsString());

                // Provide more helpful error messages
                if (str_contains($errorMessage, 'Connection') || str_contains($errorMessage, 'timeout')) {
                    $errors[] = "Failed to connect to mail server. Check your SMTP settings in .env file.";
                } elseif (str_contains($errorMessage, 'Authentication') || str_contains($errorMessage, 'password')) {
                    $errors[] = "SMTP authentication failed. Check your MAIL_USERNAME and MAIL_PASSWORD in .env file.";
                } else {
                    $errors[] = "Failed to send invitation to {$email}: {$errorMessage}";
                }
            }
        }

        // Process username invitations - always create invitations, never add directly
        foreach ($usernames as $username) {
            $user = User::where('name', $username)->first();

            if (!$user) {
                $errors[] = "User @{$username} not found.";
                continue;
            }

            // Check if user is already in project
            if ($project->users()->where('user_id', $user->id)->exists()) {
                $errors[] = "@{$username} is already a member of this project.";
                continue;
            }

            // Check if invitation already exists and is still valid
            $existingInvitation = ProjectInvitation::where('project_id', $project->id)
                ->where('username', $username)
                ->where('is_used', false)
                ->where('expires_at', '>', now())
                ->first();

            if ($existingInvitation) {
                $errors[] = "An invitation has already been sent to @{$username}.";
                continue;
            }

            // Create invitation
            $invitation = ProjectInvitation::createInvitation($project->id, $user->email, $username, $role, $message);
            $invitationsCreated++;

            // Send email invitation
            try {
                $mailHost = config('mail.mailers.smtp.host');
                $mailPort = config('mail.mailers.smtp.port');
                $mailEncryption = config('mail.mailers.smtp.encryption');

                Log::info("Attempting to send project invitation email to: {$user->email} (@{$username})");
                Log::info("Mail config - Driver: {$mailDriver}, Host: {$mailHost}, Port: {$mailPort}, Encryption: {$mailEncryption}");

                Mail::to($user->email)->send(new ProjectInvitationMail($project, $invitation, $message));

                if ($mailDriver === 'log') {
                    Log::warning("Email logged to storage/logs/laravel.log (driver: log) - Email was NOT actually sent!");
                    $emailsLogged++;
                } else {
                    Log::info("✅ Project invitation email sent successfully to: {$user->email} (@{$username})");
                    $invitationsSent++;
                }
            } catch (\Exception $e) {
                $errorMessage = $e->getMessage();
                Log::error("❌ Failed to send project invitation email to {$user->email}: {$errorMessage}");
                Log::error('Exception class: ' . get_class($e));
                Log::error('Exception trace: ' . $e->getTraceAsString());

                // Provide more helpful error messages
                if (str_contains($errorMessage, 'Connection') || str_contains($errorMessage, 'timeout')) {
                    $errors[] = "Failed to connect to mail server for @{$username}. Check your SMTP settings.";
                } elseif (str_contains($errorMessage, 'Authentication') || str_contains($errorMessage, 'password')) {
                    $errors[] = "SMTP authentication failed for @{$username}. Check your mail credentials.";
                } else {
                    $errors[] = "Failed to send invitation to @{$username}: {$errorMessage}";
                }
            }
        }

            // Build response message
            if ($invitationsCreated > 0) {
                $messages = [];

                if ($invitationsSent > 0) {
                    $messages[] = "{$invitationsSent} invitation email(s) sent successfully.";
                }

            if ($emailsLogged > 0) {
                $logPath = storage_path('logs/laravel.log');
                $messages[] = "⚠️ {$emailsLogged} invitation(s) created but emails were NOT sent (logged only). Mail driver is set to 'log'. To actually send emails, configure SMTP in your .env file. Check {$logPath} to see the email content.";
            }

                if (!empty($errors)) {
                    $messages[] = implode(' ', $errors);
                }

                $message = implode(' ', $messages);

                // Use warning if emails were only logged, success if actually sent
                if ($invitationsSent > 0 && $emailsLogged === 0) {
                    return back()->with('success', $message);
                } else if ($emailsLogged > 0) {
                    return back()->with('warning', $message);
                } else {
                    return back()->with('success', $message);
                }
            } else {
                return back()->with('error', !empty($errors) ? implode(' ', $errors) : 'No invitations were created.');
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed for project invitation:', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to process project invitation: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return back()->with('error', 'Failed to process invitation: ' . $e->getMessage());
        }
    }

    /**
     * Invite user to project
     */
    public function inviteUser(Request $request, Project $project)
    {
        $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:admin,member',
            'message' => 'nullable|string|max:500'
        ]);

        $email = $request->email;
        $role = $request->role;
        $message = $request->message;

        // Find user by email
        $user = User::where('email', $email)->first();

        // Check if user is already in project
        if ($user && $project->users()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'User is already a member of this project.');
        }

        // Check if invitation already exists and is still valid
        $existingInvitation = ProjectInvitation::where('project_id', $project->id)
            ->where('email', $email)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if ($existingInvitation) {
            return back()->with('error', 'An invitation has already been sent to this email address.');
        }

        // Create invitation
        $invitation = ProjectInvitation::createInvitation($project->id, $email, null, $role, $message);

        // Send email invitation
        try {
            $mailDriver = config('mail.default');
            Log::info("Attempting to send project invitation email to: {$email} (Mail driver: {$mailDriver})");

            // Check mail configuration
            if ($mailDriver === 'log') {
                Log::warning("Mail driver is set to 'log'. Emails will be logged to storage/logs/laravel.log instead of being sent.");
            }

            Mail::to($email)->send(new ProjectInvitationMail($project, $invitation, $message));

            if ($mailDriver === 'log') {
                Log::info("Email logged to storage/logs/laravel.log (driver: log)");
                return back()->with('success', 'Invitation created. Email logged (mail driver is set to "log"). Check storage/logs/laravel.log for the email content.');
            } else {
                Log::info("Project invitation email sent successfully to: {$email}");
                return back()->with('success', 'Invitation sent successfully via email.');
            }
        } catch (\Exception $e) {
            Log::error('Failed to send project invitation email to ' . $email . ': ' . $e->getMessage());
            Log::error('Exception trace: ' . $e->getTraceAsString());
            return back()->with('error', 'Failed to send invitation email: ' . $e->getMessage());
        }
    }

    /**
     * Remove user from project
     */
    public function removeUser(Project $project, User $user)
    {
        // Check if user is the project owner
        $isProjectOwner = $project->created_by === $user->id;
        
        // Check if user has owner role in project
        $projectUser = ProjectUser::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();
        
        $hasOwnerRole = $projectUser && $projectUser->role === 'owner';
        
        if ($isProjectOwner || $hasOwnerRole) {
            return back()->with('error', 'Cannot remove the project owner from the project.');
        }

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

        // Check if user is the project owner
        $isProjectOwner = $project->created_by === $user->id;
        
        // Check if user has owner role in project
        $projectUser = ProjectUser::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();
        
        $hasOwnerRole = $projectUser && $projectUser->role === 'owner';
        
        if ($isProjectOwner || $hasOwnerRole) {
            return back()->with('error', 'Cannot change the role of the project owner.');
        }

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

    /**
     * Generate share link for project (creates a general invitation)
     */
    public function shareProject(Request $request, Project $project)
    {
        $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:admin,member',
            'message' => 'nullable|string|max:500'
        ]);

        $email = $request->email;
        $role = $request->role;
        $message = $request->message;

        // Check if user is already in project
        $user = User::where('email', $email)->first();
        if ($user && $project->users()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'User is already a member of this project.');
        }

        // Check if invitation already exists and is still valid
        $existingInvitation = ProjectInvitation::where('project_id', $project->id)
            ->where('email', $email)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if ($existingInvitation) {
            $inviteUrl = route('projects.join', [
                'project' => $project->id,
                'token' => $existingInvitation->token
            ]);
            return back()->with('info', "An invitation already exists. Share this link: {$inviteUrl}");
        }

        // Create invitation
        $invitation = ProjectInvitation::createInvitation($project->id, $email, null, $role, $message);

        // Generate invitation URL
        $inviteUrl = route('projects.join', [
            'project' => $project->id,
            'token' => $invitation->token
        ]);

        // Send email invitation
        try {
            Mail::to($email)->send(new ProjectInvitationMail($project, $invitation, $message));
            return back()->with('success', "Invitation sent successfully. Share link: {$inviteUrl}");
        } catch (\Exception $e) {
            Log::error('Failed to send project invitation email: ' . $e->getMessage());
            return back()->with('info', "Invitation created. Share this link: {$inviteUrl}");
        }
    }

    /**
     * Get messages for a project
     */
    public function getMessages(Project $project)
    {
        // Verify user is a member of the project
        $isMember = $project->users()->where('users.id', Auth::id())->exists() 
            || $project->created_by === Auth::id();
        
        if (!$isMember) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $project->messages()
            ->with('user:id,name,image')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'content' => $message->content,
                    'timestamp' => $message->created_at->toISOString(),
                    'user' => [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                        'avatar' => $message->user->image ? asset('storage/' . $message->user->image) : null,
                    ],
                ];
            });

        return response()->json(['messages' => $messages]);
    }

    /**
     * Send a message to project chat
     */
    public function sendMessage(Request $request, Project $project)
    {
        // Verify user is a member of the project
        $isMember = $project->users()->where('users.id', Auth::id())->exists() 
            || $project->created_by === Auth::id();
        
        if (!$isMember) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $message = ProjectMessage::create([
            'project_id' => $project->id,
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        $message->load('user:id,name,image');

        // Broadcast message via Ably
        try {
            $ablyKey = config('services.ably.key');
            if ($ablyKey) {
                $ably = new AblyRest($ablyKey);
                $channel = $ably->channels->get("project:{$project->id}");
                
                $broadcastData = [
                    'id' => $message->id,
                    'content' => $message->content,
                    'timestamp' => $message->created_at->toISOString(),
                    'user' => [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                        'avatar' => $message->user->image ? asset('storage/' . $message->user->image) : null,
                    ],
                ];
                
                $channel->publish('new-message', $broadcastData);
            }
        } catch (\Exception $e) {
            Log::error('Failed to broadcast project message via Ably: ' . $e->getMessage());
        }

        return response()->json([
            'message' => [
                'id' => $message->id,
                'content' => $message->content,
                'timestamp' => $message->created_at->toISOString(),
                'user' => [
                    'id' => $message->user->id,
                    'name' => $message->user->name,
                    'avatar' => $message->user->image ? asset('storage/' . $message->user->image) : null,
                ],
            ],
        ]);
    }
}
