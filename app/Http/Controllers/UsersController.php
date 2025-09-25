<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function index()
    {
        $allUsers = User::orderBy('created_at' , 'desc')->get();
        
        return Inertia::render(
            'admin/users/index',
            [
                'users' => $allUsers
            ]
        );
    }
}
