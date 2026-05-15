<?php

use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\MobileAuthController;
use App\Http\Controllers\PlacesController;
use App\Http\Controllers\API\ReservationController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/reservations/{id}', [ReservationController::class, 'show']);
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post("/invite-student", [UserController::class, "inviteStudent"]);

// Mobile authentication endpoints (public)
Route::post('/mobile/login', [MobileAuthController::class, 'login']);
Route::post('/mobile/forgot-password', [MobileAuthController::class, 'forgot']);

Route::get('/users', [ReservationController::class, 'getUserss'])
    ->name('admin.api.users');

Route::get('/equipment', [ReservationController::class, 'getEquipment'])
    ->name('admin.api.equipment');

Route::get('/places', [PlacesController::class, 'getPlacesJson'])
    ->name('admin.api.places');

Route::post('/reservations/store', [ReservationController::class, 'storemobile'])
    ->name('reservations.store');

Route::post('/cowork/reserve', [ReservationController::class, 'storeReservationCoworkMobile']);

Route::middleware('auth:sanctum')->prefix('mobile')->group(function () {
    require __DIR__ . '/api/profile.php';
    require __DIR__ . '/api/posts.php';
    require __DIR__ . '/api/projects.php';
    require __DIR__ . '/api/reservations.php';
    require __DIR__ . '/api/leaderboard.php';
    require __DIR__ . '/api/search.php';
    require __DIR__ . '/api/training.php';
    
    // Push token endpoint
    Route::post('/push-token', [\App\Http\Controllers\API\PushTokenController::class, 'store']);
    
    // Test push notification endpoints (for debugging)
    Route::post('/test-push', [\App\Http\Controllers\API\TestPushController::class, 'test']);
    Route::get('/push-status', [\App\Http\Controllers\API\TestPushController::class, 'status']);
    
    // Chat routes
    Route::prefix('chat')->name('chat.')->group(function () {
        Route::get('/', [ChatController::class, 'index'])->name('index');
        Route::get('/following-ids', [ChatController::class, 'getFollowingIds'])->name('following-ids');
        Route::get('/following-users', [ChatController::class, 'getFollowingUsers'])->name('following-users');
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

    // Stories routes
    Route::get('/stories', [\App\Http\Controllers\API\StoryController::class, 'index'])->name('stories.index');
    Route::post('/stories', [\App\Http\Controllers\API\StoryController::class, 'store'])->name('stories.store');
    Route::post('/stories/{id}/view', [\App\Http\Controllers\API\StoryController::class, 'view'])->name('stories.view');
    Route::delete('/stories/{id}', [\App\Http\Controllers\API\StoryController::class, 'destroy'])->name('stories.destroy');
    // Phase 2: engagement
    Route::get('/stories/{id}/viewers', [\App\Http\Controllers\API\StoryController::class, 'viewers'])->name('stories.viewers');
    Route::post('/stories/{id}/react', [\App\Http\Controllers\API\StoryController::class, 'react'])->name('stories.react');
    Route::delete('/stories/{id}/react', [\App\Http\Controllers\API\StoryController::class, 'unreact'])->name('stories.unreact');
    Route::post('/stories/{id}/reply', [\App\Http\Controllers\API\StoryController::class, 'reply'])->name('stories.reply');
    Route::post('/stories/{id}/mention-repost', [\App\Http\Controllers\API\StoryController::class, 'mentionRepost'])->name('stories.mentionRepost');
    Route::post('/stories/{id}/capture-event', [\App\Http\Controllers\API\StoryController::class, 'reportCapture'])->name('stories.captureEvent');

    // Phase 3: highlights
    Route::get('/users/{userId}/highlights', [\App\Http\Controllers\API\HighlightController::class, 'indexForUser'])->name('highlights.indexForUser');
    Route::get('/highlights/{id}', [\App\Http\Controllers\API\HighlightController::class, 'show'])->name('highlights.show');
    Route::post('/highlights', [\App\Http\Controllers\API\HighlightController::class, 'store'])->name('highlights.store');
    Route::patch('/highlights/{id}', [\App\Http\Controllers\API\HighlightController::class, 'update'])->name('highlights.update');
    Route::delete('/highlights/{id}', [\App\Http\Controllers\API\HighlightController::class, 'destroy'])->name('highlights.destroy');
    Route::post('/highlights/{id}/stories', [\App\Http\Controllers\API\HighlightController::class, 'addStory'])->name('highlights.addStory');
    Route::delete('/highlights/{id}/stories/{storyId}', [\App\Http\Controllers\API\HighlightController::class, 'removeStory'])->name('highlights.removeStory');

    // Phase 3: close friends
    Route::get('/close-friends', [\App\Http\Controllers\API\CloseFriendController::class, 'index'])->name('closeFriends.index');
    Route::post('/close-friends/{friendId}', [\App\Http\Controllers\API\CloseFriendController::class, 'store'])->name('closeFriends.store');
    Route::delete('/close-friends/{friendId}', [\App\Http\Controllers\API\CloseFriendController::class, 'destroy'])->name('closeFriends.destroy');

    // Phase 4c: music search (Spotify + iTunes fallback) for the story
    // creator's music sticker.
    Route::get('/music/search', [\App\Http\Controllers\API\MusicController::class, 'search'])->name('music.search');
    Route::get('/music/lyrics', [\App\Http\Controllers\API\MusicController::class, 'lyrics'])->name('music.lyrics');

    // Voice call routes
    Route::get('/call/ably-token', [\App\Http\Controllers\API\CallController::class, 'getAblyToken'])->name('call.ably-token');
    Route::post('/calls/initiate', [\App\Http\Controllers\API\CallController::class, 'initiate'])->name('calls.initiate');
    Route::get('/calls/history', [\App\Http\Controllers\API\CallController::class, 'history'])->name('calls.history');
    Route::get('/calls/{id}', [\App\Http\Controllers\API\CallController::class, 'show'])->name('calls.show');
    Route::post('/calls/{id}/accept', [\App\Http\Controllers\API\CallController::class, 'accept'])->name('calls.accept');
    Route::post('/calls/{id}/reject', [\App\Http\Controllers\API\CallController::class, 'reject'])->name('calls.reject');
    Route::post('/calls/{id}/end', [\App\Http\Controllers\API\CallController::class, 'end'])->name('calls.end');
});
