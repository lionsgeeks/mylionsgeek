<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ReservationsController;

// =====================
// USER-FACING RESERVATIONS PAGES (PUBLIC, NO MIDDLEWARE)
// These render the SPA pages. Data actions remain protected below.
// =====================


// =====================
// USER ACTION ENDPOINTS (PROTECTED)
// =====================
Route::middleware(['auth'])->group(function () {
    Route::get('/student/reservations', [\App\Http\Controllers\ReservationsController::class, 'myReservations'])->name('student.reservations');
    Route::post('/reservations/{reservation}/cancel', [\App\Http\Controllers\ReservationsController::class, 'cancelOwn'])->name('user.reservations.cancel');
    Route::put('/reservations/{reservation}/update', [ReservationsController::class, 'update'])->name('reservations.update');
    Route::get('/student/reservations/{reservation}/details', [ReservationsController::class, 'show'])->name('student.reservations.details');
});
// =====================
// USER READ-ONLY DETAILS (PROTECTED)
// =====================

// Route::middleware(['auth', 'verified'])->get('/reservations/{reservation}', [\App\Http\Controllers\ReservationsController::class, 'userDetails'])->name('reservations.details');

// =====================
// ADMIN RESERVATIONS (PROTECTED)
// =====================
Route::middleware(['auth', 'verified', 'role:admin,super_admin,moderateur,studio_responsable'])->prefix('admin')->group(function () {
    Route::get('/reservations', [ReservationsController::class, 'index'])->name('admin.reservations');
    Route::get('/reservations/analytics', [ReservationsController::class, 'analytics'])->name('admin.reservations.analytics');
    Route::post('/reservations/{reservation}/approve', [ReservationsController::class, 'approve'])
        ->name('admin.reservations.approve');
    Route::post('/reservations/{reservation}/cancel', [ReservationsController::class, 'cancel'])
        ->name('admin.reservations.cancel');
    Route::get('/reservations/{reservation}/info', [ReservationsController::class, 'info'])
        ->name('admin.reservations.info');

    Route::get('/reservations/{reservation}/pdf', [ReservationsController::class, 'generatePdf'])
        ->name('admin.reservations.pdf');
    Route::post('/reservations/{reservation}/propose', [ReservationsController::class, 'proposeNewTime'])
        ->name('admin.reservations.propose');
    Route::get('/places/{type}/{id}/reservations', [ReservationsController::class, 'byPlace'])
        ->name('admin.places.reservations');

    // Store reservation with teams & equipment
    
    // Access request management
    Route::post('/access-requests/{notification}/approve', [ReservationsController::class, 'approveAccessRequest'])
        ->name('admin.access-requests.approve');
    Route::post('/access-requests/{notification}/deny', [ReservationsController::class, 'denyAccessRequest'])
        ->name('admin.access-requests.deny');
});
Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::post('/reservations/store', [ReservationsController::class, 'store'])
        ->name('admin.reservations.store');
    Route::put('/reservations/{reservation}/update', [ReservationsController::class, 'update'])
        ->name('admin.reservations.update');
    Route::get('/reservations/{reservation}/details', [ReservationsController::class, 'show'])->name('admin.reservations.details');

    // Appointments routes
    Route::get('/appointments', [ReservationsController::class, 'appointmentsIndex'])->name('admin.appointments');
    Route::post('/appointments/{appointment}/approve', [ReservationsController::class, 'approveAppointmentById'])->name('admin.appointments.approve');
    Route::post('/appointments/{appointment}/cancel', [ReservationsController::class, 'cancelAppointmentById'])->name('admin.appointments.cancel');
    Route::post('/appointments/{appointment}/suggest-time', [ReservationsController::class, 'suggestAppointmentTime'])->name('admin.appointments.suggest-time');

    // Get users for team member selector
    Route::get('/api/users', [ReservationsController::class, 'getUsers'])
        ->name('admin.api.users');

    // Get equipment for equipment selector
    Route::get('/api/equipment', [ReservationsController::class, 'getEquipment'])
        ->name('admin.api.equipment');

    // Store reservation cowork
    Route::post('/reservations/storeReservationCowork', [ReservationsController::class, 'storeReservationCowork'])
        ->name('admin.reservations.storeReservationCowork');

    // Cancel cowork reservation
    Route::post('/reservations/cowork/{reservation}/cancel', [ReservationsController::class, 'cancelCowork'])
        ->name('admin.reservations.cowork.cancel');

    Route::post('/reservations/storeReservationMeetingRoom', [ReservationsController::class, 'storeReservationMeetingRoom'])
        ->name('admin.reservations.storeReservationMeetingRoom');

    Route::post('/reservations/meeting-room/{id}/cancel', [ReservationsController::class, 'cancelMeetingRoom'])
        ->name('admin.reservations.meetingRoom.cancel');
});



// =====================
// VERIFICATION ROUTES (ADMIN & STUDIO_RESPONSABLE ONLY)
// =====================
Route::middleware(['auth', 'verified', 'role:admin,super_admin,moderateur,studio_responsable'])->group(function () {
    Route::get('/reservations/{reservation}/verify-end', [ReservationsController::class, 'verifyEnd'])
        ->name('reservations.verify-end');
    Route::post('/reservations/{reservation}/verify-end', [ReservationsController::class, 'submitVerification'])
        ->name('reservations.submit-verification');
    Route::get('/reservations/{reservation}/download-report', [ReservationsController::class, 'downloadReport'])
        ->name('reservations.download-report');
});

// =====================
// PUBLIC VERIFICATION / PROPOSAL / CALENDAR FEEDS (NO AUTH)
// =====================
Route::get('/reservations/proposal/{token}/accept', [ReservationsController::class, 'acceptProposal'])
    ->name('reservations.proposal.accept');
Route::get('/reservations/proposal/{token}/cancel', [ReservationsController::class, 'cancelProposal'])
    ->name('reservations.proposal.cancel');
Route::get('/reservations/proposal/{token}/suggest', [ReservationsController::class, 'showSuggestForm'])
    ->name('reservations.proposal.suggest');
Route::post('/reservations/proposal/{token}/suggest', [ReservationsController::class, 'submitSuggestForm'])
    ->name('reservations.proposal.suggest.submit');
Route::get('/reservations/suggest/{token}/approve', [ReservationsController::class, 'approveSuggested'])
    ->name('reservations.suggest.approve');

// Public calendar feed for suggestion page
Route::get('/reservations/public-place/{type}/{id}', [ReservationsController::class, 'byPlacePublic'])
    ->name('reservations.place.public');





// Route::get('/test-pdf', function () {
//     $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.verification_report_simple', [
//         'reservation' => [
//             'id' => 1,
//             'title' => 'Test Reservation',
//             'day' => '2025-10-27',
//             'start' => '10:00',
//             'end' => '11:00',
//             'user_name' => 'Test User'
//         ],
//         'verificationData' => [
//             'equipments' => [
//                 [
//                     'id' => 1,
//                     'reference' => 'TEST-001',
//                     'mark' => 'Test Equipment',
//                     'type_name' => 'Test Type',
//                     'goodCondition' => true,
//                     'badCondition' => false,
//                     'notReturned' => false
//                 ]
//             ],
//             'notes' => 'This is a test note to verify that notes are displayed properly in the PDF report. The notes should appear in the Additional Notes section.'
//         ]
//     ])->setPaper('a4', 'portrait');

//     return $pdf->download('test_verification_report.pdf');
// });
