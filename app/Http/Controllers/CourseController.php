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
