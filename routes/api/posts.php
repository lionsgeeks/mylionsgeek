<?php

use App\Http\Controllers\API\PostController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/feed', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::post('/posts/repost', [PostController::class, 'repost']);
    Route::post('/posts/like/{id}', [PostController::class, 'toggleLike']);
    Route::get('/posts/{id}/likes', [PostController::class, 'getLikes']);
    Route::get('/posts/{id}/comments', [PostController::class, 'getComments']);
    Route::get('/posts/{id}/comments-count', [PostController::class, 'getCommentsCount']);
    Route::post('/posts/{id}/comments', [PostController::class, 'addComment']);
    Route::post('/comments/{id}/like', [PostController::class, 'toggleCommentLike']);
    Route::put('/comments/{id}', [PostController::class, 'updateComment']);
    Route::delete('/comments/{id}', [PostController::class, 'deleteComment']);
});

