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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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

    // Update current assignment timestamps using activity_log (log_name=computer)
    if (Schema::hasTable('activity_log')) {
        // Dissociate: close active assignment for old user
        if ($oldUserId && !$newUserId) {
            $validated['end'] = now();
            try {
                $openRow = DB::table('activity_log')
                    ->where('log_name', 'computer')
                    ->where('subject_type', 'App\\Models\\Computer')
                    ->where('subject_id', $computer->id)
                    ->where('causer_type', 'App\\Models\\User')
                    ->where('causer_id', $oldUserId)
                    ->where('event', 'assigned')
                    ->orderByDesc('id')
                    ->first();

                if ($openRow) {
                    $props = json_decode($openRow->properties ?: '{}', true);
                    $props = is_array($props) ? $props : [];
                    $props['start'] = $props['start'] ?? now()->toDateString();
                    $props['end'] = now()->toDateString();
                    DB::table('activity_log')->where('id', $openRow->id)->update([
                        'properties' => json_encode($props),
                        'updated_at' => now()->toDateTimeString(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('Failed to close computer assignment activity: ' . $e->getMessage());
            }
        }

        // Reassign: close previous for old user, open new for new user
        if ($oldUserId && $newUserId && $oldUserId !== $newUserId) {
            $validated['end'] = now();
            try {
                $openRow = DB::table('activity_log')
                    ->where('log_name', 'computer')
                    ->where('subject_type', 'App\\Models\\Computer')
                    ->where('subject_id', $computer->id)
                    ->where('causer_type', 'App\\Models\\User')
                    ->where('causer_id', $oldUserId)
                    ->where('event', 'assigned')
                    ->orderByDesc('id')
                    ->first();
                if ($openRow) {
                    $props = json_decode($openRow->properties ?: '{}', true);
                    $props = is_array($props) ? $props : [];
                    $props['start'] = $props['start'] ?? now()->toDateString();
                    $props['end'] = now()->toDateString();
                    DB::table('activity_log')->where('id', $openRow->id)->update([
                        'properties' => json_encode($props),
                        'updated_at' => now()->toDateTimeString(),
                    ]);
                }

                DB::table('activity_log')->insert([
                    'log_name' => 'computer',
                    'description' => 'computer history',
                    'subject_type' => 'App\\Models\\Computer',
                    'subject_id' => $computer->id,
                    'event' => 'assigned',
                    'causer_type' => 'App\\Models\\User',
                    'causer_id' => $newUserId,
                    'properties' => json_encode([
                        'start' => now()->toDateString(),
                        'end' => '',
                    ]),
                    'created_at' => now()->toDateTimeString(),
                    'updated_at' => now()->toDateTimeString(),
                ]);
            } catch (\Throwable $e) {
                Log::error('Failed to reassign computer activity: ' . $e->getMessage());
            }
        }

        // First assign: open new assignment row
        if (!$oldUserId && $newUserId) {
            $startAt = now();
            $validated['start'] = $startAt;
            try {
                DB::table('activity_log')->insert([
                    'log_name' => 'computer',
                    'description' => 'computer history',
                    'subject_type' => 'App\\Models\\Computer',
                    'subject_id' => $computer->id,
                    'event' => 'assigned',
                    'causer_type' => 'App\\Models\\User',
                    'causer_id' => $newUserId,
                    'properties' => json_encode([
                        'start' => $startAt->toDateString(),
                        'end' => '',
                    ]),
                    'created_at' => now()->toDateTimeString(),
                    'updated_at' => now()->toDateTimeString(),
                ]);
            } catch (\Throwable $e) {
                Log::error('Failed to assign computer activity: ' . $e->getMessage());
            }
        }
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
