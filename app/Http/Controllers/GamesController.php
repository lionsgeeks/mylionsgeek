<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class GamesController extends Controller
{
    public function index()
    {
        return Inertia::render('Games/Index');
    }

    public function snake()
    {
        return Inertia::render('Games/Snake');
    }

    public function ticTacToe()
    {
        return Inertia::render('Games/TicTacToe');
    }

    public function memory()
    {
        return Inertia::render('Games/Memory');
    }

    public function tetris()
    {
        return Inertia::render('Games/Tetris');
    }

    public function connectFour()
    {
        return Inertia::render('Games/ConnectFour');
    }

    public function rockPaperScissors()
    {
        return Inertia::render('Games/RockPaperScissors');
    }
}
