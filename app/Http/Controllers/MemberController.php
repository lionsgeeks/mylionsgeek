<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function index()
    {
        $members = User::all();
        return Inertia::render(
            'admin/members/index',
            ['allMembers' => $members,]
        );
    }
}
