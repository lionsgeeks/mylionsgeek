<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppVersionController extends Controller
{
    public const VERSION_KEY = 'mobile.app_version';

    public const UPDATE_URL_KEY = 'mobile.update_url';

    public function edit()
    {
        return Inertia::render('admin/appversion/index', [
            'appVersion' => [
                'version' => (string) AppSetting::get(self::VERSION_KEY, ''),
                'update_url' => (string) AppSetting::get(self::UPDATE_URL_KEY, ''),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'version' => ['required', 'string', 'regex:/^\d+\.\d+\.\d+$/'],
            'update_url' => ['required', 'url', 'max:2048'],
        ]);

        AppSetting::set(self::VERSION_KEY, $validated['version']);
        AppSetting::set(self::UPDATE_URL_KEY, $validated['update_url']);

        return back()->with('success', 'Mobile app version settings saved.');
    }
}
