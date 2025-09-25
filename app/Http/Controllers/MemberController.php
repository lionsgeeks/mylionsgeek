<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function index()
    {
        $allUsers = User::orderBy('created_at' , 'desc')->get();
        return Inertia::render(
            'admin/members/index',
            [
                'users' => $allUsers
            ]
        );
    }
}
