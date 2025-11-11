<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;

class PlacesController extends Controller
{


    public function getPlacesJson(): JsonResponse
    {
        $data = [
            'studios' => [],
            'coworks' => [],
            'meeting_rooms' => [],
        ];

        if (Schema::hasTable('studios')) {
            $data['studios'] = DB::table('studios')
                ->select('id', 'name', 'image')
                ->get()
                ->map(function ($row) {
                    $img = $row->image
                        ? (str_starts_with($row->image, 'http') || str_starts_with($row->image, 'storage/')
                            ? $row->image
                            : asset('storage/img/studio/' . ltrim($row->image, '/')))
                        : null;
                    return [
                        'id' => $row->id,
                        'name' => $row->name,
                        'image' => $img,
                    ];
                });
        }

        if (Schema::hasTable('coworks')) {
            $data['coworks'] = DB::table('coworks')
                ->select('id', 'table as name', 'image')
                ->get()
                ->map(function ($row) {
                    $img = $row->image
                        ? (str_starts_with($row->image, 'http') || str_starts_with($row->image, 'storage/')
                            ? $row->image
                            : asset('storage/img/cowork/' . ltrim($row->image, '/')))
                        : null;
                    return [
                        'id' => $row->id,
                        'name' => 'Table ' . ($row->name ?? ''),
                        'image' => $img,
                    ];
                });
        }

        if (Schema::hasTable('meeting_rooms')) {
            $data['meeting_rooms'] = DB::table('meeting_rooms')
                ->select('id', 'name', 'image')
                ->get()
                ->map(function ($row) {
                    $img = $row->image
                        ? (str_starts_with($row->image, 'http') || str_starts_with($row->image, 'storage/')
                            ? $row->image
                            : asset('storage/img/meeting_room/' . ltrim($row->image, '/')))
                        : null;
                    return [
                        'id' => $row->id,
                        'name' => $row->name,
                        'image' => $img,
                    ];
                });
        }

        return response()->json($data);
    }


    public function index()
    {
        $places = collect();

        if (Schema::hasTable('coworks')) {
            $coworks = DB::table('coworks')
                ->select('id', 'table', 'state', 'image', 'created_at')
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($row) {
                    $img = $row->image ? (str_starts_with($row->image, 'http') || str_starts_with($row->image, 'storage/') ? $row->image : ('storage/img/cowork/' . ltrim($row->image, '/'))) : null;
                    return [
                        'id' => $row->id,
                        'name' => 'Table ' . ($row->table ?? ''),
                        'place_type' => 'cowork',
                        'state' => (bool) ($row->state ?? 0),
                        'image' => $img ? asset($img) : null,
                        'created_at' => $row->created_at,
                    ];
                });
            $places = $places->concat($coworks);
        }

        if (Schema::hasTable('studios')) {
            $studios = DB::table('studios')
                ->select('id', 'name', 'state', 'image', 'created_at')
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($row) {
                    $img = $row->image ? (str_starts_with($row->image, 'http') || str_starts_with($row->image, 'storage/') ? $row->image : ('storage/img/studio/' . ltrim($row->image, '/'))) : null;
                    return [
                        'id' => $row->id,
                        'name' => $row->name,
                        'place_type' => 'studio',
                        'state' => (bool) ($row->state ?? 0),
                        'image' => $img ? asset($img) : null,
                        'created_at' => $row->created_at,
                    ];
                });
            $places = $places->concat($studios);
        }

        if (Schema::hasTable('meeting_rooms')) {
            $rooms = DB::table('meeting_rooms')
                ->select('id', 'name', 'state', 'image', 'created_at')
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($row) {
                    $img = $row->image ? (str_starts_with($row->image, 'http') || str_starts_with($row->image, 'storage/') ? $row->image : ('storage/img/meeting_room/' . ltrim($row->image, '/'))) : null;
                    return [
                        'id' => $row->id,
                        'name' => $row->name,
                        'place_type' => 'meeting_room',
                        'state' => (bool) ($row->state ?? 0),
                        'image' => $img ? asset($img) : null,
                        'created_at' => $row->created_at,
                    ];
                });
            $places = $places->concat($rooms);
        }

        // Globally sort newest first and compute available types
        $places = $places
            ->sortByDesc(function ($p) {
                return $p['created_at'] ?? null;
            })
            ->values();

        $types = $places->pluck('place_type')->unique()->values();

        // Collect gallery images from storage/img/* folders
        $studioImages = $this->listPublicImages('img/studio');
        $meetingRoomImages = $this->listPublicImages('img/meeting_room');
        $coworkImages = $this->listPublicImages('img/cowork');
        $equipmentImages = $this->listPublicImages('img/equipment');

        return Inertia::render('admin/places/index', [
            'places' => $places->map(function ($p) {
                unset($p['created_at']);
                return $p;
            }),
            'types' => $types,
            'studioImages' => $studioImages,
            'meetingRoomImages' => $meetingRoomImages,
            'coworkImages' => $coworkImages,
            'equipmentImages' => $equipmentImages,
        ]);
    }

    public function index2()
    {
        $studios = DB::table('studios')
            ->select('id', 'name', 'state', 'image')
            ->orderBy('name')
            ->get()
            ->map(function ($studio) {
                $img = $studio->image ? (
                    str_starts_with($studio->image, 'http') || str_starts_with($studio->image, 'storage/')
                    ? $studio->image
                    : ('storage/img/studio/' . ltrim($studio->image, '/'))
                ) : null;

                return [
                    'id' => $studio->id,
                    'name' => $studio->name,
                    'state' => (bool) $studio->state,
                    'image' => $img ? asset($img) : null,
                    'type' => 'studio',
                ];
            });

        $coworks = DB::table('coworks')
            ->select('id', 'table', 'state', 'image')
            ->orderBy('table')
            ->get()
            ->map(function ($cowork) {
                $img = $cowork->image ? (
                    str_starts_with($cowork->image, 'http') || str_starts_with($cowork->image, 'storage/')
                    ? $cowork->image
                    : ('storage/img/cowork/' . ltrim($cowork->image, '/'))
                ) : null;

                return [
                    'id' => $cowork->id,
                    'name' => 'Table ' . $cowork->table,
                    'state' => (bool) $cowork->state,
                    'image' => $img ? asset($img) : null,
                    'type' => 'cowork',
                ];
            });

        return Inertia::render('students/spaces/index', [
            'studios' => $studios,
            'coworks' => $coworks,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'place_type' => 'required|string|in:cowork,studio,meeting_room',
            'state' => 'required',
            'image' => 'nullable|image|max:4096',
        ]);

        $table = $this->resolveTableFromType($data['place_type']);
        if (!$table || !Schema::hasTable($table)) {
            return back()->with('error', 'Target table not available.');
        }

        $imagePath = null;
        if ($data['place_type'] === 'cowork') {
            // Always use default cowork image
            $imagePath = 'storage/img/cowork/cowork.jpg';
        } else if ($request->hasFile('image')) {
            $imagePath = 'storage/' . $request->file('image')->store('places', 'public');
        }

        // Some SQLite tables may not have AUTOINCREMENT configured for id.
        // To avoid NOT NULL constraint errors, explicitly assign the next id when needed.
        $nextId = (int) (DB::table($table)->max('id') ?? 0) + 1;

        if ($table === 'coworks') {
            DB::table($table)->insert([
                'id' => $nextId,
                'table' => $data['name'],
                'state' => (int) ((string)$data['state'] === '1' || $data['state'] === 1 || $data['state'] === true),
                'image' => $imagePath,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table($table)->insert([
                'id' => $nextId,
                'name' => $data['name'],
                'state' => (int) ((string)$data['state'] === '1' || $data['state'] === 1 || $data['state'] === true),
                'image' => $imagePath,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }


        return redirect()->route('admin.places')->with('success', 'Place added');
    }

    public function update(Request $request, int $place)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'place_type' => 'required|string|in:cowork,studio,meeting_room',
            'state' => 'required',
            'image' => 'nullable|image|max:4096',
        ]);

        $table = $this->resolveTableFromType($data['place_type']);
        if (!$table || !Schema::hasTable($table)) {
            return back()->with('error', 'Target table not available.');
        }

        if ($table === 'coworks') {
            $update = [
                'table' => $data['name'],
                'state' => (int) ((string)$data['state'] === '1' || $data['state'] === 1 || $data['state'] === true),
                'updated_at' => now(),
            ];
        } else {
            $update = [
                'name' => $data['name'],
                'state' => (int) ((string)$data['state'] === '1' || $data['state'] === 1 || $data['state'] === true),
                'updated_at' => now(),
            ];
        }



        if ($table !== 'coworks' && $request->hasFile('image')) {
            $update['image'] = 'storage/' . $request->file('image')->store('places', 'public');
        }

        DB::table($table)->where('id', $place)->update($update);

        return redirect()->route('admin.places')->with('success', 'Place updated');
    }

    public function destroy(Request $request, int $place)
    {
        $type = $request->input('place_type');
        $table = $this->resolveTableFromType($type);

        if (!$table || !Schema::hasTable($table)) {
            return back()->with('error', 'Target table not available.');
        }

        DB::table($table)->where('id', $place)->delete();

        return back()->with('success', 'Place deleted');
    }

    private function resolveTableFromType(?string $type): ?string
    {
        return match ($type) {
            'cowork' => 'coworks',
            'studio' => 'studios',
            'meeting_room' => 'meeting_rooms',
            default => null,
        };
    }

    /**
     * List image URLs under storage/app/public/{folder} as asset('storage/...')
     */
    private function listPublicImages(string $folder): array
    {
        $diskPath = 'public/' . trim($folder, '/');
        if (!Storage::exists($diskPath)) {
            return [];
        }
        $files = Storage::files($diskPath);
        $images = [];
        foreach ($files as $path) {
            $lower = strtolower($path);
            if (!str_ends_with($lower, '.jpg') && !str_ends_with($lower, '.jpeg') && !str_ends_with($lower, '.png') && !str_ends_with($lower, '.gif') && !str_ends_with($lower, '.webp') && !str_ends_with($lower, '.svg')) {
                continue;
            }
            // Convert public/... to storage/...
            $publicUrl = asset(str_replace('public/', 'storage/', $path));
            $images[] = $publicUrl;
        }
        return $images;
    }
}
