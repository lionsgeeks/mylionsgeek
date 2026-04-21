<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LinkedInSettingsController extends Controller
{
    public function edit()
    {
        return Inertia::render('admin/settings/linkedin', [
            'linkedin' => [
                'client_id' => (string) AppSetting::get('linkedin.client_id', ''),
                'has_client_secret' => AppSetting::get('linkedin.client_secret', null) ? true : false,
            ],
            'redirect_uri' => rtrim((string) config('app.url'), '/') . '/auth/linkedin/callback',
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|string|max:255',
            'client_secret' => 'nullable|string|max:255',
        ]);

        AppSetting::set('linkedin.client_id', $validated['client_id']);
        if (! empty($validated['client_secret'])) {
            AppSetting::set('linkedin.client_secret', $validated['client_secret']);
        }

        return back()->with('success', 'LinkedIn settings updated.');
    }
}
