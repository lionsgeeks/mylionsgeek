<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
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
                'progress' => 'nullable|integer|min:0|max:100',
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
            if (! empty($data['assignees'])) {
                // Temporarily disable foreign key checks for assignees sync
                DB::statement('PRAGMA foreign_keys=OFF');
                $task->assignees()->sync($data['assignees']);
                DB::statement('PRAGMA foreign_keys=ON');
            }

            // Update project last activity
            $project = Project::find($request->project_id);
            $project->update([
                'last_activity' => now(),
                'is_updated' => true,
            ]);

            return redirect()->back()
                ->with('success', 'Task created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create task: '.$e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        try {
            $request->validate([
                'title' => 'nullable|string|max:255',
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
                'is_editable' => 'nullable|boolean',
            ]);

            $data = $request->all();

            // Handle status changes
            if (isset($data['status'])) {
                if ($data['status'] === 'in_progress' && ! $task->started_at) {
                    $data['started_at'] = now();
                }

                if ($data['status'] === 'completed' && ! $task->completed_at) {
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
                'is_updated' => true,
            ]);

            return redirect()->back()
                ->with('success', 'Task updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update task: '.$e->getMessage());
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
            return redirect()->back()
                ->with('error', 'Failed to delete task: '.$e->getMessage());
        }
    }

    /**
     * Update task status
     */
    public function updateStatus(Request $request, Task $task)
    {
        try {
            $request->validate([
                'status' => 'required|in:todo,in_progress,review,completed',
            ]);

            if ($request->status === 'completed') {
                $subtasks = json_decode($task->subtasks, true) ?? [];
                $hasIncompleteSubtasks = collect($subtasks)->contains(fn ($subtask) => ! ($subtask['completed'] ?? false));

                if ($hasIncompleteSubtasks) {
                    return response()->json(['success' => false, 'message' => 'Cannot mark task as complete. Please complete all subtasks first.'], 400);
                }
            }

            $data = ['status' => $request->status];

            // Handle status changes
            if ($request->status === 'in_progress' && ! $task->started_at) {
                $data['started_at'] = now();
            }

            if ($request->status === 'completed' && ! $task->completed_at) {
                $data['completed_at'] = now();
                $data['progress'] = 100;
            }

            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys=OFF');

            $task->update($data);

            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');

            return response()->json(['success' => true, 'message' => 'Task status updated successfully!']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update task status: '.$e->getMessage()], 500);
        }
    }

    /**
     * Add subtask to task
     */
    public function addSubtask(Request $request, Task $task)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'completed' => 'boolean',
        ]);

        $subtasks = $task->subtasks ?? [];
        $subtasks[] = [
            'id' => uniqid(),
            'title' => $request->title,
            'completed' => $request->completed ?? false,
            'created_at' => now()->toISOString(),
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
            'title' => 'nullable|string|max:255',
            'completed' => 'nullable|boolean',
        ]);

        $subtasks = $task->subtasks ?? [];
        $subtaskIndex = array_search($request->subtask_id, array_column($subtasks, 'id'));

        if ($subtaskIndex !== false) {
            if ($request->has('title')) {
                $subtasks[$subtaskIndex]['title'] = $request->title;
            }
            if ($request->has('completed')) {
                $subtasks[$subtaskIndex]['completed'] = $request->completed;
            }
            $subtasks[$subtaskIndex]['updated_at'] = now()->toISOString();

            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys=OFF');

            $task->update(['subtasks' => $subtasks]);

            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');

            return redirect()->back()
                ->with('success', 'Subtask updated successfully.');
        }

        return redirect()->back()
            ->with('error', 'Subtask not found.');
    }

    /**
     * Delete subtask
     */
    public function deleteSubtask(Request $request, Task $task)
    {
        $request->validate([
            'subtask_id' => 'required|string',
        ]);

        $subtasks = $task->subtasks ?? [];
        $subtasks = array_filter($subtasks, fn ($subtask) => $subtask['id'] !== $request->subtask_id);

        $task->update(['subtasks' => array_values($subtasks)]);

        return redirect()->back()
            ->with('success', 'Subtask deleted successfully.');
    }

    /**
     * Toggle task pin status
     */
    public function togglePin(Task $task)
    {
        try {
            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys=OFF');

            $task->update(['is_pinned' => ! $task->is_pinned]);

            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');

            return redirect()->back()
                ->with('success', $task->is_pinned ? 'Task pinned successfully!' : 'Task unpinned successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to toggle task pin: '.$e->getMessage());
        }
    }

    /**
     * Update task title
     */
    public function updateTitle(Request $request, Task $task)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
            ]);

            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys=OFF');

            $task->update(['title' => $request->title]);

            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');

            return back()->with('success', 'Task title updated successfully!');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update task title: '.$e->getMessage()], 500);
        }
    }

    /**
     * Update task description
     */
    public function updateDescription(Request $request, Task $task)
    {
        try {
            $request->validate([
                'description' => 'nullable|string',
            ]);

            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys=OFF');

            $task->update(['description' => $request->description]);

            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');

            return redirect()->back()->with('success', 'Task description updated successfully!');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update task description: '.$e->getMessage()], 500);
        }
    }

    /**
     * Update task priority
     */
    public function updatePriority(Request $request, Task $task)
    {
        try {
            $request->validate([
                'priority' => 'required|in:low,medium,high,urgent',
            ]);

            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys=OFF');

            $task->update(['priority' => $request->priority]);

            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');

            return redirect()->back()->with('success', 'Task priority updated successfully!');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update task priority: '.$e->getMessage()], 500);
        }
    }

    /**
     * Add attachment to task
     */
    public function addAttachment(Request $request, Task $task)
    {
        try {
            $request->validate([
                'file' => 'required|file|max:10240', // 10MB max
                'name' => 'nullable|string|max:255',
            ]);

            $file = $request->file('file');
            $filename = time().'_'.$file->getClientOriginalName();
            $path = $file->storeAs('task-attachments', $filename, 'public');

            $attachments = $task->attachments ?? [];
            $attachments[] = [
                'id' => uniqid(),
                'name' => $request->name ?? $file->getClientOriginalName(),
                'path' => $path,
                'size' => $file->getSize(),
                'type' => $file->getMimeType(),
                'uploaded_by' => Auth::id(),
                'uploaded_at' => now()->toISOString(),
            ];

            $task->update(['attachments' => $attachments]);

            return redirect()->back()
                ->with('success', 'Attachment added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to upload attachment: '.$e->getMessage());
        }
    }

    /**
     * Remove attachment from task
     */
    public function removeAttachment(Request $request, Task $task)
    {
        try {
            $request->validate([
                'attachment_id' => 'required|string',
            ]);

            $attachments = $task->attachments ?? [];
            $attachments = array_filter($attachments, fn ($attachment) => $attachment['id'] !== $request->attachment_id);

            $task->update(['attachments' => array_values($attachments)]);

            return redirect()->back()
                ->with('success', 'Attachment removed successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to remove attachment: '.$e->getMessage());
        }
    }

    /**
     * Update task assignees
     */
    public function updateAssignees(Request $request, Task $task)
    {
        try {
            $request->validate([
                'assignees' => 'nullable|array',
                'assignees.*' => 'exists:users,id',
            ]);

            // Temporarily disable foreign key checks for SQLite
            DB::statement('PRAGMA foreign_keys=OFF');

            $task->update(['assignees' => $request->assignees ?? []]);

            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys=ON');

            return redirect()->back()->with('success', 'Task assignees updated successfully!');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update task assignees: '.$e->getMessage()], 500);
        }
    }

    /**
     * Add comment to task
     */
    public function addComment(Request $request, Task $task)
    {
        try {
            $request->validate([
                'content' => 'required|string|max:1000',
            ]);

            $comments = $task->comments ?? [];
            $comments[] = [
                'id' => uniqid(),
                'content' => $request->content,
                'user_id' => Auth::id(),
                'user' => Auth::user()->only('id', 'name', 'email', 'image'),
                'created_at' => now()->toISOString(),
            ];

            $task->update(['comments' => $comments]);

            return redirect()->back()
                ->with('success', 'Comment added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to add comment: '.$e->getMessage());
        }
    }

    /**
     * Update comment
     */
    public function updateComment(Request $request, Task $task, $commentId)
    {
        try {
            $request->validate([
                'content' => 'required|string|max:1000',
            ]);

            $comments = $task->comments ?? [];
            $commentIndex = array_search($commentId, array_column($comments, 'id'));

            if ($commentIndex !== false) {
                $comments[$commentIndex]['content'] = $request->content;
                $comments[$commentIndex]['updated_at'] = now()->toISOString();
                $task->update(['comments' => $comments]);

                return redirect()->back()
                    ->with('success', 'Comment updated successfully.');
            }

            return redirect()->back()
                ->with('error', 'Comment not found.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update comment: '.$e->getMessage());
        }
    }

    /**
     * Delete comment
     */
    public function deleteComment(Request $request, Task $task, $commentId)
    {
        try {
            $comments = $task->comments ?? [];
            $commentIndex = array_search($commentId, array_column($comments, 'id'));

            if ($commentIndex !== false) {
                unset($comments[$commentIndex]);
                $task->update(['comments' => array_values($comments)]);

                return redirect()->back()
                    ->with('success', 'Comment deleted successfully.');
            }

            return redirect()->back()
                ->with('error', 'Comment not found.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete comment: '.$e->getMessage());
        }
    }
}
