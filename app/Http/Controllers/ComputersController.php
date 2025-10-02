<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Computer;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
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
            'reference' => $validated['reference'],
            'cpu' => $validated['cpu'],
            'gpu' => $validated['gpu'],
            'state' => $validated['state'],
            'mark' => $validated['mark'],
        ]);

        return redirect()->route('admin.computers');
            // ->with('success', 'Computer added successfully');
    }

    /**
     * Update the specified computer in storage.
     */
   public function update(Request $request, $computerId)
{
    $computer = Computer::findOrFail($computerId);

    $validated = $request->validate([
        'reference' => 'required|string|max:255',
        'cpu'       => 'required|string|max:255',
        'gpu'       => 'required|string|max:255',
        'state'     => ['required', Rule::in(['working', 'not_working', 'damaged'])],
        'mark'      => ['nullable', 'string', 'max:255'],
        'user_id'   => ['nullable', 'integer', 'exists:users,id'],
    ]);

    $oldUserId = $computer->user_id;
    $newUserId = $request->input('user_id') ?: null;
    $validated['user_id'] = $newUserId;

    if ($oldUserId && !$newUserId) {
        //Dissociate: user_id → null
        $validated['end'] = now();
    }

    if ($oldUserId && $newUserId && $oldUserId !== $newUserId) {
        //Reassign: change user
        $validated['end'] = now();            
        $validated['start'] = now()->addSecond(); 
    }

    if (!$oldUserId && $newUserId) {
        //First assign
        $validated['start'] = now();
    }

    $computer->update($validated);

    return redirect()->route('admin.computers');
        // ->with('success', 'Computer updated successfully');
}




    public function computerStartContract(Computer $computer)
    {
        $user = User::where('id', $computer->user_id)->first();
        $data = compact('user', 'computer');
        // dd($user->id);


        $name = $user->name;

        $pdf = Pdf::loadView("pdf.computer_start", $data);

        return $pdf->download("$name Start.pdf");
    }
    public function destroy(Computer $computer)
    {
        $computer->delete();
        return redirect()->route('admin.computers');
        // ->with('success', 'Computer deleted');
    }
}
