<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Jobs\CreateInvitedUser;
use App\Models\User;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('index');
})->name('home');

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});


use Illuminate\Support\Facades\Http;

Route::get('/wakatime-data', function () {
    // $apiKey = 'waka_d8277e8a-1e05-4178-a9e7-a7feeac8cb36';

    $query = User::whereNotNull('wakatime_api_key');

    $users = $query->get();


    $startDate = now()->startOfWeek()->toDateString(); // e.g. 2025-09-21
    $endDate   = "2025-09-25";


    // dd($endDate);
    foreach ($users as $user) {

        $apiKey = $user->wakatime_api_key;
        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode($apiKey . ':'),
        ])->get('https://wakatime.com/api/v1/users/current/summaries', [
            'start' => $startDate,
            'end' => $endDate,
        ]);

        $data = $response->json();

        $cumulative = $data['cumulative_total'];

        dd($cumulative);
    }
    // Fetch data from WakaTime API

    // Dump the response
});
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/users.php';
require __DIR__ . '/computers.php';
require __DIR__ . '/leaderboard.php';
require __DIR__ . '/training.php';
require __DIR__ . '/equipment.php';
