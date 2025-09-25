<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function index()
    {
        $members = User::latest()->paginate(10);
        $allMembers = User::all();
        return Inertia::render(
            'admin/members/index',
            [
                'paginateMembers' => $members,
                'allMembers' => $allMembers
            ]
        );
    }
}
