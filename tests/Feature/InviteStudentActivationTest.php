<?php

use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Mail::fake();
});

test('unsigned complete-profile get cannot activate', function () {
    $user = User::factory()->create(['role' => ['student']]);
    $plain = $user->issueActivationToken();

    $this->withoutVite()
        ->get('/complete-profile/'.$plain)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('profile/ExpiredLink'));
});

test('unsigned complete-profile post cannot set a password', function () {
    $user = User::factory()->create(['role' => ['student']]);
    $plain = $user->issueActivationToken();
    $original = $user->password;

    $this->withoutVite()
        ->post('/complete-profile/update/'.$plain, [
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1',
            'phone' => '0611111111',
        ])
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('profile/ExpiredLink'));

    $user->refresh();
    expect($user->password)->toBe($original)
        ->and($user->hasPendingActivation())->toBeTrue();
});

test('invalid token cannot activate even with a valid signature', function () {
    $this->withoutVite()
        ->get(URL::temporarySignedRoute(
            'user.complete-profile',
            now()->addHour(),
            ['token' => bin2hex(random_bytes(32))]
        ))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('profile/ExpiredLink'));
});

test('expired activation token cannot activate', function () {
    $user = User::factory()->create(['role' => ['student']]);
    $plain = $user->issueActivationToken();
    $user->forceFill(['activation_token_expires_at' => now()->subMinute()])->save();

    $this->withoutVite()
        ->get(URL::temporarySignedRoute(
            'user.complete-profile',
            now()->addHour(),
            ['token' => $plain]
        ))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('profile/ExpiredLink'));
});

test('signed complete-profile page does not expose the activation token', function () {
    $user = User::factory()->create(['role' => ['student']]);
    $plain = $user->issueActivationToken();

    $this->withoutVite()
        ->get(URL::temporarySignedRoute(
            'user.complete-profile',
            now()->addHours(24),
            ['token' => $plain]
        ))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('profile/index')
            ->has('submitUrl')
            ->missing('user.activation_token')
            ->where('user.name', $user->name)
        );
});

test('valid signed complete-profile post activates once and cannot be reused', function () {
    $user = User::factory()->create([
        'role' => ['student'],
        'invite_source' => 'lionsgeek_adult',
    ]);
    $plain = $user->issueActivationToken();

    $submitUrl = URL::temporarySignedRoute(
        'user.complete-profile.update',
        now()->addHours(24),
        ['token' => $plain]
    );

    $this->withoutVite()
        ->post($submitUrl, [
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1',
            'gender' => 'female',
            'entreprise' => 'Should Not Save',
        ])
        ->assertRedirect('/login');

    $user->refresh();
    expect($user->gender)->toBe('female')
        ->and($user->entreprise)->toBeNull()
        ->and((int) $user->account_state)->toBe(0)
        ->and($user->hasPendingActivation())->toBeFalse()
        ->and($user->activation_token)->toBeNull()
        ->and($user->activation_token_expires_at)->toBeNull();

    $this->withoutVite()
        ->post($submitUrl, [
            'password' => 'AnotherPassword1',
            'password_confirmation' => 'AnotherPassword1',
        ])
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('profile/ExpiredLink'));
});

test('complete-profile rejects a missing gender and does not activate', function () {
    $user = User::factory()->create([
        'role' => ['student'],
        'invite_source' => 'lionsgeek_adult',
    ]);
    $plain = $user->issueActivationToken();

    $submitUrl = URL::temporarySignedRoute(
        'user.complete-profile.update',
        now()->addHours(24),
        ['token' => $plain]
    );

    $this->withoutVite()
        ->from('/complete-profile/'.$plain)
        ->post($submitUrl, [
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1',
            'entreprise' => 'Should Not Save',
        ])
        ->assertSessionHasErrors('gender');

    $user->refresh();
    expect($user->hasPendingActivation())->toBeTrue()
        ->and($user->entreprise)->not->toBe('Should Not Save');
});

test('recruiter complete-profile saves the company name', function () {
    $user = User::factory()->create([
        'role' => ['recruiter'],
        'invite_source' => 'admin',
    ]);
    $plain = $user->issueActivationToken();

    $submitUrl = URL::temporarySignedRoute(
        'user.complete-profile.update',
        now()->addHours(24),
        ['token' => $plain]
    );

    $this->withoutVite()
        ->post($submitUrl, [
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1',
            'phone' => '0612345678',
            'gender' => 'male',
            'entreprise' => 'LionsGeek',
        ])
        ->assertRedirect('/login');

    $user->refresh();
    expect($user->gender)->toBe('male')
        ->and($user->entreprise)->toBe('LionsGeek')
        ->and((int) $user->account_state)->toBe(0)
        ->and($user->hasPendingActivation())->toBeFalse();
});
