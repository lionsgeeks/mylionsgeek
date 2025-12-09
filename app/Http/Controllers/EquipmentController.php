<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\EquipmentType;
use App\Models\Reservation;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ExportService;

class EquipmentController extends Controller
{
    public function index()
    {
        $query = Equipment::query();
        $hasImages = Schema::hasTable('images');
        if ($hasImages) {
            $query->with('image');
        }

        // Eager load type
        $query->with('equipmentType');

        $equipment = $query->orderByDesc('created_at')->get()->map(function ($e) {
            // Normalize image to storage/img/equipment/{filename}
            $img = $e->image ?? '';
            if ($img) {
                $isAbsolute = str_starts_with($img, 'http://') || str_starts_with($img, 'https://');
                $alreadyPublic = str_starts_with($img, 'storage/img/');
                if (!$isAbsolute && !$alreadyPublic) {
                    $stripped = ltrim($img, '/');
                    if (str_starts_with($stripped, 'storage/')) {
                        $stripped = substr($stripped, strlen('storage/'));
                    }
                    $basename = basename($stripped);
                    $img = 'storage/img/equipment/'.$basename;
                }
                $img = asset($img);
            } else {
                $img = null;
            }
            return [
                'id' => $e->id,
                'reference' => $e->reference,
                'mark' => $e->mark,
                'state' => (bool) $e->state,
                'equipment_type' => optional($e->equipmentType)->name ?? 'other',
                'image' => $img,
            ];
        });

        $types = EquipmentType::query()->orderBy('name')->pluck('name')->values();

        return Inertia::render('admin/equipment/index', [
            'equipment' => $equipment,
            'types' => $types,
        ]);
    }

    public function store(Request $request)
    {
        try {
            // Clean and validate the request data
            $rules = [
                'mark' => 'required|string|max:255',
                'reference' => 'required|string|max:255',
                'equipment_type' => 'required|string|max:255',
                'other_type' => 'nullable|string|max:255|required_if:equipment_type,other',
                'state' => 'required|in:0,1,true,false',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
            ];

            $validated = $request->validate($rules);

            // Generate ID manually because current DB schema has non-AI id
            $nextId = (int) (DB::table('equipment')->max('id') ?? 0) + 1;

            // Handle image upload
            $imagePath = '';
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('img/equipment', 'public');
                $imagePath = 'storage/'.$path;
            }

            // Resolve or create equipment type
            $typeName = $validated['equipment_type'] === 'other' && !empty($validated['other_type'])
                ? strtolower(trim($validated['other_type']))
                : strtolower(trim($validated['equipment_type']));

            $type = EquipmentType::firstOrCreate(['name' => $typeName]);

            // Convert state to boolean
            $state = in_array($validated['state'], [1, '1', 'true', true], true);

            // Create equipment
            $equipment = Equipment::create([
                'id' => $nextId,
                'mark' => trim($validated['mark']),
                'reference' => trim($validated['reference']),
                'equipment_type_id' => $type->id,
                'state' => $state,
                'image' => $imagePath,
            ]);

            return redirect()->back()->with('success', 'Equipment added successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'An error occurred while adding the equipment')
                ->withInput();
        }
    }

    public function update(Request $request, Equipment $equipment)
    {
        // Simple validation
        $request->validate([
            'mark' => 'required|string|max:255',
            'reference' => 'required|string|max:255',
            'equipment_type' => 'required|string|max:255',
            'other_type' => 'nullable|string|max:255',
            'state' => 'required',
            'image' => 'nullable|image|max:4096',
        ]);

        // Handle image upload
        $imagePath = $equipment->image;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('img/equipment', 'public');
            $imagePath = 'storage/'.$path;
        }

        // Handle equipment type
        $typeName = $request->equipment_type === 'other' && $request->other_type
            ? strtolower(trim($request->other_type))
            : strtolower(trim($request->equipment_type));

        $type = EquipmentType::firstOrCreate(['name' => $typeName]);

        // Convert state to boolean
        $state = $request->state == 1 || $request->state === '1' || $request->state === 'true';

        // Update equipment
        $equipment->update([
            'mark' => $request->mark,
            'reference' => $request->reference,
            'equipment_type_id' => $type->id,
            'state' => $state,
            'image' => $imagePath,
        ]);

        return back()->with('success', 'Equipment updated successfully');
    }

    public function destroy(Equipment $equipment)
    {
        $equipment->delete();
        return back()->with('success', 'Equipment deleted');
    }

    /**
     * Return reservation history for an equipment (JSON).
     */
    public function history(Equipment $equipment)
    {
        // Join pivot and reservations to collect history with user names
        $rows = DB::table('reservation_equipment as re')
            ->join('reservations as r', 'r.id', '=', 're.reservation_id')
            ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
            ->where('re.equipment_id', $equipment->id)
            ->select(
                'r.id as reservation_id',
                'u.name as user_name',
                're.day as day',
                're.start as start',
                're.end as end',
                'r.approved',
                'r.canceled',
                'r.passed',
                're.created_at as attached_at'
            )
            ->orderByDesc(DB::raw("COALESCE(re.day, r.day)"))
            ->orderByDesc('re.start')
            ->limit(200)
            ->get();

        $history = $rows->map(function ($row) {
            return [
                'reservation_id' => $row->reservation_id,
                'user_name' => $row->user_name,
                'day' => $row->day,
                'start' => $row->start,
                'end' => $row->end,
                'approved' => (bool) ($row->approved ?? false),
                'canceled' => (bool) ($row->canceled ?? false),
                'passed' => (bool) ($row->passed ?? false),
                'attached_at' => $row->attached_at,
            ];
        });

        return response()->json([
            'equipment' => [
                'id' => $equipment->id,
                'reference' => $equipment->reference,
                'mark' => $equipment->mark,
            ],
            'history' => $history,
        ]);
    }

    /**
     * Return usage activities for an equipment from activity_log (JSON).
     * Expected by frontend at GET /admin/equipements/{id}/usage-activities
     */
    public function usageActivities(Equipment $equipment)
    {
        // Default empty list if activity_log missing
        if (!\Illuminate\Support\Facades\Schema::hasTable('activity_log')) {
            return response()->json(['usage_activities' => []]);
        }

        $rows = \Illuminate\Support\Facades\DB::table('activity_log as al')
            ->leftJoin('users as u', 'u.id', '=', 'al.causer_id')
            ->where('al.log_name', 'equipment')
            ->where('al.description', 'equipment history')
            ->where('al.subject_type', 'App\\Models\\Equipment')
            ->where('al.subject_id', $equipment->id)
            ->orderByDesc('al.created_at')
            ->limit(500)
            ->get();

        $activities = $rows->map(function ($row) {
            $props = json_decode($row->properties ?? '{}', true);
            $start = isset($props['start']) ? $props['start'] : null;
            $end = isset($props['end']) ? $props['end'] : null;
            return [
                'id' => $row->id,
                'action' => $row->event, // approved | verified_end
                'description' => $row->description,
                'user_name' => $row->name ?? null,
                'started_at' => $start,
                'ended_at' => $end,
                'created_at' => $row->created_at,
            ];
        });

        return response()->json(['usage_activities' => $activities]);
    }

    /**
     * Placeholder endpoint for equipment notes list.
     * Returns empty until notes feature is implemented for equipment.
     */
    public function notes(Equipment $equipment)
    {
        return response()->json(['notes' => []]);
    }

    public function export(Request $request)
    {
        $requestedFields = array_filter(array_map('trim', explode(',', (string) $request->query('fields', 'reference,mark,equipment_type,state'))));

        $query = Equipment::query()
            ->leftJoin('equipment_types as et', 'et.id', '=', 'equipment.equipment_type_id')
            ->select('equipment.*', 'et.name as equipment_type')
            ->orderByDesc('equipment.created_at');

        // Apply filters if provided
        if ($request->filled('state')) {
            $stateFilter = $request->query('state');
            if ($stateFilter === 'working' || $stateFilter === '1') {
                $query->where('equipment.state', 1);
            } elseif ($stateFilter === 'not_working' || $stateFilter === '0') {
                $query->where('equipment.state', 0);
            }
        }

        if ($request->filled('type')) {
            $query->where('et.name', $request->query('type'));
        }

        if ($request->filled('search')) {
            $searchTerm = strtolower($request->query('search'));
            $query->where(function ($q) use ($searchTerm) {
                $q->whereRaw('LOWER(equipment.reference) LIKE ?', ['%' . $searchTerm . '%'])
                  ->orWhereRaw('LOWER(equipment.mark) LIKE ?', ['%' . $searchTerm . '%'])
                  ->orWhereRaw('LOWER(et.name) LIKE ?', ['%' . $searchTerm . '%']);
            });
        }

        $fieldMap = [
            'id' => 'id',
            'reference' => 'reference',
            'mark' => 'mark',
            'equipment_type' => 'equipment_type',
            'state' => 'state',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ];

        return ExportService::export($query, $requestedFields, [
            'fieldMap' => $fieldMap,
            'defaultFields' => ['reference', 'mark', 'equipment_type', 'state'],
            'relationships' => ['equipmentType'],
            'filename' => 'equipment_export_' . now()->format('Y_m_d_H_i_s'),
            'transformers' => [
                'equipment_type' => function($row) {
                    return $row->equipment_type ?? 'other';
                },
                'state' => function($row) {
                    return (isset($row->state) && $row->state) ? 'Working' : 'Not Working';
                },
                'created_at' => function($row) {
                    return isset($row->created_at) ? date('Y-m-d H:i:s', strtotime($row->created_at)) : '';
                },
                'updated_at' => function($row) {
                    return isset($row->updated_at) ? date('Y-m-d H:i:s', strtotime($row->updated_at)) : '';
                },
            ],
        ]);
    }
}


