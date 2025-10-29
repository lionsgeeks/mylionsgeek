<?php

namespace App\Providers;

use App\Models\Reservation;
use App\Models\ReservationCowork;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error' => session('error'),
                ];
            },

            // Stats dyal reservations global
            'auth' => function () {
                return [
                    'authUser' => Auth::user()->only(['roles']),
                ];
            },
            'reservationStats' => function () {
                return [
                    'reservation' => [
                        'notProcessed' => Reservation::where('approved', 0)
                            ->where('canceled', 0)
                            ->where('passed', 0)
                            ->count(),
                    ],
                    'cowork' => [
                        'notProcessed' => ReservationCowork::where('approved', 0)
                            ->where('canceled', 0)
                            ->where('passed', 0)
                            ->count(),
                    ],
                ];
            },

        ]);
    }
}
