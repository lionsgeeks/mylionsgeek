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
}


