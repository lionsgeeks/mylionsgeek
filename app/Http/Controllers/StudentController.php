<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index()
    {
        $user = Auth::user()->load('formation');
        
        return Inertia::render('student/feed/index' , [
            'user' => $user
        ]);
    }
}
