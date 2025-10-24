<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:todo,in_progress,review,completed',
            'project_id' => 'required|exists:projects,id',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date|after:today',
        ]);

        $data = $request->all();
        $data['created_by'] = Auth::id();

        $task = Task::create($data);

        // Update project last activity
        $project = Project::find($request->project_id);
        $project->update([
            'last_activity' => now(),
            'is_updated' => true
        ]);

        return redirect()->back()
            ->with('success', 'Task created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:todo,in_progress,review,completed',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        $task->update($request->all());

        // Update project last activity
        $task->project->update([
            'last_activity' => now(),
            'is_updated' => true
        ]);

        return redirect()->back()
            ->with('success', 'Task updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $task->delete();

        return redirect()->back()
            ->with('success', 'Task deleted successfully.');
    }

    /**
     * Update task status
     */
    public function updateStatus(Request $request, Task $task)
    {
        $request->validate([
            'status' => 'required|in:todo,in_progress,review,completed'
        ]);

        $task->update(['status' => $request->status]);

        // Update project last activity
        $task->project->update([
            'last_activity' => now(),
            'is_updated' => true
        ]);

        return response()->json(['success' => true]);
    }
}
