<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppVersionController extends Controller
{
    public const VERSION_KEY = 'mobile.app_version';

    public const APP_STORE_URL_KEY = 'mobile.app_store_url';

    public const PLAY_STORE_URL_KEY = 'mobile.play_store_url';

    public function edit()
    {
        return Inertia::render('admin/appversion/index', [
            'appVersion' => [
                'version' => (string) AppSetting::get(self::VERSION_KEY, ''),
                'app_store_url' => (string) AppSetting::get(self::APP_STORE_URL_KEY, ''),
                'play_store_url' => (string) AppSetting::get(self::PLAY_STORE_URL_KEY, ''),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'version' => ['required', 'string', 'regex:/^\d+\.\d+\.\d+$/'],
            'app_store_url' => [
                'required',
                'url',
                'max:2048',
                'regex:/^https?:\/\/(apps\.apple\.com|itunes\.apple\.com)\//i',
            ],
            'play_store_url' => [
                'required',
                'url',
                'max:2048',
                'regex:/^https?:\/\/play\.google\.com\/store\/apps\/details\?id=[\w.]+/i',
            ],
        ], [
            'version.regex' => 'Version must be in format X.Y.Z (e.g. 1.0.5).',
            'app_store_url.regex' => 'Must be a valid App Store link (e.g. https://apps.apple.com/app/id123456789).',
            'play_store_url.regex' => 'Must be a valid Play Store link (e.g. https://play.google.com/store/apps/details?id=com.example.app).',
        ]);

        AppSetting::set(self::VERSION_KEY, $validated['version']);
        AppSetting::set(self::APP_STORE_URL_KEY, $validated['app_store_url']);
        AppSetting::set(self::PLAY_STORE_URL_KEY, $validated['play_store_url']);

        return back()->with('success', 'Mobile app version settings saved.');
    }
}
