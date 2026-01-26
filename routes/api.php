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
    
    // Push token endpoint
    Route::post('/push-token', [\App\Http\Controllers\API\PushTokenController::class, 'store']);
    
    // Test push notification endpoints (for debugging)
    Route::post('/test-push', [\App\Http\Controllers\API\TestPushController::class, 'test']);
    Route::get('/push-status', [\App\Http\Controllers\API\TestPushController::class, 'status']);
    
    // Chat routes
    Route::prefix('chat')->name('chat.')->group(function () {
        Route::get('/', [ChatController::class, 'index'])->name('index');
        Route::get('/following-ids', [ChatController::class, 'getFollowingIds'])->name('following-ids');
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
});
