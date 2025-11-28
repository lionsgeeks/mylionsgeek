<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GamesController;

Route::get('/games', [GamesController::class, 'index'])->name('games.index');
Route::get('/games/snake', [GamesController::class, 'snake'])->name('games.snake');
Route::get('/games/tic-tac-toe', [GamesController::class, 'ticTacToe'])->name('games.tic-tac-toe');
Route::get('/games/memory', [GamesController::class, 'memory'])->name('games.memory');
Route::get('/games/tetris', [GamesController::class, 'tetris'])->name('games.tetris');
Route::get('/games/connect-four', [GamesController::class, 'connectFour'])->name('games.connect-four');
Route::get('/games/rock-paper-scissors', [GamesController::class, 'rockPaperScissors'])->name('games.rock-paper-scissors');
Route::get('/games/pacman', [GamesController::class, 'pacman'])->name('games.pacman');

// API routes for game state management - requires authentication like chat
Route::middleware(['auth'])->prefix('api/games')->group(function () {
    Route::get('/ably-token', [GamesController::class, 'getAblyToken'])->name('games.ably-token');
    Route::get('/state/{roomId}', [GamesController::class, 'getGameState'])->name('games.get-state');
    Route::post('/state/{roomId}', [GamesController::class, 'updateGameState'])->name('games.update-state');
    Route::post('/reset/{roomId}', [GamesController::class, 'resetGameSession'])->name('games.reset');
});

