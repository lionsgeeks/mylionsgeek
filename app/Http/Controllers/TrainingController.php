<?php

namespace App\Http\Controllers;

use App\Models\Training;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrainingController extends Controller
{
    public function index()
    {
        $trainings = Training::with('coach')->latest()->get();
        $coaches = User::where('role', 'coach')->get(); 

        return Inertia::render('admin/training/index', [
            'trainings' => $trainings,
            'coaches' => $coaches,
        ]);
    }

    public function store(Request $request)
    {
        // Validate request
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'starting_day' => 'required|date',
            'coach_id' => 'required|exists:users,id',
            'promo' => 'nullable|string|max:50',
        ]);

        // Create training
        Training::create($data);

        // Redirect back to index with success message
        return redirect()->route('training.index')
                         ->with('success', 'Training added successfully!');
    }
}
