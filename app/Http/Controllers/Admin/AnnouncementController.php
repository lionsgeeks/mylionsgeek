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
        return Inertia::render('admin/announcements/index');
    }
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return abort(403, 'Unauthorized');
        }
        try {
            $request->validate([
                'data.title' => 'required|string|min:5',
                'data.message' => 'required|string|min:10',
            ]);
            Announcement::create([
                'title' => $request->data['title'],
                'message' => $request->data['message'],
                'created_by' => $user->id,
            ]);
            return redirect()->back()->with('Success', 'announcement send successfully');
        } catch (\Exception $e) {
            // dd($e->getMessage());
            return Inertia::render('Error');
        };
    }
    public function update(Request $request, $id) {}
    public function destroy(Request $request, $id) {}
}
