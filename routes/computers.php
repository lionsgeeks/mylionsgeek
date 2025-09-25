<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Computer;
use App\Models\User;

Route::middleware(['auth'])->group(function () {
    Route::get('/admin/computers', function () {
        $computers = Computer::with('user')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'mark' => $c->mark ?? null,
                'reference' => $c->reference,
                'cpu' => $c->cpu ?? $c->serial_number ?? null,
                'gpu' => $c->gpu ?? $c->CpuGpu,
                'isBroken' => $c->computer_state !== 'working',
                'isActive' => !$c->is_available && !is_null($c->user_id),
                'assignedUserId' => $c->user_id,
                'contractStart' => optional($c->start_date)->toDateString(),
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
});


