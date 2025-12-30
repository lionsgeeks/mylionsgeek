<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\StudentProject;
use App\Models\User;
use App\Models\Models;
use App\Models\ProjectSubmissionNotification;
use App\Models\ProjectStatusNotification;

class StudentProjectController extends Controller
{
    /**
     * Show all projects (no rejected)
     */
    public function index()
    {
        $projects = auth()->user()->studentProjects()
            ->latest()
            ->paginate(15)
            ->through(fn($project) => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'image' => $project->image,
                'project' => $project->project,
                'rejection_reason' => $project->rejection_reason,
                'status' => $project->status,
                'created_at' => (string) $project->created_at,
            ]);

        // Get all models for the dropdown
        $models = Models::select('id', 'name', 'description')->orderBy('name')->get();

        return Inertia::render('students/projects/index', [
            'projects' => $projects,
            'models' => $models,
        ]);
    }

    /**
     * Show a single project's details
     */
    public function show(StudentProject $studentProject)
    {
        $user = auth()->user();
        $isAdmin = ! empty(array_intersect(
            $user->role,
            ['admin', 'moderateur', 'coach']
        ));

        // dd($isAdmin);
        // dd($user->role);

        // Check authorization - student can only view their own projects, admins can view any
        if (!$isAdmin && $studentProject->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Load relationships
        $studentProject->load(['user:id,name,image', 'approvedBy:id,name,image']);

        // Format the project data
        $project = [
            'id' => $studentProject->id,
            'title' => $studentProject->title,
            'description' => $studentProject->description,
            'image' => $studentProject->image,
            'project' => $studentProject->project,
            'status' => $studentProject->status,
            'rejection_reason' => $studentProject->rejection_reason,
            'review_ratings' => $studentProject->review_ratings,
            'review_notes' => $studentProject->review_notes,
            'created_at' => (string) $studentProject->created_at,
            'updated_at' => (string) $studentProject->updated_at,
            'approved_at' => $studentProject->approved_at ? (string) $studentProject->approved_at : null,
            'user' => $studentProject->user ? [
                'id' => $studentProject->user->id,
                'name' => $studentProject->user->name,
                'image' => $studentProject->user->image,
            ] : null,
            'approved_by' => $studentProject->approvedBy ? [
                'id' => $studentProject->approvedBy->id,
                'name' => $studentProject->approvedBy->name,
                'image' => $studentProject->approvedBy->image,
            ] : null,
            'user_id' => $studentProject->user_id,
        ];

        return Inertia::render('students/projects/[id]', [
            'project' => $project,
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
            'project' => 'nullable|url',
            'image' => 'nullable|image|max:2048',
            'model_id' => 'required|exists:models,id',
        ]);

        $hasImage = $request->hasFile('image');
        $hasProject = !empty($validated['project']);

        $isValid = ($hasProject || $hasImage);

        if (!$isValid) {
            return back()->withErrors([
                'message' => 'khassek t3emer chi haja.',
            ]);
        }

        $imagePath = null;
        if ($hasImage) {
            $imagePath = $request->file('image')->store('projects', 'public');
        }

        $student = auth()->user();
        $project = $student->studentProjects()->create([
            'title' => $validated['title'] ?? null,
            'description' => $validated['description'] ?? null,
            'project' => $validated['project'] ?? null,
            'image' => $imagePath,
            'model_id' => $validated['model_id'],
            'status' => 'pending',
        ]);

        // Create notifications for admins and coaches
        $this->notifyAdminsAndCoaches($project, $student);

        // xp lpgique
        // $user = auth()->user();
        // $user->xp = ($user->xp ?? 0) + 500;
        // $user->save();

        return back()->with('success', 'Project created!');
    }

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
        $validated = $request->validate([
            'review_ratings' => 'nullable|array',
            'review_notes' => 'nullable|string',
        ]);

        $reviewer = auth()->user();
        $studentProject->update([
            'status' => 'approved',
            'approved_by' => $reviewer->id,
            'approved_at' => now(),
            'review_ratings' => $validated['review_ratings'] ?? null,
            'review_notes' => $validated['review_notes'] ?? null,
        ]);

        // Mark submission notifications as read (for admins/coaches)
        ProjectSubmissionNotification::where('project_id', $studentProject->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        // Create notification for the student
        $projectPath = "/student/project/{$studentProject->id}";
        $message = "Your project \"{$studentProject->title}\" has been approved!";
        
        ProjectStatusNotification::create([
            'project_id' => $studentProject->id,
            'student_id' => $studentProject->user_id,
            'reviewer_id' => $reviewer->id,
            'status' => 'approved',
            'message_notification' => $message,
            'path' => $projectPath,
        ]);

        return back()->with('success', 'Project approved!');
    }

    public function reject(Request $request, StudentProject $studentProject)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:1',
            'review_ratings' => 'nullable|array',
            'review_notes' => 'nullable|string',
        ]);

        $reviewer = auth()->user();
        $rejectionReason = $validated['rejection_reason'];

        $studentProject->update([
            'status' => 'rejected',
            'approved_by' => $reviewer->id,
            'approved_at' => now(),
            'rejection_reason' => $rejectionReason,
            'review_ratings' => $validated['review_ratings'] ?? null,
            'review_notes' => $validated['review_notes'] ?? null,
        ]);

        // Mark submission notifications as read (for admins/coaches)
        ProjectSubmissionNotification::where('project_id', $studentProject->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        // Create notification for the student
        $projectPath = "/student/project/{$studentProject->id}";
        $message = "Your project \"{$studentProject->title}\" has been rejected.";
        
        ProjectStatusNotification::create([
            'project_id' => $studentProject->id,
            'student_id' => $studentProject->user_id,
            'reviewer_id' => $reviewer->id,
            'status' => 'rejected',
            'rejection_reason' => $rejectionReason,
            'message_notification' => $message,
            'path' => $projectPath,
        ]);

        return back()->with('success', 'Project rejected!');
    }

    public function update(Request $request, StudentProject $studentProject)
    {
        if ($studentProject->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        if (!in_array($studentProject->status, ['pending', 'rejected'])) {
            return back()->withErrors(['message' => 'You can only update pending or rejected projects.']);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'project' => 'nullable|url',
            'image' => 'nullable|image|max:2048',
            'model_id' => 'required|exists:models,id',
        ]);

        $hasImage = $request->hasFile('image');
        $hasProject = !empty($validated['project']);
        $isValid = ($hasProject || $hasImage);

        if (!$isValid) {
            return back()->withErrors(['message' => 'Khassek t3emer chi haja.']);
        }

        $imagePath = $studentProject->image;
        if ($hasImage) {
            $imagePath = $request->file('image')->store('projects', 'public');
        }

        $studentProject->update([
            'title' => $validated['title'] ?? null,
            'description' => $validated['description'] ?? null,
            'project' => $validated['project'] ?? null,
            'image' => $imagePath,
            'model_id' => $validated['model_id'],
            'status' => 'pending',
            'rejection_reason' => null,
        ]);

        return back()->with('success', 'Project updated!');
    }

    /**
     * Notify admins and coaches about project submission
     */
    private function notifyAdminsAndCoaches(StudentProject $project, User $student)
    {
        $projectPath = "/student/project/{$project->id}";
        $message = "{$student->name} submitted a new project: " . ($project->title ?? 'Untitled Project');

        // Get all admins
        $admins = User::where(function($query) {
            $query->where('role', 'like', '%admin%')
                  ->orWhere('role', 'like', '%super_admin%')
                  ->orWhere('role', 'like', '%moderateur%');
        })->get();

        // Get coaches with the same field/category as the student
        $coaches = collect();
        if ($student->formation_id) {
            // Get the student's formation to find the category/field
            $studentFormation = \App\Models\Formation::find($student->formation_id);
            
            if ($studentFormation && $studentFormation->category) {
                // Find all formations with the same category (coding, media, etc.)
                $sameCategoryFormations = \App\Models\Formation::where('category', $studentFormation->category)->get();
                
                $coachIds = collect();
                
                foreach ($sameCategoryFormations as $formation) {
                    // Get the formation's assigned coach (user_id in formations table)
                    if ($formation->user_id) {
                        $coachIds->push($formation->user_id);
                    }
                    
                    // Get all users with coach role in formations with the same category
                    $formationCoachIds = User::where('formation_id', $formation->id)
                        ->where(function($query) {
                            $query->where('role', 'like', '%coach%');
                        })
                        ->pluck('id');
                    
                    $coachIds = $coachIds->merge($formationCoachIds);
                }
                
                // Get all unique coaches
                $coaches = User::whereIn('id', $coachIds->unique())
                    ->where(function($query) {
                        $query->where('role', 'like', '%coach%');
                    })
                    ->get();
            }
        }

        // Create notifications for admins
        foreach ($admins as $admin) {
            ProjectSubmissionNotification::create([
                'project_id' => $project->id,
                'student_id' => $student->id,
                'notified_user_id' => $admin->id,
                'message_notification' => $message,
                'path' => $projectPath,
            ]);
        }

        // Create notifications for coaches
        foreach ($coaches as $coach) {
            // Don't create duplicate notification if coach is also an admin
            if (!$admins->contains('id', $coach->id)) {
                ProjectSubmissionNotification::create([
                    'project_id' => $project->id,
                    'student_id' => $student->id,
                    'notified_user_id' => $coach->id,
                    'message_notification' => $message,
                    'path' => $projectPath,
                ]);
            }
        }
    }
}
