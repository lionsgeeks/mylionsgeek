<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;

Route::middleware(['auth'])->prefix('chat')->name('chat.')->group(function () {
    Route::get('/', [ChatController::class, 'index'])->name('index');
    Route::get('/unread-count', [ChatController::class, 'getUnreadCount'])->name('unread-count');
    Route::get('/conversation/{userId}', [ChatController::class, 'getOrCreateConversation'])->name('conversation');
    Route::get('/conversation/{conversationId}/messages', [ChatController::class, 'getMessages'])->name('messages');
    Route::post('/conversation/{conversationId}/send', [ChatController::class, 'sendMessage'])->name('send');
    Route::post('/conversation/{conversationId}/read', [ChatController::class, 'markAsRead'])->name('mark-read');
    Route::delete('/message/{messageId}', [ChatController::class, 'deleteMessage'])->name('message.delete');
    Route::delete('/conversation/{conversationId}', [ChatController::class, 'deleteConversation'])->name('conversation.delete');
    Route::get('/user/{userId}/posts', [ChatController::class, 'getUserPosts'])->name('user.posts');
    Route::get('/ably-token', [ChatController::class, 'getAblyToken'])->name('ably-token');
});

