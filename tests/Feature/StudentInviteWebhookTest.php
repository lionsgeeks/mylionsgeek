<?php

use App\Mail\UserWelcomeMail;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Mail::fake();
    Config::set('services.lionsgeek.key', 'shared-invite-token');
});

test('missing token cannot invite a confirmed student', function () {
    $this->postJson('/api/internal/student-confirmed', [
        'email' => 'student@example.com',
        'promo' => 6,
        'field' => 'coding',
    ])->assertUnauthorized();

    expect(User::query()->where('email', 'student@example.com')->exists())->toBeFalse();
    Mail::assertNothingQueued();
});

test('empty shared key does not accept a bearer token', function () {
    Config::set('services.lionsgeek.key', '');

    $this->withToken('shared-invite-token')
        ->postJson('/api/internal/student-confirmed', [
            'email' => 'student@example.com',
            'promo' => 6,
            'field' => 'coding',
        ])
        ->assertUnauthorized();

    expect(User::query()->where('email', 'student@example.com')->exists())->toBeFalse();
});

test('confirmed student invite creates the account and queues the profile email', function () {
    $response = $this->withToken('shared-invite-token')
        ->postJson('/api/internal/student-confirmed', [
            'email' => 'Student@Example.com',
            'promo' => 6,
            'field' => 'media',
        ]);

    $response->assertOk()
        ->assertJson([
            'status' => 'created',
            'mail_sent' => true,
        ])
        ->assertJsonMissingPath('activation_token');

    $user = User::query()->where('email', 'student@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('student')
        ->and((int) $user->promo)->toBe(6)
        ->and($user->field)->toBe('media')
        ->and($user->normalizedRoles())->toBe(['student'])
        ->and($user->hasPendingActivation())->toBeTrue();

    Mail::assertQueued(UserWelcomeMail::class, function (UserWelcomeMail $mail) use ($user) {
        return $mail->hasTo($user->email);
    });
});

test('invalid field is rejected', function () {
    $this->withToken('shared-invite-token')
        ->postJson('/api/internal/student-confirmed', [
            'email' => 'student@example.com',
            'promo' => 6,
            'field' => 'design',
        ])
        ->assertUnprocessable();

    expect(User::query()->where('email', 'student@example.com')->exists())->toBeFalse();
    Mail::assertNothingQueued();
});

test('an activated account does not receive another invitation', function () {
    $existing = User::factory()->create([
        'email' => 'student@example.com',
        'role' => ['student'],
    ]);
    $existing->forceFill([
        'promo' => 1,
        'field' => 'coding',
    ])->save();

    $this->withToken('shared-invite-token')
        ->postJson('/api/internal/student-confirmed', [
            'email' => 'student@example.com',
            'promo' => 6,
            'field' => 'media',
        ])
        ->assertOk()
        ->assertJson([
            'status' => 'activated',
            'mail_sent' => false,
        ]);

    $existing->refresh();

    expect((int) $existing->promo)->toBe(1)
        ->and($existing->field)->toBe('coding')
        ->and($existing->hasPendingActivation())->toBeFalse();

    Mail::assertNothingQueued();
});

test('a pending account is updated and receives the invitation again', function () {
    $existing = User::factory()->create([
        'email' => 'student@example.com',
        'role' => ['student'],
    ]);
    $existing->issueActivationToken();

    $this->withToken('shared-invite-token')
        ->postJson('/api/internal/student-confirmed', [
            'email' => 'student@example.com',
            'promo' => 6,
            'field' => 'coding',
        ])
        ->assertOk()
        ->assertJson([
            'status' => 'pending',
            'mail_sent' => true,
        ]);

    $existing->refresh();

    expect((int) $existing->promo)->toBe(6)
        ->and($existing->field)->toBe('coding');

    Mail::assertQueued(UserWelcomeMail::class);
});
