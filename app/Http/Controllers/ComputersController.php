<?php

namespace App\Http\Controllers;

use App\Models\Computer;
use App\Models\ComputerHistory;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ComputersController extends Controller
{
    /**
     * Store a newly created computer in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reference' => 'required|string|max:255',
            'cpu' => 'required|string|max:255',
            'gpu' => 'required|string|max:255',
            'state' => ['required', Rule::in(['working', 'not_working', 'damaged'])],
            'mark' => ['required', 'string', 'max:255'],
        ]);

        $computer = Computer::create([
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
            'cpu' => 'required|string|max:255',
            'gpu' => 'required|string|max:255',
            'state' => ['required', Rule::in(['working', 'not_working', 'damaged'])],
            'mark' => ['nullable', 'string', 'max:255'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $oldUserId = $computer->user_id;
        $newUserId = $request->input('user_id') ?: null;
        $validated['user_id'] = $newUserId;

        // Update current assignment timestamps on Computer and write to history table
        if ($oldUserId && ! $newUserId) {
            // Dissociate: close active history
            $validated['end'] = now();
            ComputerHistory::where('computer_id', $computer->id)
                ->where('user_id', $oldUserId)
                ->whereNull('end')
                ->update(['end' => now()]);
        }

        if ($oldUserId && $newUserId && $oldUserId !== $newUserId) {
            // Reassign: close previous and start new
            $validated['end'] = now();
            ComputerHistory::where('computer_id', $computer->id)
                ->where('user_id', $oldUserId)
                ->whereNull('end')
                ->update(['end' => now()]);

            $startAt = now();
            $validated['start'] = $startAt;
            ComputerHistory::create([
                'computer_id' => $computer->id,
                'user_id' => $newUserId,
                'start' => $startAt,
                'end' => null,
            ]);
        }

        if (! $oldUserId && $newUserId) {
            // First assign: open a new history row
            $startAt = now();
            $validated['start'] = $startAt;
            ComputerHistory::create([
                'computer_id' => $computer->id,
                'user_id' => $newUserId,
                'start' => $startAt,
                'end' => null,
            ]);
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

        $pdf = Pdf::loadView('pdf.computer_start', $data);

        return $pdf->download("$name Start.pdf");
    }

    public function destroy(Computer $computer)
    {
        $computer->delete();

        return redirect()->route('admin.computers');
        // ->with('success', 'Computer deleted');
    }
}
