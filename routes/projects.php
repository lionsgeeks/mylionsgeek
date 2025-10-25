<?php

use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\TaskController;
use App\Http\Controllers\Admin\TaskCommentController;
use App\Http\Controllers\Admin\AttachmentController;
use Illuminate\Support\Facades\Route;

// Public join route (no auth required)
Route::get('projects/{project}/join/{token}', [ProjectController::class, 'join'])->name('projects.join');

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Project routes
    Route::resource('projects', ProjectController::class);
    Route::post('projects/{project}', [ProjectController::class, 'update'])->name('projects.update-post');
    Route::post('projects/invite', [ProjectController::class, 'invite'])->name('projects.invite');
    Route::post('projects/{project}/invite', [ProjectController::class, 'inviteUser'])->name('projects.invite-user');
    Route::delete('projects/{project}/users/{user}', [ProjectController::class, 'removeUser'])->name('projects.remove-user');
    Route::put('projects/{project}/users/{user}', [ProjectController::class, 'updateRole'])->name('projects.update-role');
    Route::get('projects-statistics', [ProjectController::class, 'statistics'])->name('projects.statistics');
    
    // Task routes
    Route::resource('tasks', TaskController::class)->except(['index', 'show', 'create', 'edit']);
    Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.update-status');
    
    // Task comment routes
    Route::resource('task-comments', TaskCommentController::class)->only(['store', 'destroy']);
    
    // Attachment routes
    Route::resource('attachments', AttachmentController::class)->only(['store', 'destroy']);
    Route::get('attachments/{attachment}/download', [AttachmentController::class, 'download'])->name('attachments.download');
});
