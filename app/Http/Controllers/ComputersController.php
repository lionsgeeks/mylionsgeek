<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Computer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
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
        // dd($validated);



        $computer = Computer::create(array_merge(
            $validated,
            ['uuid' => (string) Str::uuid()] // assign UUID manually
        ));


        return redirect()->route('admin.computers')
            ->with('success', 'Computer added successfully');
    }

    /**
     * Update the specified computer in storage.
     */
    public function update(Request $request, $uuid)
    {
        $computer = Computer::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'reference' => 'required|string|max:255',
            'cpu'       => 'required|string|max:255',
            'gpu'       => 'required|string|max:255',
            'state'     => ['required', Rule::in(['working', 'not_working', 'damaged'])],
            'mark'      => ['nullable', 'string', 'max:255'],
            'user_id'   => ['nullable', 'integer', 'exists:users,id'],
            'start'     => ['required', 'date'],
            'end'       => ['nullable', 'date'],
        ]);

        $computer->update($validated);

        return response()->json([
            'message'  => 'Computer created successfully!',
            'computer' => $computer,
        ]);
    }
}
