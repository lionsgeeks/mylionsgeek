<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // dd($request->all());
        try {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
                'priority' => 'nullable|in:low,medium,high,urgent',
                'status' => 'nullable|in:todo,in_progress,review,completed',
            'project_id' => 'required|exists:projects,id',
                'assignees' => 'nullable|array',
                'assignees.*' => 'exists:users,id',
                'due_date' => 'nullable|date',
                'subtasks' => 'nullable|array',
                'tags' => 'nullable|array',
                'progress' => 'nullable|integer|min:0|max:100'
        ]);

        $data = $request->all();
        $data['created_by'] = Auth::id();
            
            // Set default values
            $data['priority'] = $data['priority'] ?? 'medium';
            $data['status'] = $data['status'] ?? 'todo';
            $data['progress'] = $data['progress'] ?? 0;
            $data['is_pinned'] = $data['is_pinned'] ?? false;
            $data['is_editable'] = $data['is_editable'] ?? true;
            $data['subtasks'] = $data['subtasks'] ?? [];
            $data['tags'] = $data['tags'] ?? [];
            $data['assignees'] = $data['assignees'] ?? [];

            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys=OFF');

        $task = Task::create($data);
            
            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');

            // Sync assignees if provided
            if (!empty($data['assignees'])) {
                // Temporarily disable foreign key checks for assignees sync
                DB::statement('PRAGMA foreign_keys=OFF');
                $task->assignees()->sync($data['assignees']);
                DB::statement('PRAGMA foreign_keys=ON');
            }

        // Update project last activity
        $project = Project::find($request->project_id);
        $project->update([
            'last_activity' => now(),
            'is_updated' => true
        ]);

        return redirect()->back()
                ->with('success', 'Task created successfully!');
        } catch (\Exception $e) {
            \Log::error('Task creation failed: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to create task: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        try {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
                'priority' => 'nullable|in:low,medium,high,urgent',
                'status' => 'nullable|in:todo,in_progress,review,completed',
                'assignees' => 'nullable|array',
                'assignees.*' => 'exists:users,id',
            'due_date' => 'nullable|date',
                'subtasks' => 'nullable|array',
                'tags' => 'nullable|array',
                'progress' => 'nullable|integer|min:0|max:100',
                'is_pinned' => 'nullable|boolean',
                'is_editable' => 'nullable|boolean'
            ]);

            $data = $request->all();
            
            // Handle status changes
            if (isset($data['status'])) {
                if ($data['status'] === 'in_progress' && !$task->started_at) {
                    $data['started_at'] = now();
                }
                
                if ($data['status'] === 'completed' && !$task->completed_at) {
                    $data['completed_at'] = now();
                    $data['progress'] = 100;
                }
            }

            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys=OFF');
            
            $task->update($data);
            
            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');

            // Sync assignees if provided
            if (isset($data['assignees'])) {
                // Temporarily disable foreign key checks for assignees sync
                DB::statement('PRAGMA foreign_keys=OFF');
                $task->assignees()->sync($data['assignees']);
                DB::statement('PRAGMA foreign_keys=ON');
            }

        // Update project last activity
        $task->project->update([
            'last_activity' => now(),
            'is_updated' => true
        ]);

        return redirect()->back()
                ->with('success', 'Task updated successfully!');
        } catch (\Exception $e) {
            \Log::error('Task update failed: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to update task: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        try {
            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys=OFF');
            
        $task->delete();

            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');

            return redirect()->back()
                ->with('success', 'Task deleted successfully!');
        } catch (\Exception $e) {
            \Log::error('Task deletion failed: ' . $e->getMessage());
        return redirect()->back()
                ->with('error', 'Failed to delete task: ' . $e->getMessage());
        }
    }

    /**
     * Update task status
     */
    public function updateStatus(Request $request, Task $task)
    {
        try {
        $request->validate([
            'status' => 'required|in:todo,in_progress,review,completed'
        ]);

            $data = ['status' => $request->status];
            
            // Handle status changes
            if ($request->status === 'in_progress' && !$task->started_at) {
                $data['started_at'] = now();
            }
            
            if ($request->status === 'completed' && !$task->completed_at) {
                $data['completed_at'] = now();
                $data['progress'] = 100;
            }

            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys=OFF');
            
            $task->update($data);
            
            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');

        // Update project last activity
        $task->project->update([
            'last_activity' => now(),
            'is_updated' => true
        ]);

            return response()->json(['success' => true, 'message' => 'Task status updated successfully!']);
        } catch (\Exception $e) {
            \Log::error('Task status update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update task status: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Add subtask to task
     */
    public function addSubtask(Request $request, Task $task)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'completed' => 'boolean'
        ]);

        $subtasks = $task->subtasks ?? [];
        $subtasks[] = [
            'id' => uniqid(),
            'title' => $request->title,
            'completed' => $request->completed ?? false,
            'created_at' => now()->toISOString()
        ];

        $task->update(['subtasks' => $subtasks]);

        return redirect()->back()
            ->with('success', 'Subtask added successfully.');
    }

    /**
     * Update subtask
     */
    public function updateSubtask(Request $request, Task $task)
    {
        $request->validate([
            'subtask_id' => 'required|string',
            'title' => 'required|string|max:255',
            'completed' => 'boolean'
        ]);

        $subtasks = $task->subtasks ?? [];
        $subtaskIndex = array_search($request->subtask_id, array_column($subtasks, 'id'));
        
        if ($subtaskIndex !== false) {
            $subtasks[$subtaskIndex]['title'] = $request->title;
            $subtasks[$subtaskIndex]['completed'] = $request->completed ?? false;
            $subtasks[$subtaskIndex]['updated_at'] = now()->toISOString();
            
            $task->update(['subtasks' => $subtasks]);
        }

        return redirect()->back()
            ->with('success', 'Subtask updated successfully.');
    }

    /**
     * Delete subtask
     */
    public function deleteSubtask(Request $request, Task $task)
    {
        $request->validate([
            'subtask_id' => 'required|string'
        ]);

        $subtasks = $task->subtasks ?? [];
        $subtasks = array_filter($subtasks, fn($subtask) => $subtask['id'] !== $request->subtask_id);
        
        $task->update(['subtasks' => array_values($subtasks)]);

        return redirect()->back()
            ->with('success', 'Subtask deleted successfully.');
    }

    /**
     * Add comment to task
     */
    public function addComment(Request $request, Task $task)
    {
        $request->validate([
            'content' => 'required|string',
            'mentions' => 'nullable|array',
            'mentions.*' => 'exists:users,id'
        ]);

        $comments = $task->comments ?? [];
        $comments[] = [
            'id' => uniqid(),
            'user_id' => Auth::id(),
            'content' => $request->content,
            'mentions' => $request->mentions ?? [],
            'created_at' => now()->toISOString()
        ];

        $task->update(['comments' => $comments]);

        return redirect()->back()
            ->with('success', 'Comment added successfully.');
    }

    /**
     * Toggle task pin status
     */
    public function togglePin(Task $task)
    {
        try {
            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys=OFF');
            
            $task->update(['is_pinned' => !$task->is_pinned]);
            
            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');

            return redirect()->back()
                ->with('success', $task->is_pinned ? 'Task pinned successfully!' : 'Task unpinned successfully!');
        } catch (\Exception $e) {
            \Log::error('Task pin toggle failed: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to toggle task pin: ' . $e->getMessage());
        }
    }
}
