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
use Illuminate\Support\Facades\DB;


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
        $request->validate([
            'formation_id' => 'required|integer|exists:formations,id',
            'attendance_day' => 'required|date',
        ]);
    // Find existing attendance for formation + day or create one
        $attendance = Attendance::where('formation_id', $request->formation_id)
            ->whereDate('attendance_day', $request->attendance_day)
            ->first();

    if (! $attendance) {
        $attendance = Attendance::create([
            'formation_id'   => $request->formation_id,
            'attendance_day' => $request->attendance_day,
            'staff_name'     => Auth::user()->name,
        ]);
    }

    // If a legacy record was created earlier with a UUID string as id, replace it with a fresh integer id record
        // Normalize legacy IDs: if non-numeric, migrate to fresh numeric id
        if ($attendance && !is_numeric($attendance->id)) {
            $new = Attendance::create([
                'formation_id'   => $request->formation_id,
                'attendance_day' => $request->attendance_day,
                'staff_name'     => Auth::user()->name,
            ]);
            // migrate any list rows
            AttendanceListe::where('attendance_id', $attendance->id)
                ->update(['attendance_id' => $new->id]);
            // optional: migrate notes
            Note::where('attendance_id', $attendance->id)
                ->update(['attendance_id' => $new->id]);
            $attendance = $new;
        }

    // Load existing list entries and attach notes per user (joined as one string)
    $lists = AttendanceListe::where('attendance_id', $attendance->id)
        ->get(['user_id', 'attendance_day', 'morning', 'lunch', 'evening']);

    $userIds = $lists->pluck('user_id')->unique()->values();
    $notesByUser = Note::whereIn('user_id', $userIds)
        ->where('attendance_id', $attendance->id)
        ->get(['user_id', 'note'])
        ->groupBy('user_id')
        ->map(function ($group) {
            return $group->pluck('note')->implode(' | ');
        });

    $lists = $lists->map(function ($row) use ($notesByUser) {
        $row->note = $notesByUser[$row->user_id] ?? null;
        return $row;
    });

    return response()->json([
        'attendance_id' => $attendance->id,
        'lists' => $lists,
            'staff_name' => $attendance->staff_name,
    ]);
}

    // List attendance events for a formation (calendar markers)
    public function attendanceEvents(Formation $training)
    {
        $events = Attendance::where('formation_id', $training->id)
            ->orderByDesc('attendance_day')
            ->get(['attendance_day','staff_name'])
            ->map(function ($a) {
                return [
                    'date' => $a->attendance_day,
                    'title' => 'Saved by ' . ($a->staff_name ?? 'staff'),
                    'color' => '#FACC15', // yellow-400
                ];
            });

        return response()->json(['events' => $events]);
    }

    // attendance list
public function save(Request $request)
{
        $request->validate([
            'attendance' => 'required|array|min:1',
            'attendance.*.attendance_id' => 'required|integer|exists:attendances,id',
            'attendance.*.user_id' => 'required|exists:users,id',
            'attendance.*.attendance_day' => 'required|date',
            'attendance.*.morning' => 'nullable|string|in:present,absent,late,excused',
            'attendance.*.lunch' => 'nullable|string|in:present,absent,late,excused',
            'attendance.*.evening' => 'nullable|string|in:present,absent,late,excused',
            'attendance.*.note' => 'nullable|string',
        ]);

        foreach ($request->attendance as $data) {
        // Update existing or create a new record per user/day/attendance
        $attendanceId = isset($data['attendance_id']) && is_numeric($data['attendance_id'])
            ? (int) $data['attendance_id']
            : null;
            if ($attendanceId === null) {
                // cannot safely insert without valid attendance FK; skip this row
                continue;
            }

            $payload = [
                'attendance_day' => $data['attendance_day'],
                'morning' => $data['morning'] ?? 'present',
                'lunch' => $data['lunch'] ?? 'present',
                'evening' => $data['evening'] ?? 'present',
            ];
            AttendanceListe::updateOrCreate(
                [
                    'attendance_id' => $attendanceId,
                    'user_id' => (int) $data['user_id'],
                ],
                $payload
            );

            if (!empty($data['note'])) {
                // support multiple notes separated by " | "
                $notes = array_filter(array_map('trim', explode(' | ', (string) $data['note'])));
                foreach ($notes as $noteText) {
                    Note::create([
                        'user_id'       => (int) $data['user_id'],
                        'attendance_id' => $attendanceId,
                        'note'          => $noteText,
                        'author'        => Auth::user()->name,
                    ]);
                }
            }
        }

        return response()->json(['status' => 'ok']);
}

// Update formation
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'img'        => 'nullable|string|max:255',
            'category'   => 'required|string|max:100',
            'start_time' => 'required|date',
            'end_time'   => 'nullable|date',
            'user_id'    => 'nullable|exists:users,id',
            'promo'      => 'nullable|string|max:50',
        ]);

        $formation = Formation::findOrFail($id);
        $formation->update($validated);

        return back()->with('success', 'Formation deleted successfully!');
    }

    // Delete formation
    public function destroy($id)
    {
        $formation = Formation::findOrFail($id);
        $formation->delete();

        return back()->with('success', 'Formation deleted successfully!');
    }




}
