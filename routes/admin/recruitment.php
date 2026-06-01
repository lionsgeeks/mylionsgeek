<?php

use App\Http\Controllers\Admin\JobPostingController;
use App\Http\Controllers\Admin\OrganisationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin,super_admin,moderateur'])->prefix('admin')->group(function () {
    Route::get('/jobs', [JobPostingController::class, 'index'])->name('admin.jobs.index');
    Route::get('/jobs/create', [JobPostingController::class, 'create'])->name('admin.jobs.create');
    Route::post('/jobs', [JobPostingController::class, 'store'])->name('admin.jobs.store');
    Route::put('/jobs/{job}', [JobPostingController::class, 'update'])->name('admin.jobs.update');

    Route::get('/organisations', [OrganisationController::class, 'index'])->name('admin.organisations.index');
    Route::get('/organisations/{organization}', [OrganisationController::class, 'show'])->name('admin.organisations.show');
    Route::post('/organisations', [OrganisationController::class, 'store'])->name('admin.organisations.store');
    Route::put('/organisations/{organization}/account-state', [OrganisationController::class, 'updateAccountState'])
        ->name('admin.organisations.account-state');

    Route::redirect('/recruiters', '/admin/organisations');
});
