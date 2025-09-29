<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\EquipmentType;
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

        // Eager load type
        $query->with('equipmentType');

        $equipment = $query->orderByDesc('created_at')->get()->map(function ($e) {
            return [
                'id' => $e->id,
                'reference' => $e->reference,
                'mark' => $e->mark,
                'state' => (bool) $e->state,
                'equipment_type' => optional($e->equipmentType)->name ?? 'other',
                'image' => $e->image ? asset($e->image) : null, // Convert path to full URL
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
        $validated = $request->validate([
            'mark' => ['required', 'string', 'max:255'],
            'reference' => ['required', 'string', 'max:255'],
            'equipment_type' => ['required', 'string', 'max:255'],
            'other_type' => ['nullable', 'string', 'max:255', 'required_if:equipment_type,other'],
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

        // Resolve or create type
        $typeName = $validated['equipment_type'] === 'other' && !empty($validated['other_type'])
            ? strtolower(trim($validated['other_type']))
            : strtolower(trim($validated['equipment_type']));

        $type = EquipmentType::firstOrCreate(['name' => $typeName]);

        $equipment = Equipment::create([
            'id' => $nextId,
            'mark' => $validated['mark'],
            'reference' => $validated['reference'],
            'equipment_type_id' => $type->id,
            'state' => (string)$validated['state'] === '1' || $validated['state'] === 1 || $validated['state'] === true,
            'image' => $imagePath, // Store the image path directly in the equipment table
        ]);

        return back()->with('success', 'Equipment added');
    }

    public function update(Request $request, Equipment $equipment)
    {
        $validated = $request->validate([
            'mark' => ['required', 'string', 'max:255'],
            'reference' => ['required', 'string', 'max:255'],
            'equipment_type' => ['required', 'string', 'max:255'],
            'other_type' => ['nullable', 'string', 'max:255', 'required_if:equipment_type,other'],
            'state' => ['required', 'boolean'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        // Handle image upload
        $imagePath = $equipment->image; // Keep existing image by default
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('equipment', 'public');
            $imagePath = 'storage/'.$path; // Remove leading slash for proper URL
        }

        // Resolve or create type
        $typeName = $validated['equipment_type'] === 'other' && !empty($validated['other_type'])
            ? strtolower(trim($validated['other_type']))
            : strtolower(trim($validated['equipment_type']));

        $type = EquipmentType::firstOrCreate(['name' => $typeName]);

        $equipment->update([
            'mark' => $validated['mark'],
            'reference' => $validated['reference'],
            'equipment_type_id' => $type->id,
            'state' => (string)$validated['state'] === '1' || $validated['state'] === 1 || $validated['state'] === true,
            'image' => $imagePath,
        ]);

        return back()->with('success', 'Equipment updated');
    }

    public function destroy(Equipment $equipment)
    {
        $equipment->delete();
        return back()->with('success', 'Equipment deleted');
    }
}


