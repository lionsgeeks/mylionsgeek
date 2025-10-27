<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservationsController;

Route::middleware(['auth','verified','role:admin,super_admin,moderateur'])->prefix('admin')->group(function () {
    Route::get('/reservations', [ReservationsController::class, 'index'])->name('admin.reservations');
    Route::post('/reservations/{reservation}/approve', [ReservationsController::class, 'approve'])
        ->name('admin.reservations.approve');
    Route::post('/reservations/{reservation}/cancel', [ReservationsController::class, 'cancel'])
        ->name('admin.reservations.cancel');
    Route::get('/reservations/{reservation}/info', [ReservationsController::class, 'info'])
        ->name('admin.reservations.info');
    Route::get('/reservations/{reservation}/details', [ReservationsController::class, 'details'])
        ->name('admin.reservations.details');
    Route::get('/reservations/{reservation}/pdf', [ReservationsController::class, 'generatePdf'])
        ->name('admin.reservations.pdf');
    Route::get('/places/{type}/{id}/reservations', [ReservationsController::class, 'byPlace'])
        ->name('admin.places.reservations');

    // Store reservation with teams & equipment
    Route::post('/reservations/store', [ReservationsController::class, 'store'])
        ->name('admin.reservations.store');

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

});

// Public route for material verification (no auth required for email links)
Route::get('/reservations/{reservation}/verify-end', [ReservationsController::class, 'verifyEnd'])
    ->name('reservations.verify-end');
Route::post('/reservations/{reservation}/verify-end', [ReservationsController::class, 'submitVerification'])
    ->name('reservations.submit-verification');
Route::get('/reservations/{reservation}/download-report', [ReservationsController::class, 'downloadReport'])
    ->name('reservations.download-report');

// Test PDF route
Route::get('/test-pdf', function() {
    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.verification_report_simple', [
        'reservation' => [
            'id' => 1,
            'title' => 'Test Reservation',
            'day' => '2025-10-27',
            'start' => '10:00',
            'end' => '11:00',
            'user_name' => 'Test User'
        ],
        'verificationData' => [
            'equipments' => [
                [
                    'id' => 1,
                    'reference' => 'TEST-001',
                    'mark' => 'Test Equipment',
                    'type_name' => 'Test Type',
                    'goodCondition' => true,
                    'badCondition' => false,
                    'notReturned' => false
                ]
            ],
            'notes' => 'This is a test note to verify that notes are displayed properly in the PDF report. The notes should appear in the Additional Notes section.'
        ]
    ])->setPaper('a4', 'portrait');
    
    return $pdf->download('test_verification_report.pdf');
});



