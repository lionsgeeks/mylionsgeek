<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Services\ExpoPushNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('creator')->latest()->get();

        return Inertia::render('admin/announcements/index', [
            'announcements' => $announcements->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'message' => $announcement->message,
                    'created_by' => $announcement->creator?->name ?? 'Unknown',
                    'created_at' => $announcement->created_at->format('d-m-Y'),
                ];
            }),
        ]);
    }

    public function store(Request $request, ExpoPushNotificationService $expoPush)
    {
        $user = Auth::user();
        if (!$user) {
            return abort(403, 'Unauthorized');
        }

        $request->validate([
            'title' => 'required|string|min:5|max:100',
            'message' => 'required|string|min:10|max:500',
        ]);

        $announcement = Announcement::create([
            'title' => $request->title,
            'message' => $request->message,
            'created_by' => $user->id,
        ]);

        $successMessage = 'Announcement published successfully.';

        try {
            $delivered = $expoPush->sendAnnouncementPush(
                $announcement->title,
                $announcement->message,
                $announcement->id
            );

            if ($delivered > 0) {
                $successMessage = "Announcement published. Mobile push sent to {$delivered} device(s).";
            } else {
                $successMessage = 'Announcement published. No mobile devices with push tokens found.';
            }
        } catch (\Throwable $e) {
            Log::error('Announcement mobile push failed', [
                'announcement_id' => $announcement->id,
                'error' => $e->getMessage(),
            ]);
            $successMessage = 'Announcement published. Mobile push delivery failed.';
        }

        return redirect()->back()->with('success', $successMessage);
    }

    public function update(Request $request, $id) {}

    public function destroy(Request $request, $id) {}
}
