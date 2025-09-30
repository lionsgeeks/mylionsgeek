<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormationController extends Controller
{
    public function index()
    {
        // $trainings = Formation::all();
$trainings = Formation::with('coach')->withCount('users')->get();
        

        $coaches = User::where('role', 'coach')->get();
        $formations = Formation::all();

           

        return Inertia::render('admin/training/index', [
            'trainings' => $trainings,
            'coaches'   => $coaches,
        ]);
    }

    // //////////////////////////////////////////
    public function show(Formation $training)
{
   $usersNull = User::whereNull('formation_id')->get();
    return inertia('admin/training/[id]', [
        'training' => $training->load('coach', 'users'),
        'usersNull'=>$usersNull
    ]);
}


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'img'        => 'nullable|string|max:255',
            'category'   => 'required|string|max:100',
            'start_time' => 'required|date',
            'end_time'   => 'nullable|date',
            'user_id'    => 'required|exists:users,id',
            'promo'      => 'nullable|string|max:50',
        ]);

        Formation::create($validated);

        return redirect()->route('training.index')
                         ->with('success', 'Training added successfully!');
    }
    /////////////////////
    public function addStudent(Formation $training, Request $request)
{
    $user = User::find($request->student_id);
    if ($user) {
        $user->formation_id = $training->id;
        $user->save();
    }

    return response()->json(['success' => true]);
}

}
