<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppBlockModal;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AppVersionController extends Controller
{
    public const VERSION_KEY = 'mobile.app_version';

    public const APP_STORE_URL_KEY = 'mobile.app_store_url';

    public const PLAY_STORE_URL_KEY = 'mobile.play_store_url';

    public function edit()
    {
        return Inertia::render('admin/appversion/index', [
            'appVersion' => self::adminFormState(),
            'modalHistory' => AppBlockModal::history(),
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

        return back()->with('success', 'Mobile app version saved.');
    }

    public function storeModal(Request $request)
    {
        $validated = $this->validateModal($request);

        AppBlockModal::query()->create([
            'is_active' => false,
            'title' => $validated['modal_title'],
            'message' => $validated['modal_message'],
            'button_label' => $validated['button_label'] ?? null,
            'button_url' => $validated['button_url'] ?? null,
        ]);

        return back()->with('success', 'Modal saved. Turn it on from the history table when it should stop the app.');
    }

    public function setActive(Request $request, AppBlockModal $appBlockModal)
    {
        $validated = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated, $appBlockModal): void {
            if ($validated['active']) {
                AppBlockModal::query()->whereKeyNot($appBlockModal->id)->update(['is_active' => false]);
            }

            $appBlockModal->update(['is_active' => $validated['active']]);
        });

        return back()->with('success', $validated['active']
            ? 'This modal is now stopping the app.'
            : 'This modal is no longer stopping the app.');
    }

    /**
     * @return array{modal_title: string, modal_message: string, button_label: ?string, button_url: ?string}
     */
    private function validateModal(Request $request): array
    {
        $request->merge([
            'modal_title' => trim(strip_tags((string) $request->input('modal_title', ''))),
            'modal_message' => trim(strip_tags((string) $request->input('modal_message', ''))),
            'button_label' => trim(strip_tags((string) $request->input('button_label', ''))),
            'button_url' => trim((string) $request->input('button_url', '')),
        ]);

        return $request->validate([
            'modal_title' => ['required', 'string', 'max:80'],
            'modal_message' => ['required', 'string', 'max:500'],
            'button_label' => ['nullable', 'string', 'max:40', 'required_with:button_url'],
            'button_url' => ['nullable', 'string', 'max:2048', 'required_with:button_label', function (string $attribute, mixed $value, \Closure $fail): void {
                if (! is_string($value) || $value === '') {
                    return;
                }
                if (! self::isAllowedActionUrl($value)) {
                    $fail('The button link must be an https or mailto link.');
                }
            }],
        ], [
            'modal_title.required' => 'A title is required for the modal.',
            'modal_message.required' => 'A message is required for the modal.',
            'button_label.required_with' => 'A button label is required when a button link is set.',
            'button_url.required_with' => 'A button link is required when a button label is set.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public static function mobilePayload(): array
    {
        $modal = AppBlockModal::current();
        $title = trim((string) ($modal->title ?? ''));
        $message = trim((string) ($modal->message ?? ''));
        $label = trim((string) ($modal->button_label ?? ''));
        $url = trim((string) ($modal->button_url ?? ''));
        $buttonReady = $label !== '' && self::isAllowedActionUrl($url);
        $mode = $modal?->is_active && $title !== '' && $message !== '' ? 'modal' : 'version';

        return [
            'version' => (string) AppSetting::get(self::VERSION_KEY, ''),
            'app_store_url' => (string) AppSetting::get(self::APP_STORE_URL_KEY, ''),
            'play_store_url' => (string) AppSetting::get(self::PLAY_STORE_URL_KEY, ''),
            'block_mode' => $mode,
            'modal' => [
                'title' => $title,
                'message' => $message,
                'button_label' => $buttonReady ? $label : '',
                'button_url' => $buttonReady ? $url : '',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function adminFormState(): array
    {
        $payload = self::mobilePayload();

        return [
            'version' => $payload['version'],
            'app_store_url' => $payload['app_store_url'],
            'play_store_url' => $payload['play_store_url'],
        ];
    }

    public static function isAllowedActionUrl(string $url): bool
    {
        $url = trim($url);

        if (preg_match('/^https:\/\/\S+$/i', $url) === 1) {
            return filter_var($url, FILTER_VALIDATE_URL) !== false;
        }

        return preg_match('/^mailto:[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}(\?[^\s]*)?$/i', $url) === 1;
    }
}
