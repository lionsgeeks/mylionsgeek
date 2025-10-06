<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Computer;
use App\Models\User;
use App\Http\Controllers\ComputersController;
use Illuminate\Http\Request;
use App\Models\ComputerHistory;

Route::middleware(['auth','role:admin'])->group(function () {
    Route::get('/admin/computers', function () {
        $computers = Computer::with('user')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'mark' => $c->mark,
                'reference' => $c->reference,
                'cpu' => $c->cpu,
                'gpu' => $c->gpu,
                'isBroken' => $c->state !== 'working',
                'assignedUserId' => $c->user_id,
                'contractStart' => optional($c->start)->toDateString(),
                'contractEnd' => optional($c->end)->toDateString(),
            ];
        });

        $users = User::select('id', 'name', 'email')->get();

        return Inertia::render('admin/computers/index', [
            'computers' => $computers,
            'users' => $users,
        ]);
    })->name('admin.computers');

    Route::get('/admin/computers/{id}', function (string $id) {
        $computer = Computer::with('user')->findOrFail($id);
        return Inertia::render('admin/computers/[id]', [
            'computer' => $computer,
        ]);
    })->name('admin.computers.show');

    // Create new computer
    Route::post('/admin/computers', [ComputersController::class, 'store'])
        ->name('admin.computers.store');

    // Update existing computer
    Route::put('/admin/computers/{computer}', [ComputersController::class, 'update'])
        ->name('admin.computers.update');
    
    Route::get('/admin/computers/{computer}/contract', [ComputersController::class, 'computerStartContract'])
    ->name('computers.contract');
    Route::delete('/admin/computers/{computer}', [ComputersController::class, 'destroy'])->name('admin.computers.destroy');

    // History endpoint for modal
    Route::get('/admin/computers/{computer}/history', function (Request $request, Computer $computer) {
        $history = ComputerHistory::with('user:id,name,email')
            ->where('computer_id', $computer->id)
            ->orderByDesc('start')
            ->get()
            ->map(function ($h) {
                return [
                    'id' => $h->id,
                    'user' => $h->user ? [
                        'id' => $h->user->id,
                        'name' => $h->user->name,
                        'email' => $h->user->email,
                    ] : null,
                    'start' => optional($h->start)->toDateTimeString(),
                    'end' => optional($h->end)->toDateTimeString(),
                ];
            });

        return response()->json(['history' => $history]);
    })->name('admin.computers.history');

});


