<?php

// use App\Http\Controllers\CompleteProfile;

use App\Http\Controllers\PostController;
use App\Http\Controllers\CompleteProfileController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', "role:admin"])->prefix('admin')->group(function () {

    Route::get('/users', [UsersController::class, 'index']);
    Route::get('/users/export', [UsersController::class, 'export']);
    Route::get('/users/{user}', [UsersController::class, 'show']);
    Route::get('/users/{user}/attendance-chart', [UsersController::class, 'UserAttendanceChart']); //! chart route
    Route::get('/users/{user}/attendance-summary', [UsersController::class, 'attendanceSummary']);
    Route::get('/users/{user}/notes', [UsersController::class, 'notes']);
    Route::post('/users/{user}/notes', [UsersController::class, 'storeNote']);
    // Documents API for user overview modal
    Route::get('/users/{user}/documents', [UsersController::class, 'documents']);
    Route::post('/users/{user}/documents', [UsersController::class, 'uploadDocument']);
    Route::get('/users/{user}/documents/{kind}/{doc}', [UsersController::class, 'viewDocument'])->where(['kind' => 'contract|medical', 'doc' => '[0-9]+'])->name('admin.users.documents.view');
    Route::post('/users/store', [UsersController::class, 'store']);
    Route::put('/users/update/{user}', [UsersController::class, 'update']);
    Route::put('/users/update/{user}/account-state', [UsersController::class, 'updateAccountStatus']);
    Route::post('/users/{id}/resend-link', [CompleteProfileController::class, 'resendActivationLink']);
    Route::post('/users/{id}/reset-password', [CompleteProfileController::class, 'resetPassword']);
    Route::post('/users/changeCover/{id}', [UsersController::class, 'changeCover']);
});

Route::middleware(['auth', 'verified'])->prefix('posts')->group(function () {
    Route::post('/likes/{id}', [PostController::class, 'AddLike']);
    Route::post('/comments/{id}', [PostController::class, 'addPostComment']);
    Route::get('/likes/{id}', [PostController::class, 'getPostLikes']);
    Route::get('/comments/{id}', [PostController::class, 'getPostComments']);
    Route::delete('/comments/{id}', [PostController::class, 'deleteComment']);
});

Route::post('/complete-profile/update/{token}', [CompleteProfileController::class, 'submitCompleteProfile']);
Route::get('/complete-profile/{token}', [CompleteProfileController::class, 'goToCompleteProfile'])
    ->name('user.complete-profile');
