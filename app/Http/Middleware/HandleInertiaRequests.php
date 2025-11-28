<?php

namespace App\Http\Middleware;

use App\Models\Attendance;
use App\Models\Formation;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

            return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'session' => [
                'id' => $request->session()->getId(),
            ],
            'auth' => [
                'user' => (function () use ($request) {
                    $user = $request->user();
                    if (! $user) {
                        return null;
                    }

                    if (Schema::hasTable('accesses')) {
                        $user->loadMissing('access');
                    }

                    $rawImage = $user->image ?? null;
                    $avatarUrl = null;
                    if ($rawImage) {
                        $avatarUrl = Str::startsWith($rawImage, ['http://', 'https://'])
                            ? $rawImage
                            : asset('storage/' . ltrim($rawImage, '/'));
                    }

                    // Return user data merged with computed fields WITHOUT mutating/saving them on the model
                    return array_merge($user->toArray(), [
                        'avatarUrl' => $avatarUrl,
                        'isProfileImageMissing' => empty($avatarUrl),
                    ]);
                })(),
            ],
            'attendanceWarning' => function () use ($request) {
                $today = Carbon::today()->toDateString();
                $user = $request->user();

                if (! $user) {
                    return [
                        'hasWarning' => false,
                        'trainings' => [],
                        'date' => $today,
                    ];
                }

                $roles = $user->role;
                if (! is_array($roles)) {
                    $roles = array_filter([$roles]);
                }

                $isCoach = in_array('coach', $roles ?? [], true);
                if (! $isCoach) {
                    return [
                        'hasWarning' => false,
                        'trainings' => [],
                        'date' => $today,
                    ];
                }

                $trainings = Formation::query()
                    ->select(['id', 'name', 'start_time', 'end_time'])
                    ->where('user_id', $user->id)
                    ->get();

                if ($trainings->isEmpty()) {
                    return [
                        'hasWarning' => false,
                        'trainings' => [],
                        'date' => $today,
                    ];
                }

                $trainingIds = $trainings->pluck('id')->filter()->values();
                if ($trainingIds->isEmpty()) {
                    return [
                        'hasWarning' => false,
                        'trainings' => [],
                        'date' => $today,
                    ];
                }

                $attendedToday = Attendance::query()
                    ->whereIn('formation_id', $trainingIds)
                    ->whereDate('attendance_day', $today)
                    ->pluck('formation_id')
                    ->map(fn ($id) => (string) $id)
                    ->all();

                $attendedLookup = array_flip($attendedToday);

                $parseDate = static function (?string $value): ?string {
                    if (empty($value) || strtoupper($value) === 'NULL') {
                        return null;
                    }

                    try {
                        return Carbon::parse($value)->toDateString();
                    } catch (\Throwable) {
                        return null;
                    }
                };

                $missingTrainings = $trainings->filter(function ($training) use ($today, $attendedLookup, $parseDate) {
                    $start = $parseDate($training->start_time ?? null);
                    $end = $parseDate($training->end_time ?? null);

                    if ($start && $start > $today) {
                        return false;
                    }

                    if ($end && $end < $today) {
                        return false;
                    }

                    return ! array_key_exists((string) $training->id, $attendedLookup);
                })->map(function ($training) {
                    return [
                        'id' => (string) $training->id,
                        'name' => $training->name,
                    ];
                })->values();

                return [
                    'hasWarning' => $missingTrainings->isNotEmpty(),
                    'trainings' => $missingTrainings,
                    'date' => $today,
                ];
            },
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
