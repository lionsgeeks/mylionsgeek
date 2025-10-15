<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CompleteProfile extends Controller
{
    //
    public function goToCompleteProfile(){
        return Inertia::render('profile/index');
    }
}
