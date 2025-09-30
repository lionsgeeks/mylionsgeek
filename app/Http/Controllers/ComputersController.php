<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Computer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ComputersController extends Controller
{
    /**
     * Store a newly created computer in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reference' => 'required|string|max:255',
            'cpu'       => 'required|string|max:255',
            'gpu'       => 'required|string|max:255',
            'state'     => ['required', Rule::in(['working', 'not_working', 'damaged'])],
            'mark'      => ['required', 'string', 'max:255'],
        ]);



        $computer = Computer::create([
            'id' => (string) Str::uuid(),
            'reference'=>$validated['reference'],
            'cpu'=>$validated['cpu'],
            'gpu'=>$validated['gpu'],
            'state'=>$validated['state'],
            'mark'=>$validated['mark'],
        ]);

        return redirect()->route('admin.computers')
            ->with('success', 'Computer added successfully');
    }

    /**
     * Update the specified computer in storage.
     */
    public function update(Request $request, $computer)
    {
        $computer = Computer::where('id', $computer)->firstOrFail();

        $validated = $request->validate([
            'reference' => 'required|string|max:255',
            'cpu'       => 'required|string|max:255',
            'gpu'       => 'required|string|max:255',
            'state'     => ['required', Rule::in(['working', 'not_working', 'damaged'])],
            'mark'      => ['nullable', 'string', 'max:255'],
            'user_id'   => ['nullable', 'integer', 'exists:users,id'],
            'start'     => ['nullable', 'date'],
            'end'       => ['nullable', 'date'],
        ]);

        $computer->update($validated);
        
        // Debug: Log the updated computer
        Log::info('Updated computer:', [
            'id' => $computer->id,
            'user_id' => $computer->user_id,
            'validated_data' => $validated
        ]);
        
        return redirect()->route('admin.computers')
            ->with('success', 'Computer updated successfully');
    }
}
