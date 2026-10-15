<?php

use App\Http\Controllers\Admin\AppVersionController;
use App\Models\AppBlockModal;
use App\Models\AppSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
});

function appAccessUser(array $roles): User
{
    return User::factory()->create([
        'role' => $roles,
        'status' => 'Studying',
        'email_verified_at' => now(),
        'account_state' => 0,
        'access_cowork' => 0,
        'access_studio' => 0,
        'access_scan' => 0,
    ]);
}

function versionPayload(): array
{
    return [
        'version' => '1.2.3',
        'app_store_url' => 'https://apps.apple.com/app/id123456789',
        'play_store_url' => 'https://play.google.com/store/apps/details?id=com.lionsgeek.app',
    ];
}

function modalPayload(array $overrides = []): array
{
    return array_merge([
        'modal_title' => 'Maintenance',
        'modal_message' => 'The app is paused until tonight.',
        'button_label' => 'Contact us',
        'button_url' => 'mailto:pro@lionsgeek.ma',
    ], $overrides);
}

test('an admin activates a saved modal from the history table', function () {
    $admin = appAccessUser(['admin']);

    $this->actingAs($admin)
        ->post('/admin/appversion/modals', modalPayload())
        ->assertRedirect();

    $modal = AppBlockModal::query()->first();
    expect($modal->is_active)->toBeFalse();

    $this->actingAs($admin)
        ->post('/admin/appversion/modals/'.$modal->id.'/active', ['active' => true])
        ->assertRedirect();

    expect($modal->fresh()->is_active)->toBeTrue();

    $this->getJson('/api/mobile/app-version')
        ->assertOk()
        ->assertJsonPath('block_mode', 'modal')
        ->assertJsonPath('modal.title', 'Maintenance')
        ->assertJsonPath('modal.button_url', 'mailto:pro@lionsgeek.ma');

    $this->actingAs($admin)
        ->post('/admin/appversion/modals/'.$modal->id.'/active', ['active' => false])
        ->assertRedirect();

    $this->getJson('/api/mobile/app-version')
        ->assertOk()
        ->assertJsonPath('block_mode', 'version')
        ->assertJsonPath('modal.title', '');
});

test('activating one modal turns the previous one off', function () {
    $admin = appAccessUser(['admin']);

    $this->actingAs($admin)->post('/admin/appversion/modals', modalPayload([
        'modal_title' => 'First',
        'modal_message' => 'The first pause.',
        'button_label' => '',
        'button_url' => '',
    ]));
    $this->actingAs($admin)->post('/admin/appversion/modals', modalPayload([
        'modal_title' => 'Second',
        'modal_message' => 'The second pause.',
        'button_label' => '',
        'button_url' => '',
    ]));

    $first = AppBlockModal::query()->where('title', 'First')->first();
    $second = AppBlockModal::query()->where('title', 'Second')->first();

    $this->actingAs($admin)
        ->post('/admin/appversion/modals/'.$first->id.'/active', ['active' => true])
        ->assertRedirect();
    $this->actingAs($admin)
        ->post('/admin/appversion/modals/'.$second->id.'/active', ['active' => true])
        ->assertRedirect();

    expect($first->fresh()->is_active)->toBeFalse();
    expect($second->fresh()->is_active)->toBeTrue();
    expect(AppBlockModal::query()->count())->toBe(2);

    $this->getJson('/api/mobile/app-version')
        ->assertOk()
        ->assertJsonPath('modal.title', 'Second');
});

test('saving the app version does not turn a modal off', function () {
    $admin = appAccessUser(['admin']);
    $modal = AppBlockModal::query()->create([
        'is_active' => true,
        'title' => 'Holiday',
        'message' => 'Back on Monday.',
    ]);

    $this->actingAs($admin)
        ->post('/admin/appversion', versionPayload())
        ->assertRedirect();

    expect($modal->fresh()->is_active)->toBeTrue();

    $this->getJson('/api/mobile/app-version')
        ->assertOk()
        ->assertJsonPath('version', '1.2.3')
        ->assertJsonPath('block_mode', 'modal')
        ->assertJsonPath('modal.title', 'Holiday');
});

test('the admin page lists modal history with an id for the block column', function () {
    $admin = appAccessUser(['super_admin']);
    $modal = AppBlockModal::query()->create([
        'is_active' => false,
        'title' => 'Holiday',
        'message' => 'Back on Monday.',
    ]);

    $this->actingAs($admin)
        ->get('/admin/appversion')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/appversion/index')
            ->where('appVersion.version', '')
            ->has('modalHistory', 1)
            ->where('modalHistory.0.id', $modal->id)
            ->where('modalHistory.0.title', 'Holiday')
            ->where('modalHistory.0.is_active', false)
        );
});

test('guests and students cannot save or activate a modal', function () {
    $modal = AppBlockModal::query()->create([
        'is_active' => false,
        'title' => 'Holiday',
        'message' => 'Back on Monday.',
    ]);

    $this->post('/admin/appversion/modals', modalPayload())->assertRedirect('/login');
    $this->post('/admin/appversion/modals/'.$modal->id.'/active', ['active' => true])->assertRedirect('/login');

    $student = appAccessUser(['student']);
    $this->actingAs($student)
        ->post('/admin/appversion/modals', modalPayload())
        ->assertRedirect(route('student.feed'));
    $this->actingAs($student)
        ->post('/admin/appversion/modals/'.$modal->id.'/active', ['active' => true])
        ->assertRedirect(route('student.feed'));

    expect($modal->fresh()->is_active)->toBeFalse();
});

test('the modal requires a title and rejects a button with no link', function () {
    $admin = appAccessUser(['admin']);

    $this->actingAs($admin)
        ->from('/admin/appversion')
        ->post('/admin/appversion/modals', modalPayload([
            'modal_title' => '',
        ]))
        ->assertRedirect('/admin/appversion')
        ->assertSessionHasErrors('modal_title');

    $this->actingAs($admin)
        ->from('/admin/appversion')
        ->post('/admin/appversion/modals', modalPayload([
            'button_label' => 'Open',
            'button_url' => '',
        ]))
        ->assertRedirect('/admin/appversion')
        ->assertSessionHasErrors('button_url');

    expect(AppBlockModal::query()->count())->toBe(0);
});

test('a button link must be https or mailto and an unknown modal cannot be activated', function () {
    $admin = appAccessUser(['admin']);

    $this->actingAs($admin)
        ->from('/admin/appversion')
        ->post('/admin/appversion/modals', modalPayload([
            'button_url' => 'javascript:alert(1)',
        ]))
        ->assertRedirect('/admin/appversion')
        ->assertSessionHasErrors('button_url');

    $this->actingAs($admin)
        ->post('/admin/appversion/modals/999/active', ['active' => true])
        ->assertNotFound();
});

test('an unreadable version setting does not take down the version check', function () {
    DB::table('app_settings')->insert([
        'key' => AppVersionController::VERSION_KEY,
        'value' => 'not-encrypted',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->getJson('/api/mobile/app-version')
        ->assertOk()
        ->assertJsonPath('block_mode', 'version')
        ->assertJsonPath('version', '');
});

test('saving the app version replaces an unreadable stored value', function () {
    $admin = appAccessUser(['admin']);

    foreach ([
        AppVersionController::VERSION_KEY,
        AppVersionController::APP_STORE_URL_KEY,
        AppVersionController::PLAY_STORE_URL_KEY,
    ] as $key) {
        DB::table('app_settings')->insert([
            'key' => $key,
            'value' => 'not-encrypted',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    $this->actingAs($admin)
        ->post('/admin/appversion', versionPayload())
        ->assertRedirect();

    expect(AppSetting::get(AppVersionController::VERSION_KEY))->toBe('1.2.3');
    expect(AppSetting::get(AppVersionController::APP_STORE_URL_KEY))->toBe('https://apps.apple.com/app/id123456789');
});
