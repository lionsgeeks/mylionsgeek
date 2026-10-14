<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

$GLOBALS['cover_cleanup'] = [];

function coverDir(): string
{
    $dir = public_path('storage/img/cover');
    if (! is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    return $dir;
}

function coverSnapshot(): array
{
    return array_values(array_diff(scandir(coverDir()) ?: [], ['.', '..']));
}

function coverTrack(string $path): string
{
    $GLOBALS['cover_cleanup'][] = $path;

    return $path;
}

function coverUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => ['student'],
        'status' => 'Studying',
        'email_verified_at' => now(),
        'account_state' => 0,
        'image' => 'pdp.png',
        'cover' => null,
    ], $overrides));
}

function coverExistingFile(string $storedAs): string
{
    $name = 'cover-old-'.uniqid('', true).'.jpg';
    file_put_contents(coverTrack(coverDir().DIRECTORY_SEPARATOR.$name), 'old-cover-bytes');

    return str_contains($storedAs, '/') ? 'img/cover/'.$name : $name;
}

function coverWeb(User $user, array $payload)
{
    return test()
        ->actingAs($user)
        ->from('/students/'.$user->id)
        ->post('/students/changeCover/'.$user->id, $payload);
}

function coverMobile(User $user, array $payload)
{
    Auth::forgetGuards();

    return test()
        ->actingAs($user, 'sanctum')
        ->post('/api/mobile/profile/cover', $payload, ['Accept' => 'application/json']);
}

beforeEach(function () {
    $this->coverBefore = coverSnapshot();
    $this->withoutVite();
});

afterEach(function () {
    foreach (array_diff(coverSnapshot(), $this->coverBefore) as $leftover) {
        @unlink(coverDir().DIRECTORY_SEPARATOR.$leftover);
    }
    foreach ($GLOBALS['cover_cleanup'] as $path) {
        @unlink($path);
    }
    $GLOBALS['cover_cleanup'] = [];
});

test('web and mobile cover uploads are stored where the profile can load them and replace the old file', function (string $channel) {
    $old = coverExistingFile('img/cover/file');
    $user = coverUser(['cover' => $old]);
    $oldName = basename($old);

    if ($channel === 'web') {
        coverWeb($user, ['cover' => UploadedFile::fake()->image('banner.jpg')])
            ->assertSessionHasNoErrors()
            ->assertRedirect();
    } else {
        coverMobile($user, ['cover' => UploadedFile::fake()->image('banner.png')])
            ->assertOk()
            ->assertJsonPath('data.cover', $user->refresh()->cover);
    }

    $user->refresh();
    expect($user->cover)->toStartWith('img/cover/')
        ->and($user->cover)->not->toBe($old)
        ->and(is_file(coverTrack(public_path('storage/'.$user->cover))))->toBeTrue()
        ->and(is_file(coverDir().DIRECTORY_SEPARATOR.$oldName))->toBeFalse();
})->with(['web', 'mobile']);

test('a cover up to 10 MB is accepted and a larger file keeps the old cover', function () {
    $old = coverExistingFile('bare');
    $user = coverUser(['cover' => $old]);

    coverMobile($user, ['cover' => UploadedFile::fake()->image('big.jpg')->size(10000)])->assertOk();
    expect($user->refresh()->cover)->toStartWith('img/cover/')
        ->and(is_file(coverDir().DIRECTORY_SEPARATOR.basename($old)))->toBeFalse();

    $kept = $user->cover;
    coverWeb($user, ['cover' => UploadedFile::fake()->image('huge.jpg')->size(10241)])
        ->assertSessionHasErrors('cover');

    expect($user->refresh()->cover)->toBe($kept)
        ->and(is_file(public_path('storage/'.$kept)))->toBeTrue();
});

test('a rejected cover upload does not change the stored cover', function () {
    $old = coverExistingFile('img/cover/file');
    $user = coverUser(['cover' => $old]);

    coverMobile($user, ['cover' => UploadedFile::fake()->create('notes.pdf', 20, 'application/pdf')])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('cover');

    expect($user->refresh()->cover)->toBe($old)
        ->and(is_file(coverDir().DIRECTORY_SEPARATOR.basename($old)))->toBeTrue();
});

test('a cover file shared with another user is not deleted', function () {
    $shared = coverExistingFile('img/cover/file');
    $user = coverUser(['cover' => $shared]);
    coverUser(['cover' => $shared]);

    coverMobile($user, ['cover' => UploadedFile::fake()->image('new.jpg')])->assertOk();

    expect($user->refresh()->cover)->not->toBe($shared)
        ->and(is_file(coverDir().DIRECTORY_SEPARATOR.basename($shared)))->toBeTrue();
});

test('a cover value that points outside the cover folder is never deleted', function () {
    $sentinel = public_path('storage/img/cover-sentinel-'.uniqid('', true).'.txt');
    file_put_contents(coverTrack($sentinel), 'keep me');
    $user = coverUser(['cover' => '../'.basename($sentinel)]);

    coverMobile($user, ['cover' => UploadedFile::fake()->image('new.jpg')])->assertOk();

    expect(is_file($sentinel))->toBeTrue();
});

test('guests and other users cannot change a cover', function () {
    $owner = coverUser(['cover' => 'img/cover/owner.jpg']);
    $other = coverUser();

    $this->post('/students/changeCover/'.$owner->id, [
        'cover' => UploadedFile::fake()->image('x.jpg'),
    ])->assertRedirect();

    $this->postJson('/api/mobile/profile/cover', [
        'cover' => UploadedFile::fake()->image('x.jpg'),
    ])->assertUnauthorized();

    $this->actingAs($other)
        ->post('/students/changeCover/'.$owner->id, [
            'cover' => UploadedFile::fake()->image('x.jpg'),
        ])
        ->assertForbidden();

    expect($owner->refresh()->cover)->toBe('img/cover/owner.jpg');
});

test('updating a user with a cover stores it in the public cover folder', function () {
    $user = coverUser();

    $this->actingAs($user)
        ->put('/students/update/'.$user->id, [
            'cover' => UploadedFile::fake()->image('from-edit.jpg'),
        ])
        ->assertRedirect();

    $user->refresh();
    expect($user->cover)->toStartWith('img/cover/')
        ->and(is_file(coverTrack(public_path('storage/'.$user->cover))))->toBeTrue();
});
