<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Mail\CompleteUserProfile;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class UsersController extends Controller
{
    public function index()
    {
        $allUsers = User::orderBy('created_at', 'desc')->get();
        $allFormation = Formation::orderBy('created_at', 'desc')->get();


        return Inertia::render(
            'admin/users/index',
            [
                'users' => $allUsers,
                'trainings' => $allFormation
            ]
        );
    }
    //! edit sunction
    public function show(User $user)
    {
        if (Schema::hasTable('accesses')) {
            $user->load(['access']);
        }
        $allFormation = Formation::orderBy('created_at', 'desc')->get();

        // Placeholder related datasets for UI sections; replace with real relations when available
        $projects = [];
        $posts = [];
        $certificates = [];
        $cv = null;
        // Notes authored for this user (attendance-related or general)
        $notes = \App\Models\Note::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get(['note as text','author','created_at'])
            ->map(function ($row) {
                return [
                    'text' => (string) $row->text,
                    'author' => (string) ($row->author ?? 'Unknown'),
                    'created_at' => (string) $row->created_at,
                ];
            });

        // Attendance & Absences data
        $absencesQuery = \App\Models\AttendanceListe::query()
            ->select(['attendance_lists.*'])
            ->where('user_id', $user->id)
            // absent if any period marked absent
            ->where(function ($q) {
                $q->where('morning', 'absent')
                  ->orWhere('lunch', 'absent')
                  ->orWhere('evening', 'absent');
            })
            ->orderByDesc('attendance_day')
            ->orderByDesc('updated_at');

        $absences = $absencesQuery->paginate(10)->onEachSide(1);
        $recentAbsences = (clone $absencesQuery)->limit(5)->get();

        // Fetch notes mapped by attendance_id for quick attach
        $attendanceIds = $recentAbsences->pluck('attendance_id')
            ->merge($absences->getCollection()->pluck('attendance_id'))
            ->unique()
            ->values();
        $notesByAttendance = \App\Models\Note::whereIn('attendance_id', $attendanceIds)
            ->get(['attendance_id','note','created_at','author','user_id'])
            ->groupBy('attendance_id');

        // Discipline metric (weighted score across user's attendance, 0..100)
        $allForDiscipline = \App\Models\AttendanceListe::where('user_id', $user->id)->get(['morning','lunch','evening']);
        $totalSlots = max(1, $allForDiscipline->count() * 3);
        $score = 0;
        $weight = function ($status) {
            switch (strtolower((string) $status)) {
                case 'present': return 1.0;
                case 'excused': return 0.9;
                case 'late': return 0.7;
                case 'absent': return 0.0;
                default: return 0.7; // treat unknown as late-ish
            }
        };
        foreach ($allForDiscipline as $row) {
            $score += $weight($row->morning) + $weight($row->lunch) + $weight($row->evening);
        }
        $discipline = round(($score / $totalSlots) * 100);

        return Inertia::render('admin/users/[id]', [
            'user' => $user,
            'trainings' => $allFormation,
            'projects' => $projects,
            'posts' => $posts,
            'certificates' => $certificates,
            'cv' => $cv,
            'notes' => $notes,
            // Attendance payloads
            'discipline' => $discipline,
            'absences' => [
                'data' => $absences->getCollection()->map(function ($row) use ($notesByAttendance) {
                    return [
                        'attendance_id' => $row->attendance_id,
                        'date' => $row->attendance_day,
                        'morning' => strtolower((string) $row->morning),
                        'lunch' => strtolower((string) $row->lunch),
                        'evening' => strtolower((string) $row->evening),
                        'notes' => ($notesByAttendance[$row->attendance_id] ?? collect())->pluck('note')->values(),
                    ];
                }),
                'meta' => [
                    'current_page' => $absences->currentPage(),
                    'last_page' => $absences->lastPage(),
                    'per_page' => $absences->perPage(),
                    'total' => $absences->total(),
                ],
            ],
            'recentAbsences' => $recentAbsences->map(function ($row) use ($notesByAttendance) {
                return [
                    'attendance_id' => $row->attendance_id,
                    'date' => $row->attendance_day,
                    'morning' => strtolower((string) $row->morning),
                    'lunch' => strtolower((string) $row->lunch),
                    'evening' => strtolower((string) $row->evening),
                    'notes' => ($notesByAttendance[$row->attendance_id] ?? collect())->pluck('note')->values(),
                ];
            }),
        ]);
    }
    
    // Return user notes as JSON for modal consumption
    public function notes(User $user)
    {
        $notes = \App\Models\Note::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['note','author','created_at'])
            ->map(function ($row) {
                return [
                    'note' => (string) $row->note,
                    'author' => (string) ($row->author ?? 'Unknown'),
                    'created_at' => (string) $row->created_at,
                ];
            })
            ->values();

        return response()->json(['notes' => $notes]);
    }
    public function update(Request $request, User $user)
    {

        // dd($request->all());
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'role' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:100',
            'formation_id' => 'nullable|integer|exists:formations,id',
            'phone' => 'nullable|string|max:15',
            'cin' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('users', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'User updated successfully');
    }
    public function updateAccountStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'account_state' => 'required|integer|in:0,1'
        ]);

        $user->update([
            'account_state' => $validated['account_state'],
        ]);
        // dd($user->account_state , $request->account_state);

        return redirect()->back()->with('success', 'User account status updated successfully');
    }

    //! store function
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'nullable|string|confirmed', // expects password_confirmation
            'phone' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg', // Or 'nullable|string' if not a file
            'status' => 'nullable|string', // adjust allowed values as needed
            'cin' => 'nullable|string', // National ID, if applicable
            'formation_id' => 'required|exists:formations,id', // Assumes foreign key to formations table
            'access_studio' => 'required|integer|in:0,1', // Assumes foreign key to formations table
            'access_cowork' => 'required|integer|in:0,1', // Assumes foreign key to formations table
            'role' => 'required|string', // Assumes foreign key to formations table
            'entreprise' => 'nullable|string', // Assumes foreign key to formations table
        ]);
        // dd($request->all());
        $existing = User::query()->where('email', $validated['email'])->first();
        if ($existing) {
            return Inertia::render('admin/users/partials/Header', [
                'message' => 'this email already exist'
            ]);
        }
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('users', 'public');
            $validated['image'] = '/storage/' . $path;
        }
        $plainPassword = Str::random(12);
        User::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($plainPassword),
            'phone' => $validated['phone'] ?? null,  // Use null if 'phone' is not present
            'image' => $validated['image'] ?? null,  // Handle image field similarly if not uploaded
            'status' => $validated['status'] ?? null,
            'cin' => $validated['cin'] ?? null,
            'formation_id' => $validated['formation_id'],
            'account_state' => $validated['account_state'] ?? 'active', // Add a default value if needed
            'access_studio' => $validated['access_studio'],
            'access_cowork' => $validated['access_cowork'],
            'role' => $validated['role'],
            'entreprise' => $validated['entreprise'] ?? null,
            'remember_token' => null,
            'email_verified_at' => null,
        ]);
        // Mail::to($user->email)->queue(new CompleteUserProfile($user, $plainPassword));
        // dd($user);

        return redirect()->back()->with('success', 'User updated successfully');
    }

    // Lightweight JSON for modal: discipline + all absences
    public function attendanceSummary(User $user)
    {
        $absencesQuery = \App\Models\AttendanceListe::query()
            ->where('user_id', $user->id)
            ->where(function ($q) {
                $q->where('morning', 'absent')
                  ->orWhere('lunch', 'absent')
                  ->orWhere('evening', 'absent');
            })
            ->orderByDesc('attendance_day')
            ->orderByDesc('updated_at');

        $all = $absencesQuery->get(['attendance_id','attendance_day','morning','lunch','evening']);
        $attendanceIds = $all->pluck('attendance_id')->unique()->values();
        $notesByAttendance = \App\Models\Note::whereIn('attendance_id', $attendanceIds)
            ->get(['attendance_id','note'])
            ->groupBy('attendance_id');

        $rows = $all->map(function ($row) use ($notesByAttendance) {
            return [
                'attendance_id' => $row->attendance_id,
                'date' => $row->attendance_day,
                'morning' => strtolower((string) $row->morning),
                'lunch' => strtolower((string) $row->lunch),
                'evening' => strtolower((string) $row->evening),
                'notes' => ($notesByAttendance[$row->attendance_id] ?? collect())->pluck('note')->values(),
            ];
        });

        $allForDiscipline = \App\Models\AttendanceListe::where('user_id', $user->id)->get(['morning','lunch','evening']);
        $totalSlots = max(1, $allForDiscipline->count() * 3);
        $score = 0;
        $weight = function ($status) {
            switch (strtolower((string) $status)) {
                case 'present': return 1.0;
                case 'excused': return 0.9;
                case 'late': return 0.7;
                case 'absent': return 0.0;
                default: return 0.7;
            }
        };
        foreach ($allForDiscipline as $row) {
            $score += $weight($row->morning) + $weight($row->lunch) + $weight($row->evening);
        }
        $discipline = round(($score / $totalSlots) * 100);

        return response()->json([
            'discipline' => $discipline,
            'recentAbsences' => $rows,
        ]);
    }
}
