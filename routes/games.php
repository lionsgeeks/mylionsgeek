<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GamesController;

Route::middleware(['auth'])->group(function () {
    Route::get('/games', [GamesController::class, 'index'])->name('games.index');
    Route::get('/games/snake', [GamesController::class, 'snake'])->name('games.snake');
    Route::get('/games/tic-tac-toe', [GamesController::class, 'ticTacToe'])->name('games.tic-tac-toe');
    Route::get('/games/memory', [GamesController::class, 'memory'])->name('games.memory');
    Route::get('/games/tetris', [GamesController::class, 'tetris'])->name('games.tetris');
    Route::get('/games/connect-four', [GamesController::class, 'connectFour'])->name('games.connect-four');
    Route::get('/games/rock-paper-scissors', [GamesController::class, 'rockPaperScissors'])->name('games.rock-paper-scissors');
    Route::get('/games/uno', [GamesController::class, 'uno'])->name('games.uno');
    Route::get('/games/monopoly', [GamesController::class, 'monopoly'])->name('games.monopoly');
});

