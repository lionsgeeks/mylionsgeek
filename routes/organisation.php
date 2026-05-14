<?php

use App\Http\Controllers\Organisation\OrganisationOnboardingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:recruiter'])->prefix('organisation')->group(function () {
    Route::get('/onboarding', [OrganisationOnboardingController::class, 'show'])->name('organisation.onboarding');
    Route::post('/onboarding/validate-step', [OrganisationOnboardingController::class, 'validateStep'])
        ->name('organisation.onboarding.validate');
    Route::post('/onboarding', [OrganisationOnboardingController::class, 'store'])->name('organisation.onboarding.store');
});
