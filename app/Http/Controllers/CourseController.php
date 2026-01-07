<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'badge1' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'badge2' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'badge3' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
        ]);



        Course::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Course created successfully');
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        //
        dd('helo from update');
    }
    
    /**
     * Remove the specified resource from storage.
    */
    public function destroy($id)
    {
        //
        dd('helo from delete');
    }
}
