<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceListe;
use App\Models\Note;
use App\Models\Formation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;


class FormationController extends Controller
{
    public function index(Request $request)
    {
        $coachId = $request->query('coach');
        $track = $request->query('track');
        $promo = $request->query('promo');

        $query = Formation::with('coach')->withCount('users');
        
        // dd($query->where('promo', $promo)->get());

        if (!empty($coachId)) {
            $query->where('user_id', $coachId);
        }

        if (!empty($track)) {
            $query->where('category', $track);
        }
        if (!empty($promo)) {
           $query->where('promo', $promo);
        }

        $trainings = $query->orderBy('created_at', 'desc')->get();

        $coaches = User::where('role', 'coach')->get();
        $tracks = Formation::select('category')->distinct()->pluck('category');
        $promos = Formation::select('promo')->distinct()->pluck('promo');

        return Inertia::render('admin/training/index', [
            'trainings' => $trainings,
            'coaches'   => $coaches,
            'filters'   => [
                'coach' => $coachId,
                'track' => $track,
                'promo' => $promo,
            ],
            'tracks'    => $tracks,
            'promos' => $promos,
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
// attendance
public function attendance(Request $request)
{
    $attendance = Attendance::create([
        'id' => Str::uuid(),
        'formation_id'   => $request->formation_id,
        'attendance_day' => $request->attendance_day,
        'staff_name'     => Auth::user()->name,
    ]);

    return response()->json([
        'attendance_id' => $attendance->id
    ]);
}

    // attendance list
public function save(Request $request)
{
    foreach ($request->attendance as $data) {

        // Attendance list
        AttendanceListe::create([
            'id'            => Str::uuid(),
            'user_id'       => $data['user_id'],
            'attendance_id' => $data['attendance_id'],
            'attendance_day'=> $data['attendance_day'],
            'morning'       => $data['morning'],
            'lunch'         => $data['lunch'],
            'evening'       => $data['evening'],
        ]);

        // Notes
        if (!empty($data['note'])) {
            Note::create([
                'id'     => Str::uuid(),
                'user_id'=> $data['user_id'],
                'note'   => $data['note'],
                'author' => Auth::user()->name,
            ]);
        }
    }

    return back()->with('success', 'Attendance list and notes saved successfully!');
}






}
