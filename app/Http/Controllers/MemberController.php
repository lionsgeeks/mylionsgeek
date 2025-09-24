<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function index(){
        return Inertia::render('admin/members/partials/index');
    }
    public function sendAllMembers(){
        $members = User::all();
    }
}
