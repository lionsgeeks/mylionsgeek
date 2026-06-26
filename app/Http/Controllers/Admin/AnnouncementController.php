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
    public function store() {}
    public function update(Request $request, $id) {}
    public function destroy(Request $request, $id) {}
}
