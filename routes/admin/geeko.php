<?php

use App\Http\Controllers\GeekoController;
use App\Http\Controllers\GeekoSessionController;
use App\Http\Controllers\GeekoPlayController;
use Illuminate\Support\Facades\Route;

// Admin/Coach routes for managing Geekos
Route::middleware(['auth', 'role:admin,moderateur'])->group(function () {
    // Geeko CRUD routes
    Route::get('/training/{formation}/geeko', [GeekoController::class, 'index'])->name('geeko.index');
    Route::get('/training/{formation}/geeko/create', [GeekoController::class, 'create'])->name('geeko.create');
    Route::post('/training/{formation}/geeko', [GeekoController::class, 'store'])->name('geeko.store');
    Route::get('/training/{formation}/geeko/{geeko}', [GeekoController::class, 'show'])->name('geeko.show');
    Route::get('/training/{formation}/geeko/{geeko}/edit', [GeekoController::class, 'edit'])->name('geeko.edit');
    Route::put('/training/{formation}/geeko/{geeko}', [GeekoController::class, 'update'])->name('geeko.update');
    Route::delete('/training/{formation}/geeko/{geeko}', [GeekoController::class, 'destroy'])->name('geeko.destroy');
    Route::post('/training/{formation}/geeko/{geeko}/toggle-status', [GeekoController::class, 'toggleStatus'])->name('geeko.toggle-status');

    // Question management routes
    Route::post('/training/{formation}/geeko/{geeko}/questions', [GeekoController::class, 'storeQuestion'])->name('geeko.questions.store');
    Route::put('/training/{formation}/geeko/{geeko}/questions/{question}', [GeekoController::class, 'updateQuestion'])->name('geeko.questions.update');
    Route::delete('/training/{formation}/geeko/{geeko}/questions/{question}', [GeekoController::class, 'destroyQuestion'])->name('geeko.questions.destroy');
    Route::post('/training/{formation}/geeko/{geeko}/questions/reorder', [GeekoController::class, 'reorderQuestions'])->name('geeko.questions.reorder');

    // Session management routes
    Route::post('/training/{formation}/geeko/{geeko}/session/create', [GeekoSessionController::class, 'create'])->name('geeko.session.create');
    Route::get('/training/{formation}/geeko/{geeko}/session/{session}/control', [GeekoSessionController::class, 'control'])->name('geeko.session.control');
    Route::post('/training/{formation}/geeko/{geeko}/session/{session}/start', [GeekoSessionController::class, 'start'])->name('geeko.session.start');
    Route::post('/training/{formation}/geeko/{geeko}/session/{session}/next-question', [GeekoSessionController::class, 'nextQuestion'])->name('geeko.session.next-question');
    Route::get('/training/{formation}/geeko/{geeko}/session/{session}/end-question', [GeekoSessionController::class, 'endQuestion'])->name('geeko.session.end-question');
    Route::post('/training/{formation}/geeko/{geeko}/session/{session}/complete', [GeekoSessionController::class, 'complete'])->name('geeko.session.complete');
    Route::post('/training/{formation}/geeko/{geeko}/session/{session}/cancel', [GeekoSessionController::class, 'cancel'])->name('geeko.session.cancel');
    Route::get('/training/{formation}/geeko/{geeko}/session/{session}/results', [GeekoSessionController::class, 'results'])->name('geeko.session.results');
    Route::get('/training/{formation}/geeko/{geeko}/session/{session}/live-data', [GeekoSessionController::class, 'liveData'])->name('geeko.session.live-data');
    Route::delete('/training/{formation}/geeko/{geeko}/session/{session}/participants/{participant}', [GeekoSessionController::class, 'removeParticipant'])->name('geeko.session.remove-participant');
});

// Student routes for playing Geeko
Route::middleware(['auth', 'role:student'])->group(function () {
    // Join game routes
    Route::get('/geeko/join', [GeekoPlayController::class, 'join'])->name('geeko.play.join');
    Route::post('/geeko/join', [GeekoPlayController::class, 'joinWithPin'])->name('geeko.play.join-with-pin');
    
    // Game play routes
    Route::get('/geeko/play/{session}/lobby', [GeekoPlayController::class, 'lobby'])->name('geeko.play.lobby');
    Route::get('/geeko/play/{session}/question', [GeekoPlayController::class, 'question'])->name('geeko.play.question');
    Route::post('/geeko/play/{session}/answer', [GeekoPlayController::class, 'submitAnswer'])->name('geeko.play.submit-answer');
    Route::get('/geeko/play/{session}/waiting', [GeekoPlayController::class, 'waiting'])->name('geeko.play.waiting');
    Route::get('/geeko/play/{session}/completed', [GeekoPlayController::class, 'completed'])->name('geeko.play.completed');
    Route::get('/geeko/play/{session}/live-data', [GeekoPlayController::class, 'liveData'])->name('geeko.play.live-data');
    Route::post('/geeko/play/{session}/leave', [GeekoPlayController::class, 'leave'])->name('geeko.play.leave');
});

// Public route for Geeko game links (anyone with the link can access)
Route::get('/geeko/{sessionCode}', function ($sessionCode) {
    return redirect()->route('geeko.play.join', ['session_code' => $sessionCode]);
})->name('geeko.public.join');

