<?php

// use App\Http\Controllers\CompleteProfile;

use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified'])->prefix('posts')->group(function () {
    Route::post('/likes/{id}', [PostController::class, 'AddLike']);
    Route::post('/comments/{id}', [PostController::class, 'addPostComment']);
    Route::get('/likes/{id}', [PostController::class, 'getPostLikes']);
    Route::get('/comments/{id}', [PostController::class, 'getPostComments']);
    Route::delete('/comments/{id}', [PostController::class, 'deleteComment']);
    Route::put('/comments/{id}', [PostController::class, 'updateComment']);
    Route::delete('/post/{id}', [PostController::class, 'deletePost']);
});
