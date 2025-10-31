<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Mail\CompleteUserProfile;
use App\Mail\UserWelcomeMail;
use App\Models\AttendanceListe;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Storage;
use App\Models\Contract;
use App\Models\Medical;
use Symfony\Component\HttpFoundation\Response;

class UsersController extends Controller
{
    public function index()
    {
        $allUsers = User::with('userProjects')
            ->where('role', '!=', 'admin')
            ->orderBy('created_at', 'desc')
            ->get();

        $allFormation = Formation::orderBy('created_at', 'desc')->get();

        return Inertia::render('admin/users/index', [
            'users' => $allUsers,
            'trainings' => $allFormation,
        ]);
    }


    public function export(Request $request): StreamedResponse
    {
        $requestedFields = array_filter(array_map('trim', explode(',', (string) $request->query('fields', 'name,email,cin'))));


        $fieldMap = [
            'id' => 'id',
            'name' => 'name',
            'email' => 'email',
            'cin' => 'cin',
            'phone' => 'phone',
            'status' => 'status',
            'role' => 'role',
            'formation' => 'formation',
            'access_studio' => 'access_studio',
            'access_cowork' => 'access_cowork',
        ];

        $fields = [];
        foreach ($requestedFields as $f) {
            if (isset($fieldMap[$f])) {
                $fields[] = $f;
            }
        }
        if (empty($fields)) {
            $fields = ['name', 'email', 'cin'];
        }

        $query = User::query()->with(['formation']);
        if ($request->filled('role')) {
            $query->where('role', $request->query('role'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->filled('formation_id')) {
            $query->where('formation_id', $request->query('formation_id'));
        }

        $filename = 'students_export_' . now()->format('Y_m_d_H_i_s') . '.csv';

        $response = new StreamedResponse(function () use ($query, $fields) {
            $handle = fopen('php://output', 'w');


            fputcsv($handle, $fields);

            $query->chunk(500, function ($users) use ($handle, $fields) {
                foreach ($users as $user) {
                    $row = [];
                    foreach ($fields as $field) {
                        switch ($field) {
                            case 'formation':
                                $row[] = optional($user->formation)->name;
                                break;
                            case 'access_studio':
                            case 'access_cowork':
                                $row[] = (string) $user->{$field} === '1' || $user->{$field} === 1 ? 'Yes' : 'No';
                                break;
                            default:
                                $row[] = $user->{$field};
                        }
                    }
                    fputcsv($handle, $row);
                }
            });

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');

        return $response;
    }
    //! edit sunction
    public function show(User $user)
    {
        if (Schema::hasTable('accesses')) {
            $user->load(['access']);
        }
        // Load optional relations
        $user->load(['formation']);

        $allFormation = Formation::orderBy('created_at', 'desc')->get();

        // Online status: consider online if last_online within last 5 minutes
        $now = now();
        $lastOnline = $user->last_online ? Carbon::parse($user->last_online) : null;
        $isOnline = $lastOnline ? $lastOnline->gt($now->clone()->subMinutes(5)) : false;

        // Assigned computer (latest with user_id = user)
        $assignedComputer = null;
        if (Schema::hasTable('computers')) {
            $assignedComputer = \App\Models\Computer::where('user_id', $user->id)
                ->orderByDesc('start')
                ->first();
        }

        // Placeholder related datasets for UI sections; replace with real relations when available
        $projects = [];
        $posts = [];
        $certificates = [];
        $cv = null;
        // Notes authored for this user (attendance-related or general)
        $notes = \App\Models\Note::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get(['note as text', 'author', 'created_at'])
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
            ->get()
            ->groupBy('attendance_id');

        // Calculate discipline score (kept as before)
        $score = 0; $totalSlots = 1; // placeholders if used later
        $discipline = round(($score / $totalSlots) * 100);

        // Slim user payload + computed props
        $userPayload = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'cin' => $user->cin,
            'status' => $user->status,
            'image' => $user->image,
            'cover' => $user->cover,
            'about' => $user->about,
            'last_online' => $user->last_online,
            'is_online' => $isOnline,
            'formation_name' => optional($user->formation)->name,
        ];

        return Inertia::render('admin/users/[id]', [
            'user' => $userPayload,
            'trainings' => $allFormation,
            'projects' => $projects,
            'posts' => $posts,
            'certificates' => $certificates,
            'cv' => $cv,
            'notes' => $notes,
            'assignedComputer' => $assignedComputer ? [
                'reference' => $assignedComputer->reference,
                'mark' => $assignedComputer->mark,
                'cpu' => $assignedComputer->cpu,
                'gpu' => $assignedComputer->gpu,
                'start' => (string) $assignedComputer->start,
                'end' => (string) $assignedComputer->end,
            ] : null,
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
            ->get(['note', 'author', 'created_at'])
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

    // Store a new note for a user from the admin modal
    public function storeNote(Request $request, User $user)
    {
        $validated = $request->validate([
            'note' => 'required|string|max:1000',
        ]);

        \App\Models\Note::create([
            'user_id' => (int) $user->id,
            'attendance_id' => null,
            'note' => $validated['note'],
            'author' => (Auth::check() ? (Auth::user()->name ?? 'Admin') : 'Admin'),
        ]);

        return response()->json(['status' => 'ok']);
    }

    // Documents API
    public function documents(User $user)
    {
        $toUrl = function ($path) {
            $p = (string) $path;
            if ($p === '') {
                return null;
            }
            if (str_starts_with($p, 'http://') || str_starts_with($p, 'https://')) {
                return $p;
            }
            // If already a web path like "/storage/...", return as-is (legacy rows)
            if (str_starts_with($p, '/storage/')) {
                return $p;
            }
            // Default: map storage path to public URL
            return Storage::url($p);
        };

        $contracts = Contract::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get(['id', 'contract', 'type', 'created_at'])
            ->map(function ($c) {
                return [
                    'id' => (int) $c->id,
                    'name' => (string) ($c->type ?: 'Contract'),
                    // Always attempt to generate a URL; legacy rows may already store '/storage/...'
                    'url' => (function ($path) {
                        $p = (string) $path;
                        if ($p === '') return null;
                        if (str_starts_with($p, 'http://') || str_starts_with($p, 'https://')) return $p;
                        if (str_starts_with($p, '/storage/')) return $p;
                        return Storage::url($p);
                    })($c->contract),
                    'kind' => 'contract',
                    'created_at' => (string) $c->created_at,
                ];
            });

        $medicals = Medical::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get(['id', 'mc_document', 'description', 'created_at'])
            ->map(function ($m) {
                return [
                    'id' => (int) $m->id,
                    'name' => (string) ($m->description ?: 'Medical certificate'),
                    'url' => (function ($path) {
                        $p = (string) $path;
                        if ($p === '') return null;
                        if (str_starts_with($p, 'http://') || str_starts_with($p, 'https://')) return $p;
                        if (str_starts_with($p, '/storage/')) return $p;
                        return Storage::url($p);
                    })($m->mc_document),
                    'kind' => 'medical',
                    'created_at' => (string) $m->created_at,
                ];
            });

        return response()->json([
            'contracts' => $contracts->values(),
            'medicals' => $medicals->values(),
        ]);
    }

    public function uploadDocument(Request $request, User $user)
    {
        $validated = $request->validate([
            'kind' => 'required|string|in:contract,medical',
            'file' => 'required|file|max:10240',
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:100',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        if ($validated['kind'] === 'contract') {
            Contract::create([
                'user_id' => $user->id,
                'contract' => $path,
                'type' => $validated['type'] ?? ($validated['name'] ?? 'Contract'),
                'reservation_id' => null,
            ]);
        } else {
            Medical::create([
                'user_id' => $user->id,
                'mc_document' => $path,
                'description' => $validated['name'] ?? 'Medical certificate',
                'author' => (Auth::check() ? (Auth::user()->name ?? 'Admin') : 'Admin'),
            ]);
        }

        return response()->json(['status' => 'ok']);
    }

    // Stream a stored document via controller to avoid direct /storage access issues
    public function viewDocument(Request $request, User $user, string $kind, int $doc)
    {
        // Fetch by document id only to handle legacy rows with mismatched user_id types
        if ($kind === 'contract') {
            $row = Contract::where('id', $doc)->firstOrFail();
            $path = (string) $row->contract;
        } else {
            $row = Medical::where('id', $doc)->firstOrFail();
            $path = (string) $row->mc_document;
        }

        // Normalize possible stored paths and resolve to an actual file on public disk
        if (str_starts_with($path, '/storage/')) {
            $path = ltrim(substr($path, strlen('/storage/')), '/');
        }
        if (preg_match('/^https?:\/\//i', $path)) {
            return redirect()->away($path);
        }

        $candidates = [];
        $base = ltrim($path, '/');
        // as-is
        $candidates[] = $base;
        // try common directories for legacy rows that only stored filename
        $candidates[] = 'documents/' . basename($base);
        if ($kind === 'contract') {
            $candidates[] = 'contracts/' . basename($base);
        } else {
            $candidates[] = 'medicals/' . basename($base);
        }

        $resolved = null;
        foreach ($candidates as $candidate) {
            if (Storage::disk('public')->exists($candidate)) {
                $resolved = $candidate;
                break;
            }
        }

        if ($resolved === null) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $fullPath = storage_path('app/public/' . ltrim($resolved, '/'));
        if (!is_file($fullPath)) {
            abort(Response::HTTP_NOT_FOUND);
        }

        return response()->file($fullPath);
    }
    public function update(Request $request, User $user)
    {

        // dd($request->all());
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'roles' => 'nullable|array',
            'roles.*' => 'string',
            'status' => 'nullable|string|max:100',
            'formation_id' => 'nullable|integer|exists:formations,id',
            'phone' => 'nullable|string|max:15',
            'cin' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:2048',
            'cover' => 'nullable|image|max:4096', // <-- allow cover image
            'access_cowork' => 'nullable|integer|in:0,1',
            'access_studio' => 'nullable|integer|in:0,1',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');

            // Generate a unique hashed filename (like 68fb430843ce2.jpg)
            $filename = $file->hashName();

            // Move the file to public/img/profile/
            $file->move(public_path('/storage/img/profile'), $filename);

            // Store only the filename in database
            $validated['image'] = $filename;
        }
        if ($request->hasFile('cover')) {
            $coverFile = $request->file('cover');
            $coverName = $coverFile->hashName();
            $coverFile->move(public_path('/storage/img/cover'), $coverName);
            $validated['cover'] = $coverName;
        }


        // Map roles (array) to 'role' JSON column, lowercased
        if ($request->has('roles')) {
            $roles = $request->input('roles');
            if (is_array($roles)) {
                $validated['role'] = array_values(array_map(function ($r) {
                    return strtolower((string) $r);
                }, $roles));
            }
            unset($validated['roles']);
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
            'roles' => 'required|array|min:1',
            'roles.*' => 'required|string',
            'entreprise' => 'nullable|string', // Assumes foreign key to formations table
        ]);
        $existing = User::query()->where('email', $validated['email'])->first();
        if ($existing) {
            return Inertia::render('admin/users/partials/Header', [
                'message' => 'this email already exist'
            ]);
        }
        if ($request->hasFile('image')) {
            $file = $request->file('image');

            // Generate a unique hashed filename (like 68fb430843ce2.jpg)
            $filename = $file->hashName();

            // Move the file to public/img/profile/
            $file->move(public_path('/storage/img/profile'), $filename);

            // Store only the filename in database
            $validated['image'] = $filename;
        }
        $plainPassword = Str::random(12);
        $token = (string) Str::uuid();
        $lastUser = User::orderBy('id', 'desc')->first();
        // dd($lastUser->id);
        $user = User::create([
            'id' => $lastUser->id + 1,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'activation_token' => $token,
            'password' => Hash::make($plainPassword),
            'phone' => $validated['phone'] ?? null,
            'image' => $validated['image'] ?? null,
            'status' => $validated['status'] ?? null,
            'cin' => $validated['cin'] ?? null,
            'formation_id' => $validated['formation_id'],
            'account_state' => $validated['account_state'] ?? 'active',
            'access_studio' => $validated['access_studio'],
            'access_cowork' => $validated['access_cowork'],
            'role' => $validated['roles'],
            'entreprise' => $validated['entreprise'] ?? null,
            'remember_token' => null,
            'email_verified_at' => null,
        ]);

        $link = URL::temporarySignedRoute(
            'user.complete-profile',
            now()->addHour(24),
            ['token' => $token]
        );
        Mail::to($user->email)->send(new UserWelcomeMail($user, $link));

        // dd($user);

        return redirect()->back()->with('success', 'User updated successfully');
    }

    // Lightweight JSON for modal: discipline + all absences
    public function attendanceSummary(User $user)
    {
        $absencesQuery = AttendanceListe::query()
            ->where('user_id', $user->id)
            ->where(function ($q) {
                $q->where('morning', 'absent')
                    ->orWhere('lunch', 'absent')
                    ->orWhere('evening', 'absent');
            })
            ->orderByDesc('attendance_day')
            ->orderByDesc('updated_at');

        $all = $absencesQuery->get(['attendance_id', 'attendance_day', 'morning', 'lunch', 'evening']);
        $attendanceIds = $all->pluck('attendance_id')->unique()->values();
        $notesByAttendance = \App\Models\Note::whereIn('attendance_id', $attendanceIds)
            ->get(['attendance_id', 'note'])
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

        // Aggregate full-day absences per month (AM, Noon, PM all 'absent')
        $monthlyFullDayAbsences = $all
            ->filter(function ($row) {
                return strtolower((string) $row->morning) === 'absent'
                    && strtolower((string) $row->lunch) === 'absent'
                    && strtolower((string) $row->evening) === 'absent';
            })
            ->groupBy(function ($row) {
                return Carbon::parse($row->attendance_day)->format('Y-m');
            })
            ->map(function ($group, $month) {
                return [
                    'month' => $month,
                    'fullDayAbsences' => $group->count(),
                ];
            })
            ->values()
            ->sortBy('month')
            ->values();

        $allForDiscipline = \App\Models\AttendanceListe::where('user_id', $user->id)->get(['morning', 'lunch', 'evening']);
        $totalSlots = max(1, $allForDiscipline->count() * 3);
        $score = 0;
        $weight = function ($status) {
            switch (strtolower((string) $status)) {
                case 'present':
                    return 1.0;
                case 'excused':
                    return 0.9;
                case 'late':
                    return 0.7;
                case 'absent':
                    return 0.0;
                default:
                    return 0.7;
            }
        };
        foreach ($allForDiscipline as $row) {
            $score += $weight($row->morning) + $weight($row->lunch) + $weight($row->evening);
        }
        $discipline = round(($score / $totalSlots) * 100);

        return response()->json([
            'discipline' => $discipline,
            'recentAbsences' => $rows,
            'monthlyFullDayAbsences' => $monthlyFullDayAbsences,
        ]);
    }
    public function UserAttendanceChart(User $user)
    {
        $attendances = AttendanceListe::where('user_id', $user->id)->get(['attendance_day', 'morning', 'lunch', 'evening']);
        $monthlyAbsences = $attendances
            ->groupBy(function ($record) {
                // Group by month name, e.g., "October"
                return Carbon::parse($record->attendance_day)->format('F');
            })
            ->map(function ($records) {
                $totalAbsent = 0;

                foreach ($records as $r) {
                    if (strtolower((string) $r->morning) === 'absent') $totalAbsent++;
                    if (strtolower((string) $r->lunch) === 'absent') $totalAbsent++;
                    if (strtolower((string) $r->evening) === 'absent') $totalAbsent++;
                }

                return [
                    'month' => Carbon::parse($records->first()->attendance_day)->format('F'),
                    'absence' => $totalAbsent,
                ];
            })
            ->values(); // reset keys

        return response()->json($monthlyAbsences);
    }
}
