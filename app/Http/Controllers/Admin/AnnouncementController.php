<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return abort(403, 'Unauthorized');
        }

        $request->validate([
            'title' => 'required|string|min:5|max:100',
            'message' => 'required|string|min:10|max:500',
        ]);

        Announcement::create([
            'title' => $request->title,
            'message' => $request->message,
            'created_by' => $user->id,
        ]);

        return redirect()->back()->with('success', 'Announcement published successfully.');
    }

    public function update(Request $request, $id) {}

    public function destroy(Request $request, $id) {}
}
