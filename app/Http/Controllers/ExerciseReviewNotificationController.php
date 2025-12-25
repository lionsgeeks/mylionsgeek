<?php

namespace App\Http\Controllers;

use App\Models\ExerciseReviewNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExerciseReviewNotificationController extends Controller
{
    /**
     * Mark an exercise review notification as read
     */
    public function markAsRead($notificationId)
    {
        $user = Auth::user();
        
        $notification = ExerciseReviewNotification::where('id', $notificationId)
            ->where('coach_id', $user->id)
            ->firstOrFail();

        if (!$notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['success' => true]);
    }
}
