<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

/** Files created by a test, removed in afterEach so the real public folder stays clean. */
$GLOBALS['pp_cleanup'] = [];

function ppDir(): string
{
    $dir = public_path('storage/img/profile');
    if (! is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    return $dir;
}

function ppSnapshot(): array
{
    return array_values(array_diff(scandir(ppDir()) ?: [], ['.', '..']));
}

function ppTrack(string $path): string
{
    $GLOBALS['pp_cleanup'][] = $path;

    return $path;
}

function ppUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => ['student'],
        'status' => 'Studying',
        'email_verified_at' => now(),
        'account_state' => 0,
        'image' => 'pdp.png', // column default: shared placeholder picture
    ], $overrides));
}

/** Put a real file on disk and return its filename. */
function ppExistingImage(): string
{
    $name = 'pp-old-'.uniqid('', true).'.jpg';
    file_put_contents(ppTrack(ppDir().DIRECTORY_SEPARATOR.$name), 'old-image-bytes');

    return $name;
}

function ppWebUpdate(User $user, array $extra = [])
{
    return test()
        ->actingAs($user)
        ->patch(route('profile.update'), array_merge([
            'name' => $user->name,
            'email' => $user->email,
        ], $extra));
}

function ppMobileUpdate(User $user, array $extra = [])
{
    Auth::forgetGuards();

    return test()
        ->actingAs($user, 'sanctum')
        ->postJson('/api/mobile/profile/update', $extra);
}

beforeEach(function () {
    $this->ppBefore = ppSnapshot();
    $this->withoutVite();
});

afterEach(function () {
    // Remove every file the test uploaded plus the ones it created on purpose.
    foreach (array_diff(ppSnapshot(), $this->ppBefore) as $leftover) {
        @unlink(ppDir().DIRECTORY_SEPARATOR.$leftover);
    }
    foreach ($GLOBALS['pp_cleanup'] as $path) {
        @unlink($path);
    }
    $GLOBALS['pp_cleanup'] = [];
});

// ─── Replacing a picture ──────────────────────────────────────────────────────

test('web: uploading a picture changes the stored image and removes the old file', function () {
    $old = ppExistingImage();
    $user = ppUser(['image' => $old]);

    ppWebUpdate($user, ['image' => UploadedFile::fake()->image('new.jpg')])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();
    expect($user->image)->not->toBe($old)->and($user->image)->not->toBeEmpty();
    expect(is_file(ppTrack(ppDir().DIRECTORY_SEPARATOR.$user->image)))->toBeTrue();
    expect(is_file(ppDir().DIRECTORY_SEPARATOR.$old))->toBeFalse();
});

test('mobile: uploading a picture changes the stored image and removes the old file', function () {
    $old = ppExistingImage();
    $user = ppUser(['image' => $old]);

    $response = ppMobileUpdate($user, ['image' => UploadedFile::fake()->image('new.png')])
        ->assertOk();

    $user->refresh();
    $response->assertJsonPath('data.image', $user->image);
    expect($user->image)->not->toBe($old)->and($user->image)->not->toBeEmpty();
    expect(is_file(ppDir().DIRECTORY_SEPARATOR.$user->image))->toBeTrue();
    expect(is_file(ppDir().DIRECTORY_SEPARATOR.$old))->toBeFalse();
});

test('the shared default picture file is never deleted when a user uploads their first picture', function () {
    $default = ppDir().DIRECTORY_SEPARATOR.'pdp.png';
    if (! is_file($default)) {
        file_put_contents(ppTrack($default), 'placeholder');
    }
    $user = ppUser();

    ppMobileUpdate($user, ['image' => UploadedFile::fake()->image('first.jpg')])->assertOk();
    ppWebUpdate(ppUser(), ['image' => UploadedFile::fake()->image('first.jpg')])->assertSessionHasNoErrors();

    expect($user->refresh()->image)->not->toBe('pdp.png')
        ->and(is_file($default))->toBeTrue();
});

test('pictures up to 10 MB are accepted on web and mobile', function () {
    $web = ppUser();
    $mobile = ppUser();

    ppWebUpdate($web, ['image' => UploadedFile::fake()->image('big.jpg')->size(10000)])
        ->assertSessionHasNoErrors();
    ppMobileUpdate($mobile, ['image' => UploadedFile::fake()->image('big.jpg')->size(10000)])->assertOk();

    expect($web->refresh()->image)->not->toBeEmpty()
        ->and($mobile->refresh()->image)->not->toBeEmpty();
});

test('updating without an image keeps the current picture and file', function () {
    $old = ppExistingImage();
    $web = ppUser(['image' => $old]);
    $mobile = ppUser(['image' => $old]);

    ppWebUpdate($web, ['name' => 'Renamed Web'])->assertSessionHasNoErrors();
    ppMobileUpdate($mobile, ['name' => 'Renamed Mobile'])->assertOk();

    expect($web->refresh()->image)->toBe($old)
        ->and($mobile->refresh()->image)->toBe($old)
        ->and(is_file(ppDir().DIRECTORY_SEPARATOR.$old))->toBeTrue();
});

// ─── Rejected uploads keep the old picture ────────────────────────────────────

test('invalid uploads are rejected and the old picture is untouched', function (string $channel, callable $file) {
    $old = ppExistingImage();
    $user = ppUser(['image' => $old]);

    if ($channel === 'web') {
        ppWebUpdate($user, ['image' => $file()])->assertSessionHasErrors('image');
    } else {
        ppMobileUpdate($user, ['image' => $file()])->assertUnprocessable()->assertJsonValidationErrors('image');
    }

    expect($user->refresh()->image)->toBe($old)
        ->and(is_file(ppDir().DIRECTORY_SEPARATOR.$old))->toBeTrue()
        ->and(array_diff(ppSnapshot(), $this->ppBefore, [$old]))->toBeEmpty();
})->with([
    'web svg' => ['web', fn () => UploadedFile::fake()->create('a.svg', 10, 'image/svg+xml')],
    'web not an image' => ['web', fn () => UploadedFile::fake()->create('a.pdf', 10, 'application/pdf')],
    'web over 10 MB' => ['web', fn () => UploadedFile::fake()->image('a.jpg')->size(10241)],
    'mobile svg' => ['mobile', fn () => UploadedFile::fake()->create('a.svg', 10, 'image/svg+xml')],
    'mobile not an image' => ['mobile', fn () => UploadedFile::fake()->create('a.pdf', 10, 'application/pdf')],
    'mobile over 10 MB' => ['mobile', fn () => UploadedFile::fake()->image('a.jpg')->size(10241)],
]);

// ─── Old file deletion is safe ────────────────────────────────────────────────

test('a file shared with another user is not deleted when one user changes picture', function () {
    $shared = ppExistingImage();
    $userA = ppUser(['image' => $shared]);
    ppUser(['image' => $shared]);

    ppMobileUpdate($userA, ['image' => UploadedFile::fake()->image('new.jpg')])->assertOk();

    expect($userA->refresh()->image)->not->toBe($shared)
        ->and(is_file(ppDir().DIRECTORY_SEPARATOR.$shared))->toBeTrue();
});

test('an image value that points outside the profile folder is never deleted', function (string $value) {
    // Sentinel sits one level above img/profile, where "../" would reach it.
    $sentinel = public_path('storage/img/pp-sentinel-'.uniqid('', true).'.txt');
    file_put_contents(ppTrack($sentinel), 'keep me');
    $user = ppUser(['image' => str_replace('{name}', basename($sentinel), $value)]);

    ppMobileUpdate($user, ['image' => UploadedFile::fake()->image('new.jpg')])->assertOk();

    expect(is_file($sentinel))->toBeTrue();
})->with([
    'relative traversal' => ['../{name}'],
    'nested traversal' => ['img/profile/../../img/{name}'],
]);

test('an external image url is left alone and replaced', function () {
    $user = ppUser(['image' => 'https://example.com/avatar.jpg']);

    ppMobileUpdate($user, ['image' => UploadedFile::fake()->image('new.jpg')])->assertOk();

    expect($user->refresh()->image)->not->toStartWith('http');
});

// ─── Access control ───────────────────────────────────────────────────────────

test('anonymous users cannot change a profile picture', function () {
    $this->postJson('/api/mobile/profile/update', ['image' => UploadedFile::fake()->image('x.jpg')])
        ->assertUnauthorized();
    $this->patch(route('profile.update'), ['image' => UploadedFile::fake()->image('x.jpg')])
        ->assertRedirect();

    expect(array_diff(ppSnapshot(), $this->ppBefore))->toBeEmpty();
});

test('mobile cannot change another users picture by sending their id', function () {
    $victim = ppUser();
    $attacker = ppUser();

    ppMobileUpdate($attacker, ['id' => $victim->id, 'user_id' => $victim->id, 'image' => UploadedFile::fake()->image('x.jpg')])
        ->assertOk();

    expect($victim->refresh()->image)->toBe('pdp.png')
        ->and($attacker->refresh()->image)->not->toBe('pdp.png');
});
