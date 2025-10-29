<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\EquipmentType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EquipmentTypeController extends Controller
{
    public function index()
    {
        // Get all equipment types with equipment count, excluding "other"
        $types = EquipmentType::withCount('equipment')
            ->where('name', '!=', 'other') // Hide "other" type from management
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'equipment_count' => $type->equipment_count,
                    'can_delete' => true,
                ];
            });

        return response()->json($types);
    }

    public function store(Request $request)
    {
        $name = strtolower(trim($request->name));

        // Prevent creating "other" type manually
        if ($name === 'other') {
            return back()->withErrors(['name' => 'The "other" type is reserved for the system.']);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:equipment_types,name',
        ]);

        $type = EquipmentType::create([
            'name' => $name,
        ]);

        return back()->with('success', 'Equipment type created successfully');
    }

    public function update(Request $request, EquipmentType $equipmentType)
    {
        $name = strtolower(trim($request->name));

        // Prevent updating to "other" type
        if ($name === 'other') {
            return back()->withErrors(['name' => 'The "other" type is reserved for the system.']);
        }

        // Prevent updating the "other" type itself
        if ($equipmentType->name === 'other') {
            return back()->with('error', 'The "other" type cannot be modified as it is required for the system.');
        }

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('equipment_types', 'name')->ignore($equipmentType->id),
            ],
        ]);

        $equipmentType->update([
            'name' => $name,
        ]);

        return back()->with('success', 'Equipment type updated successfully');
    }

    public function destroy(EquipmentType $equipmentType)
    {
        // Protect the "other" type from deletion
        if ($equipmentType->name === 'other') {
            return back()->with('error', 'The "other" type cannot be deleted as it is required for the system.');
        }

        // Get the "other" type as fallback
        $otherType = EquipmentType::firstOrCreate(['name' => 'other']);

        // If deleting a type that has equipment, reassign them to "other"
        $equipmentCount = $equipmentType->equipment()->count();
        if ($equipmentCount > 0) {
            $equipmentType->equipment()->update(['equipment_type_id' => $otherType->id]);
        }

        // Delete the type
        $equipmentType->delete();

        return back()->with('success', 'Equipment type deleted successfully');
    }
}
