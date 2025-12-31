<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
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

        $coursesDir = public_path('/storage/img/courses');
        if (!file_exists($coursesDir)) {
            mkdir($coursesDir, 0755, true);
        }

        if ($request->hasFile('badge1')) {
            $file = $request->file('badge1');
            $filename = time() . '_badge1_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move($coursesDir, $filename);
            $data['badge1'] = $filename;
        }

        if ($request->hasFile('badge2')) {
            $file = $request->file('badge2');
            $filename = time() . '_badge2_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move($coursesDir, $filename);
            $data['badge2'] = $filename;
        }

        if ($request->hasFile('badge3')) {
            $file = $request->file('badge3');
            $filename = time() . '_badge3_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move($coursesDir, $filename);
            $data['badge3'] = $filename;
        }

        Course::create($data);

        return redirect()->back()->with('success', 'Course created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        //
    }
}
