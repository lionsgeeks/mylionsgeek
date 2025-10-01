<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormationController extends Controller
{
    public function index(Request $request)
    {
        $coachId = $request->query('coach');
        $track = $request->query('track');

        $query = Formation::with('coach')->withCount('users');

        if (!empty($coachId)) {
            $query->where('user_id', $coachId);
        }

        if (!empty($track)) {
            $query->where('category', $track);
        }

        $trainings = $query->orderBy('created_at', 'desc')->get();

        $coaches = User::where('role', 'coach')->get();
        $tracks = Formation::select('category')->distinct()->pluck('category');

        return Inertia::render('admin/training/index', [
            'trainings' => $trainings,
            'coaches'   => $coaches,
            'filters'   => [
                'coach' => $coachId,
                'track' => $track,
            ],
            'tracks'    => $tracks,
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

        return back()->with('success', 'Training added successfully!');
    }
    /////////////////////
    public function addStudent(Formation $training, Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id'
        ]);

        $user = User::find($validated['student_id']);
        if ($user) {
            $user->formation_id = $training->id;
            $user->save();
        }

        return back()->with('success', 'Student added');
    }

    public function removeStudent(Formation $training, User $user)
    {
        if ($user->formation_id === $training->id) {
            $user->formation_id = null;
            $user->save();
        }
        return back()->with('success', 'Student removed');
    }

}
