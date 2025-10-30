<?php

use App\Http\Controllers\GamesController;
use Illuminate\Support\Facades\Route;

Route::get('/games', [GamesController::class, 'index'])->name('games.index');
Route::get('/games/snake', [GamesController::class, 'snake'])->name('games.snake');
Route::get('/games/tic-tac-toe', [GamesController::class, 'ticTacToe'])->name('games.tic-tac-toe');
Route::get('/games/memory', [GamesController::class, 'memory'])->name('games.memory');
Route::get('/games/tetris', [GamesController::class, 'tetris'])->name('games.tetris');
Route::get('/games/connect-four', [GamesController::class, 'connectFour'])->name('games.connect-four');
Route::get('/games/rock-paper-scissors', [GamesController::class, 'rockPaperScissors'])->name('games.rock-paper-scissors');
