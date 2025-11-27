<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

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
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'conversations' => fn () => $request->session()->get('conversations'),
            'conversation' => fn () => $request->session()->get('conversation'),
            'messages' => fn () => $request->session()->get('messages'),
            'message' => fn () => $request->session()->get('message'),
            'unread_count' => fn () => $request->session()->get('unread_count'),
            'posts' => fn () => $request->session()->get('posts'),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
