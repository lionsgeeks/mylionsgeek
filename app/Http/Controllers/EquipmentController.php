<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EquipmentController extends Controller
{
    public function index()
    {
        $query = Equipment::query();
        $hasImages = Schema::hasTable('images');
        if ($hasImages) {
            $query->with('image');
        }

        // Map equipment_type_id to string
        $typeMap = [
            1 => 'camera',
            2 => 'son', 
            3 => 'lumiere',
            4 => 'data/stockage',
            5 => 'podcast',
            6 => 'other',
        ];

        $equipment = $query->orderByDesc('created_at')->get()->map(function ($e) use ($typeMap) {
            return [
                'id' => $e->id,
                'reference' => $e->reference,
                'mark' => $e->mark,
                'state' => (bool) $e->state,
                'equipment_type' => $typeMap[$e->equipment_type_id] ?? 'other',
                'image' => $e->image ? asset($e->image) : null, // Convert path to full URL
            ];
        });

        return Inertia::render('admin/equipment/index', [
            'equipment' => $equipment,
        ]);
    }

    public function store(Request $request)
    {
        // Map equipment_type string to ID
        $typeMap = [
            'camera' => 1,
            'son' => 2,
            'lumiere' => 3,
            'data/stockage' => 4,
            'podcast' => 5,
            'other' => 6,
        ];

        $validated = $request->validate([
            'mark' => ['required', 'string', 'max:255'],
            'reference' => ['required', 'string', 'max:255'],
            'equipment_type' => ['required', Rule::in(['camera','son','lumiere','data/stockage','podcast','other'])],
            'state' => ['required', 'boolean'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        // Generate ID manually because current DB schema has non-AI id
        $nextId = (int) (DB::table('equipment')->max('id') ?? 0) + 1;

        // Handle image upload
        $imagePath = '';
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('equipment', 'public');
            $imagePath = 'storage/'.$path; // Remove leading slash for proper URL
        }

        $equipment = Equipment::create([
            'id' => $nextId,
            'mark' => $validated['mark'],
            'reference' => $validated['reference'],
            'equipment_type_id' => $typeMap[$validated['equipment_type']],
            'state' => (string)$validated['state'] === '1' || $validated['state'] === 1 || $validated['state'] === true,
            'image' => $imagePath, // Store the image path directly in the equipment table
        ]);

        return back()->with('success', 'Equipment added');
    }
}


