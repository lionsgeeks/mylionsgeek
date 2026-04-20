<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceListe;
use App\Models\Note;
use App\Models\Formation;
use App\Models\User;
use App\Services\DisciplineService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use ZipArchive;


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

       $coaches = User::whereJsonContains('role', 'coach')->get();
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

   // Get courses that belong to this training through exercises
   $courses = \App\Models\Course::whereHas('exercices', function($query) use ($training) {
       $query->where('training_id', $training->id);
   })->with('exercices')->get();

   $training->load('coach', 'users');

   // Attach the discipline score to every enrolled user so the frontend
   // can display the attendance percentage without extra API calls.
   $disciplineService = new \App\Services\DisciplineService();
   $training->users->each(function (User $user) use ($disciplineService) {
       $user->discipline = $disciplineService->calculateDisciplineScore($user);
   });

   return inertia('admin/training/[id]', [
       'training'  => $training,
       'usersNull' => $usersNull,
       'courses'   => $courses,
   ]);
}


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'img'        => 'nullable|string|max:255',
            'certificate_template' => 'nullable|image|max:5120',
            'category'   => 'required|string|max:100',
            'start_time' => 'required|date',
            'end_time'   => 'nullable|date',
            'user_id'    => 'required|exists:users,id',
            'promo'      => 'nullable|string|max:50',
        ]);
        // dd($request->all());

        if ($request->hasFile('certificate_template')) {
            $path = $request->file('certificate_template')->store('certificate-templates', 'public');
            $validated['certificate_template'] = $path;
        }

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

    $lastAttendanceId = null;
    $disciplineService = new DisciplineService();

    foreach ($request->attendance as $data) {
        $attendanceId = isset($data['attendance_id']) && is_numeric($data['attendance_id'])
            ? (int) $data['attendance_id']
            : null;

        if ($attendanceId === null) {
            continue;
        }

        $lastAttendanceId = $attendanceId;

        //  GET OLD DISCIPLINE BEFORE UPDATE
        $user = User::find($data['user_id']);
        if (!$user) {
            continue;
        }

        // Calculate discipline BEFORE updating attendance
        $oldDiscipline = $disciplineService->calculateDisciplineScore($user);

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

        //  Process discipline change and create notification if threshold crossed
        // Only notifies on 5% threshold changes (100, 95, 90, 85, ...)
        $disciplineService->processDisciplineChange($user, $oldDiscipline);

        // Notes dyal absence (existing code)
        if (!empty($data['note'])) {
            $notes = array_filter(array_map('trim', explode(' | ', (string) $data['note'])));
            foreach ($notes as $noteText) {
                try {
                    Note::create([
                        'user_id' => $data['user_id'],
                        'attendance_id' => $attendanceId,
                        'note' => $noteText,
                        'author' => Auth::user()->name,
                    ]);
                } catch (\Throwable $e) {
                    // Do not block attendance save if a note insert fails
                }
            }
        }
    }

    // Tag latest editor name on attendance row
    if (!empty($lastAttendanceId)) {
        Attendance::where('id', $lastAttendanceId)->update(['staff_name' => Auth::user()->name]);
    }

    return response()->json(['status' => 'ok']);
}

// Update formation
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'img'        => 'nullable|string|max:255',
            'certificate_template' => 'nullable|image|max:5120',
            'category'   => 'required|string|max:100',
            'start_time' => 'required|date',
            'end_time'   => 'nullable|date',
            'user_id'    => 'nullable|exists:users,id',
            'promo'      => 'nullable|string|max:50',
        ]);

        $formation = Formation::findOrFail($id);

        if ($request->hasFile('certificate_template')) {
            $path = $request->file('certificate_template')->store('certificate-templates', 'public');
            $validated['certificate_template'] = $path;
        } else {
            unset($validated['certificate_template']);
        }

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

    // Bulk update users roles and status
    public function bulkUpdateUsers(Formation $training, Request $request)
    {
        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'required|exists:users,id',
            'roles' => 'nullable|array',
            'roles.*' => 'nullable|string',
            'status' => 'nullable|string|in:Working,Studying,Internship,Unemployed,Freelancing,Certified',
        ]);

        $users = User::whereIn('id', $validated['user_ids'])
            ->where('formation_id', $training->id)
            ->get();

        if ($users->isEmpty()) {
            return back()->with('error', 'No valid users found for this training.');
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

        return back()->with('success', "Successfully updated {$updated} user(s).");
    }

    /**
     * Generate certificates on the server, store them, and return a ZIP download.
     * - Stores: storage/app/public/certificates/{trainingId}/{userId}.pdf
     * - Optionally stores a PNG preview if Imagick is available:
     *   storage/app/public/certificates/{trainingId}/{userId}.png
     */
    public function downloadCertificatesZip(Formation $training, Request $request)
    {
        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'required|exists:users,id',
        ]);

        $users = User::whereIn('id', $validated['user_ids'])
            ->where('formation_id', $training->id)
            ->get();

        if ($users->isEmpty()) {
            return back()->with('error', 'No valid users found for this training.');
        }

        $readTemplateAsDataUri = function () use ($training): string {
            $defaultPath = public_path('images/certificate-template.jpg');

            // If a per-training template is configured, prefer it.
            $configured = (string) ($training->certificate_template ?? '');
            if ($configured !== '') {
                $normalized = ltrim($configured, '/');
                if (str_starts_with($normalized, 'storage/')) {
                    $normalized = substr($normalized, strlen('storage/'));
                }

                if (Storage::disk('public')->exists($normalized)) {
                    $bytes = Storage::disk('public')->get($normalized);
                    // We accept jpg/png; dompdf will render either from a data URI.
                    $mime = str_ends_with(strtolower($normalized), '.png') ? 'image/png' : 'image/jpeg';
                    return 'data:' . $mime . ';base64,' . base64_encode($bytes);
                }

                Log::warning('Configured certificate template not found; falling back to default.', [
                    'training_id' => $training->id,
                    'certificate_template' => $configured,
                ]);
            }

            if (! is_file($defaultPath)) {
                abort(500, 'Certificate template image is missing.');
            }

            return 'data:image/jpeg;base64,' . base64_encode((string) file_get_contents($defaultPath));
        };

        $templateDataUri = $readTemplateAsDataUri();

        $tmpZipPath = storage_path('app/tmp/certificates-' . $training->id . '-' . now()->format('YmdHis') . '-' . Str::random(8) . '.zip');
        if (! is_dir(dirname($tmpZipPath))) {
            @mkdir(dirname($tmpZipPath), 0755, true);
        }

        $zip = new ZipArchive();
        if ($zip->open($tmpZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            abort(500, 'Failed to create ZIP archive.');
        }

        $savedCount = 0;
        foreach ($users as $user) {
            try {
                $pdf = Pdf::loadView('certificates.certificate', [
                    'studentName' => (string) ($user->name ?? ''),
                    'field' => (string) ($user->field ?? ''),
                    'trainingTitle' => (string) ($training->name ?? ''),
                    'issuedDate' => now()->locale('fr_FR')->translatedFormat('d F Y'),
                    'templateDataUri' => $templateDataUri,
                ])->setPaper('a4', 'landscape');

                $pdfBytes = $pdf->output();

                $pdfStoragePath = 'certificates/' . $training->id . '/' . $user->id . '.pdf';
                Storage::disk('public')->put($pdfStoragePath, $pdfBytes);

                $zip->addFromString('certificat-' . preg_replace('/[^a-zA-Z0-9_\- ]/u', '', (string) $user->name) . '.pdf', $pdfBytes);

                // Mark Certified when a certificate is issued
                if ($user->status !== 'Certified') {
                    $user->update(['status' => 'Certified']);
                }

                // Optional: generate PNG preview using Imagick if available
                if (class_exists(\Imagick::class)) {
                    try {
                        $imagick = new \Imagick();
                        $imagick->setResolution(200, 200);
                        $imagick->readImageBlob($pdfBytes);
                        $imagick->setImageFormat('png');
                        // First page only
                        $imagick->setIteratorIndex(0);
                        $pngBytes = $imagick->getImageBlob();
                        $pngStoragePath = 'certificates/' . $training->id . '/' . $user->id . '.png';
                        Storage::disk('public')->put($pngStoragePath, $pngBytes);
                        $imagick->clear();
                        $imagick->destroy();
                    } catch (\Throwable $e) {
                        Log::warning('Failed to generate certificate PNG preview', [
                            'training_id' => $training->id,
                            'user_id' => $user->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                $savedCount++;
            } catch (\Throwable $e) {
                Log::error('Failed to generate certificate', [
                    'training_id' => $training->id,
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $zip->close();

        if ($savedCount === 0) {
            @unlink($tmpZipPath);
            abort(500, 'Failed to generate certificates.');
        }

        return response()->download($tmpZipPath, 'certificats-' . $training->id . '.zip', [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }




}
