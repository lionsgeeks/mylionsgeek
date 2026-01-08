<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlacesController;
use App\Http\Controllers\ReservationsController;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

Route::middleware(['auth','verified','role:admin,super_admin,moderateur,studio_responsable'])->prefix('admin')->group(function () {
    Route::get('/places', [PlacesController::class, 'index'])->name('admin.places');
    Route::post('/places', [PlacesController::class, 'store'])->name('admin.places.store');
    Route::put('/places/{place}', [PlacesController::class, 'update'])->name('admin.places.update');
    Route::delete('/places/{place}', [PlacesController::class, 'destroy'])->name('admin.places.destroy');
    Route::get('/places/meeting-room/{meetingRoom}/calendar', [ReservationsController::class, 'meetingRoomCalendar'])->name('admin.places.meetingRoom.calendar');
});


// =====================
// USER-FACING SPACES (PUBLIC, NO MIDDLEWARE)
// =====================
// Route::get('/spaces', function () {
//     $studios = DB::table('studios')->select('id','name','state','image')->orderBy('name')->get()
//         ->map(function($studio) {
//             $img = $studio->image ? (
//                 str_starts_with($studio->image, 'http') || str_starts_with($studio->image, 'storage/')
//                     ? $studio->image
//                     : ('storage/img/studio/' . ltrim($studio->image, '/'))
//             ) : null;
//             return [
//                 'id' => $studio->id,
//                 'name' => $studio->name,
//                 'state' => (bool) $studio->state,
//                 'image' => $img ? asset($img) : null,
//                 'type' => 'studio'
//             ];
//         });
//     $coworks = DB::table('coworks')->select('id','table','state','image')->orderBy('table')->get()
//         ->map(function($cowork) {
//             $img = $cowork->image ? (
//                 str_starts_with($cowork->image, 'http') || str_starts_with($cowork->image, 'storage/')
//                     ? $cowork->image
//                     : ('storage/img/cowork/' . ltrim($cowork->image, '/'))
//             ) : null;
//             return [
//                 'id' => $cowork->id,
//                 'name' => 'Table '.$cowork->table,
//                 'state' => (bool) $cowork->state,
//                 'image' => $img ? asset($img) : null,
//                 'type' => 'cowork',
//             ];
//         });
//     // Render user page implementation (re-exports the same component)
//     return Inertia::render('spaces/index', [
//         'studios' => $studios,
//         'coworks' => $coworks,
//     ]);
// })->name('spaces');
Route::middleware(['auth'])->get('/students/spaces', [PlacesController::class, 'index2'])->name('student.spaces');

// =====================
// ADMIN SPACES (PROTECTED)
// =====================
