<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    //
    public function index()
    {
        return Inertia::render('admin/send-notification/index');
    }
    public function store(Request $request)
    {
        $request->validate([
            'title' => ['required', 'string', 'min:5', 'max:10'],
            'message' => ['required', 'string', 'min:10', 'max:100'],
        ]);
        dd($request->all());
    }
    public function update(Request $request, $id) {}
    public function destroy(Request $request, $id) {}
}
