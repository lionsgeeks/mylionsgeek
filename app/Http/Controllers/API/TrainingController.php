<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceListe;
use App\Models\Note;
use App\Models\Formation;
use App\Models\User;
use App\Services\DisciplineService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TrainingController extends Controller
{
    public function index(Request $request)
    {
        try {
            $checkResult = $this->checkRequestedUser();
            if ($checkResult) {
                return $checkResult;
            }

            $coachId = $request->query('coach');
            $track = $request->query('track');
            $promo = $request->query('promo');

            $query = Formation::with('coach')->withCount('users');

            if (!empty($coachId)) {
                $query->where('user_id', $coachId);
            }

            if (!empty($track)) {
                $query->where('category', $track);
            }
            
            if (!empty($promo)) {
                $query->where('promo', $promo);
            }

            $trainings = $query->orderBy('created_at', 'desc')->get()->map(function ($training) {
                try {
                    $img = $training->img ?? null;
                    if ($img && !Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                        $img = 'storage/img/training/' . ltrim($img, '/');
                    } elseif ($img && Str::startsWith($img, 'storage/') && !Str::startsWith($img, 'storage/img/')) {
                        // If it's already storage/ but not storage/img/training/, update it
                        $img = 'storage/img/training/' . basename($img);
                    }
                    
                    $coachData = null;
                    if ($training->coach) {
                        $coachData = [
                            'id' => $training->coach->id ?? null,
                            'name' => $training->coach->name ?? null,
                            'email' => $training->coach->email ?? null,
                        ];
                    }
                    
                    return [
                        'id' => $training->id ?? null,
                        'name' => $training->name ?? null,
                        'img' => $img ? asset($img) : null,
                        'category' => $training->category ?? null,
                        'start_time' => $training->start_time ?? null,
                        'end_time' => $training->end_time ?? null,
                        'promo' => $training->promo ?? null,
                        'coach' => $coachData,
                        'users_count' => $training->users_count ?? 0,
                        'created_at' => $training->created_at ? (is_string($training->created_at) ? $training->created_at : $training->created_at->toDateTimeString()) : null,
                        'updated_at' => $training->updated_at ? (is_string($training->updated_at) ? $training->updated_at : $training->updated_at->toDateTimeString()) : null,
                    ];
                } catch (\Exception $e) {
                    Log::error('Error mapping training: ' . $e->getMessage(), [
                        'training_id' => $training->id ?? 'unknown',
                    ]);
                    return null;
                }
            })->filter();

            // Try to get coaches, but handle errors gracefully
            try {
                $coaches = User::whereJsonContains('role', 'coach')->get()->map(function ($coach) {
                    return [
                        'id' => $coach->id,
                        'name' => $coach->name,
                        'email' => $coach->email,
                    ];
                });
            } catch (\Exception $e) {
                // Fallback: try to get coaches by role string if JSON query fails
                $coaches = User::where('role', 'coach')
                    ->orWhere('role', 'like', '%coach%')
                    ->get()
                    ->map(function ($coach) {
                        return [
                            'id' => $coach->id,
                            'name' => $coach->name,
                            'email' => $coach->email,
                        ];
                    });
            }

            $tracks = Formation::select('category')->distinct()->pluck('category')->filter()->values()->toArray();
            $promos = Formation::select('promo')->distinct()->pluck('promo')->filter()->values()->toArray();

            return response()->json([
                'trainings' => $trainings->values()->toArray(),
                'coaches' => $coaches->values()->toArray(),
                'tracks' => $tracks,
                'promos' => $promos,
                'filters' => [
                    'coach' => $coachId,
                    'track' => $track,
                    'promo' => $promo,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('TrainingController@index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch trainings',
                'message' => config('app.debug') ? $e->getMessage() : 'An error occurred while fetching trainings',
            ], 500);
        }
    }

    public function show($id)
    {
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }

        $training = Formation::with(['coach', 'users'])->findOrFail($id);
        
        $usersNull = User::whereNull('formation_id')->get()->map(function ($user) {
            $img = $user->image;
            if ($img && !Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
                $img = 'storage/img/profile/' . ltrim($img, '/');
            }
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'image' => $img ? asset($img) : null,
            ];
        });

        $img = $training->img;
        if ($img && !Str::startsWith($img, ['http://', 'https://', 'storage/'])) {
            $img = 'storage/img/training/' . ltrim($img, '/');
        } elseif ($img && Str::startsWith($img, 'storage/') && !Str::startsWith($img, 'storage/img/training/')) {
            // If it's already storage/ but not storage/img/training/, update it
            $img = 'storage/img/training/' . basename($img);
        }

        $coachImg = $training->coach?->image;
        if ($coachImg && !Str::startsWith($coachImg, ['http://', 'https://', 'storage/'])) {
            $coachImg = 'storage/img/profile/' . ltrim($coachImg, '/');
        }

        $trainingData = [
            'id' => $training->id,
            'name' => $training->name,
            'img' => $img ? asset($img) : null,
            'category' => $training->category,
            'start_time' => $training->start_time,
            'end_time' => $training->end_time,
            'promo' => $training->promo,
            'coach' => $training->coach ? [
                'id' => $training->coach->id,
                'name' => $training->coach->name,
                'email' => $training->coach->email,
                'image' => $coachImg ? asset($coachImg) : null,
            ] : null,
            'users' => $training->users->map(function ($user) {
                $userImg = $user->image;
                if ($userImg && !Str::startsWith($userImg, ['http://', 'https://', 'storage/'])) {
                    $userImg = 'storage/img/profile/' . ltrim($userImg, '/');
                }
                
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'image' => $userImg ? asset($userImg) : null,
                ];
            }),
            'created_at' => $training->created_at ? (is_string($training->created_at) ? $training->created_at : $training->created_at->toDateTimeString()) : null,
            'updated_at' => $training->updated_at ? (is_string($training->updated_at) ? $training->updated_at : $training->updated_at->toDateTimeString()) : null,
        ];

        return response()->json([
            'training' => $trainingData,
            'usersNull' => $usersNull,
        ]);
    }

    public function store(Request $request)
    {
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'img' => 'nullable|string|max:255',
            'category' => 'required|string|max:100',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date',
            'user_id' => 'required|exists:users,id',
            'promo' => 'nullable|string|max:50',
        ]);

        $training = Formation::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Training created successfully',
            'training' => $training,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'img' => 'nullable|string|max:255',
            'category' => 'required|string|max:100',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date',
            'user_id' => 'nullable|exists:users,id',
            'promo' => 'nullable|string|max:50',
        ]);

        $formation = Formation::findOrFail($id);
        $formation->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Training updated successfully',
            'training' => $formation,
        ]);
    }

    public function destroy($id)
    {
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }

        $formation = Formation::findOrFail($id);
        $formation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Training deleted successfully',
        ]);
    }

    public function addStudent(Request $request, $id)
    {
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }

        $validated = $request->validate([
            'student_id' => 'required|exists:users,id'
        ]);

        $training = Formation::findOrFail($id);
        $user = User::findOrFail($validated['student_id']);
        
        if ($user) {
            $user->formation_id = $training->id;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Student added successfully',
        ]);
    }

    public function removeStudent($id, $userId)
    {
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }

        $training = Formation::findOrFail($id);
        $user = User::findOrFail($userId);
        
        if ($user->formation_id === $training->id) {
            $user->formation_id = null;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Student removed successfully',
        ]);
    }

    public function bulkUpdateUsers(Request $request, $id)
    {
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }

        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'required|exists:users,id',
            'roles' => 'nullable|array',
            'roles.*' => 'nullable|string',
            'status' => 'nullable|string|in:Working,Studying,Internship,Unemployed,Freelancing',
        ]);

        $training = Formation::findOrFail($id);
        $users = User::whereIn('id', $validated['user_ids'])
            ->where('formation_id', $training->id)
            ->get();

        if ($users->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No valid users found for this training.',
            ], 400);
        }

        $updated = 0;
        foreach ($users as $user) {
            $updateData = [];

            if ($request->has('roles') && !empty($validated['roles'])) {
                $updateData['role'] = array_values(array_map(function ($r) {
                    return strtolower((string) $r);
                }, array_filter($validated['roles'])));
            }

            if ($request->has('status') && !empty($validated['status'])) {
                $updateData['status'] = $validated['status'];
            }

            if (!empty($updateData)) {
                $user->update($updateData);
                $updated++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully updated {$updated} user(s).",
        ]);
    }

    public function attendance(Request $request)
    {
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }

        $request->validate([
            'formation_id' => 'required|integer|exists:formations,id',
            'attendance_day' => 'required|date',
        ]);

        // Find existing attendance for formation + day or create one
        $attendance = Attendance::where('formation_id', $request->formation_id)
            ->whereDate('attendance_day', $request->attendance_day)
            ->first();

        if (!$attendance) {
            $attendance = Attendance::create([
                'formation_id' => $request->formation_id,
                'attendance_day' => $request->attendance_day,
                'staff_name' => Auth::guard('sanctum')->user()->name ?? 'Staff',
            ]);
        }

        // If a legacy record was created earlier with a UUID string as id, replace it with a fresh integer id record
        if ($attendance && !is_numeric($attendance->id)) {
            $new = Attendance::create([
                'formation_id' => $request->formation_id,
                'attendance_day' => $request->attendance_day,
                'staff_name' => Auth::guard('sanctum')->user()->name ?? 'Staff',
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

    public function attendanceEvents($id)
    {
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }

        $training = Formation::findOrFail($id);
        $events = Attendance::where('formation_id', $training->id)
            ->orderByDesc('attendance_day')
            ->get(['attendance_day', 'staff_name'])
            ->map(function ($a) {
                return [
                    'date' => $a->attendance_day,
                    'title' => 'Saved by ' . ($a->staff_name ?? 'staff'),
                    'color' => '#FACC15', // yellow-400
                ];
            });

        return response()->json(['events' => $events]);
    }

    public function save(Request $request)
    {
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }

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

        $lastAttendanceId = null;
        $disciplineService = new DisciplineService();
        $user = Auth::guard('sanctum')->user();

        foreach ($request->attendance as $data) {
            $attendanceId = isset($data['attendance_id']) && is_numeric($data['attendance_id'])
                ? (int) $data['attendance_id']
                : null;

            if ($attendanceId === null) {
                continue;
            }

            $lastAttendanceId = $attendanceId;

            // GET OLD DISCIPLINE BEFORE UPDATE
            $attendanceUser = User::find($data['user_id']);
            if (!$attendanceUser) {
                continue;
            }

            // Calculate discipline BEFORE updating attendance
            $oldDiscipline = $disciplineService->calculateDisciplineScore($attendanceUser);

            $payload = [
                'attendance_day' => $data['attendance_day'],
                'morning' => $data['morning'] ?? 'present',
                'lunch' => $data['lunch'] ?? 'present',
                'evening' => $data['evening'] ?? 'present',
            ];

            AttendanceListe::updateOrCreate(
                [
                    'attendance_id' => $attendanceId,
                    'user_id' => $data['user_id'],
                ],
                $payload
            );

            // Process discipline change and create notification if threshold crossed
            $disciplineService->processDisciplineChange($attendanceUser, $oldDiscipline);

            // Notes dyal absence (existing code)
            if (!empty($data['note'])) {
                $notes = array_filter(array_map('trim', explode(' | ', (string) $data['note'])));
                foreach ($notes as $noteText) {
                    try {
                        Note::create([
                            'user_id' => $data['user_id'],
                            'attendance_id' => $attendanceId,
                            'note' => $noteText,
                            'author' => $user->name ?? 'Staff',
                        ]);
                    } catch (\Throwable $e) {
                        // Do not block attendance save if a note insert fails
                    }
                }
            }
        }

        // Tag latest editor name on attendance row
        if (!empty($lastAttendanceId)) {
            Attendance::where('id', $lastAttendanceId)->update(['staff_name' => $user->name ?? 'Staff']);
        }

        return response()->json(['status' => 'ok']);
    }

}
