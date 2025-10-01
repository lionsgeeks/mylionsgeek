<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Computer;
use App\Models\User;
use App\Http\Controllers\ComputersController;

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
});


