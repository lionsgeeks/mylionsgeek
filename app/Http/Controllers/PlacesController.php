<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class PlacesController extends Controller
{
    public function index()
    {
        $places = collect();

        if (Schema::hasTable('coworks')) {
            $coworks = DB::table('coworks')
                ->select('id', 'table', 'state', 'image', 'created_at')
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($row) {
                    return [
                        'id' => $row->id,
                        'name' => 'Table '.($row->table ?? ''),
                        'place_type' => 'cowork',
                        'state' => (bool) ($row->state ?? 0),
                        'image' => $row->image ? asset($row->image) : null,
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
                    return [
                        'id' => $row->id,
                        'name' => $row->name,
                        'place_type' => 'studio',
                        'state' => (bool) ($row->state ?? 0),
                        'image' => $row->image ? asset($row->image) : null,
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
                    return [
                        'id' => $row->id,
                        'name' => $row->name,
                        'place_type' => 'meeting_room',
                        'state' => (bool) ($row->state ?? 0),
                        'image' => $row->image ? asset($row->image) : null,
                        'created_at' => $row->created_at,
                    ];
                });
            $places = $places->concat($rooms);
        }

        // Globally sort newest first and compute available types
        $places = $places
            ->sortByDesc(function ($p) { return $p['created_at'] ?? null; })
            ->values();

        $types = $places->pluck('place_type')->unique()->values();

        return Inertia::render('admin/places/index', [
            'places' => $places->map(function ($p) { unset($p['created_at']); return $p; }),
            'types' => $types,
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
        if ($request->hasFile('image')) {
            $imagePath = 'storage/'.$request->file('image')->store('places', 'public');
        }

        // Some SQLite tables may not have AUTOINCREMENT configured for id.
        // To avoid NOT NULL constraint errors, explicitly assign the next id when needed.
        $nextId = (int) (DB::table($table)->max('id') ?? 0) + 1;

        DB::table($table)->insert([
            'id' => $nextId,
            'name' => $data['name'],
            'state' => (int) ((string)$data['state'] === '1' || $data['state'] === 1 || $data['state'] === true),
            'image' => $imagePath,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

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

        $update = [
            'name' => $data['name'],
            'state' => (int) ((string)$data['state'] === '1' || $data['state'] === 1 || $data['state'] === true),
            'updated_at' => now(),
        ];

        if ($request->hasFile('image')) {
            $update['image'] = 'storage/'.$request->file('image')->store('places', 'public');
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
}
