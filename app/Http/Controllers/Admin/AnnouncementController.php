<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    //
    public function index()
    {
        $announcements = Announcement::latest()->get();
        return Inertia::render('admin/announcements/index', [
            'announcements' => $announcements
        ]);
    }
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return abort(403, 'Unauthorized');
        }
        $request->validate([
            'title' => 'required|string|min:5',
            'message' => 'required|string|min:10',
        ]);
        Announcement::create([
            'title' => $request->title,
            'message' => $request->message,
            'created_by' => $user->id,
        ]);
        return redirect()->back()->with('Success', 'announcement send successfully');
    }
    public function update(Request $request, $id) {}
    public function destroy(Request $request, $id) {}
}
