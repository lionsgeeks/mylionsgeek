<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Middleware;

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
            'csrfToken' => csrf_token(),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'session' => [
                'id' => $request->session()->getId(),
            ],
            'auth' => [
                'recruiting' => fn () => $request->user()?->recruitingContext(),
                'user' => (function () use ($request) {
                    $user = $request->user();
                    if (! $user) {
                        return null;
                    }

                    if (Schema::hasTable('accesses')) {
                        $user->loadMissing('access');
                    }

                    $user->loadMissing('socialLinks');

                    $rawImage = $user->image ?? null;
                    $avatarUrl = null;
                    if ($rawImage) {
                        if (Str::startsWith($rawImage, ['http://', 'https://'])) {
                            $avatarUrl = $rawImage;
                        } elseif (str_contains($rawImage, 'img/profile/')) {
                            $avatarUrl = asset('storage/'.ltrim($rawImage, '/'));
                        } else {
                            $avatarUrl = asset('storage/img/profile/'.ltrim($rawImage, '/'));
                        }
                    }

                    // Return user data merged with computed fields WITHOUT mutating/saving them on the model
                    return array_merge($user->toArray(), [
                        'avatarUrl' => $avatarUrl,
                        'isProfileImageMissing' => empty($avatarUrl),
                        'is_organisation_account' => $user->isOrganisationAccount(),
                        'social_links' => $user->socialLinks,
                        'resume' => $user->resume,
                        'resume_url' => $user->resumePublicUrl(),
                        'resume_view_url' => $user->resumeViewUrl(),
                    ]);
                })(),
            ],
            'flash' => [
                'success' => $request->session()->get('success') ?: $request->session()->get('banner_success'),
                'error' => $request->session()->get('error') ?: $request->session()->get('banner_error'),
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
