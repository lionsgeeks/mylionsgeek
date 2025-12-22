<?php

namespace App\Http\Controllers;

use App\Models\Models;
use Illuminate\Http\Request;

class ModelsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'badge1' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'badge2' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'badge3' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
        ]);

        $data = [
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ];

        // Ensure directory exists
        $modelsDir = public_path('/storage/img/models');
        if (!file_exists($modelsDir)) {
            mkdir($modelsDir, 0755, true);
        }

        // Handle badge1 upload
        if ($request->hasFile('badge1')) {
            $file = $request->file('badge1');
            $filename = time() . '_badge1_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move($modelsDir, $filename);
            $data['badge1'] = $filename;
        }

        // Handle badge2 upload
        if ($request->hasFile('badge2')) {
            $file = $request->file('badge2');
            $filename = time() . '_badge2_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move($modelsDir, $filename);
            $data['badge2'] = $filename;
        }

        // Handle badge3 upload
        if ($request->hasFile('badge3')) {
            $file = $request->file('badge3');
            $filename = time() . '_badge3_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move($modelsDir, $filename);
            $data['badge3'] = $filename;
        }

        Models::create($data);

        return redirect()->back()->with('success', 'Model created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Models $models)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Models $models)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Models $models)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Models $models)
    {
        //
    }
}
