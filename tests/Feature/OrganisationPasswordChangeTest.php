<?php

use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
});

function organisationPasswordOwner(bool $onboarded, bool $mustChangePassword = true): User
{
    $owner = User::factory()->create([
        'role' => ['recruiter'],
        'email_verified_at' => now(),
        'account_state' => 0,
        'must_change_password' => $mustChangePassword,
    ]);

    Organization::query()->create([
        'email' => $owner->email,
        'enterprise_name' => $onboarded ? 'Existing Company' : null,
        'contact_name' => $onboarded ? 'Existing Contact' : null,
        'sector' => $onboarded ? 'Technology' : null,
        'location' => $onboarded ? 'Casablanca' : null,
        'phone' => $onboarded ? '0611100100' : null,
        'account_user_id' => $owner->id,
        'account_state' => 0,
        'onboarding_completed_at' => $onboarded ? now() : null,
    ]);

    return $owner;
}

test('a finished organisation must give the current password before choosing a new one', function () {
    $owner = organisationPasswordOwner(onboarded: true);

    $this->actingAs($owner)
        ->get('/organisation/onboarding')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('organisation/partials/onboardingForm')
            ->where('passwordChangeOnly', true)
            ->where('skipPassword', false)
        );

    $this->actingAs($owner)
        ->from('/organisation/onboarding')
        ->post('/organisation/onboarding', [
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1',
        ])
        ->assertRedirect('/organisation/onboarding')
        ->assertSessionHasErrors('current_password');

    $owner->refresh();
    expect($owner->must_change_password)->toBeTrue()
        ->and(Hash::check('password', $owner->password))->toBeTrue();

    $this->actingAs($owner)
        ->from('/organisation/onboarding')
        ->post('/organisation/onboarding', [
            'current_password' => 'wrong-password',
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1',
        ])
        ->assertRedirect('/organisation/onboarding')
        ->assertSessionHasErrors('current_password');

    $owner->refresh();
    expect($owner->must_change_password)->toBeTrue()
        ->and(Hash::check('NewPassword1', $owner->password))->toBeFalse();

    $this->actingAs($owner)
        ->from('/organisation/onboarding')
        ->post('/organisation/onboarding', [
            'current_password' => 'password',
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1',
        ])
        ->assertRedirect(route('recruiter.dashboard', absolute: false));

    $owner->refresh();
    expect($owner->must_change_password)->toBeFalse()
        ->and(Hash::check('NewPassword1', $owner->password))->toBeTrue();
});

test('unfinished organisation setup cannot replace the password without the current one', function () {
    $owner = organisationPasswordOwner(onboarded: false);
    $profile = [
        'contact_name' => 'New Contact',
        'enterprise_name' => 'New Company',
        'sector' => 'Technology',
        'location' => 'Rabat',
        'phone' => '0611100199',
        'password' => 'NewPassword1',
        'password_confirmation' => 'NewPassword1',
    ];

    $this->actingAs($owner)
        ->from('/organisation/onboarding')
        ->post('/organisation/onboarding', $profile)
        ->assertRedirect('/organisation/onboarding')
        ->assertSessionHasErrors('current_password');

    $owner->refresh();
    $organization = Organization::query()->where('account_user_id', $owner->id)->first();
    expect($organization->hasCompletedOnboarding())->toBeFalse()
        ->and($organization->enterprise_name)->toBeNull()
        ->and($owner->must_change_password)->toBeTrue()
        ->and(Hash::check('password', $owner->password))->toBeTrue();

    $this->actingAs($owner)
        ->post('/organisation/onboarding', [
            ...$profile,
            'current_password' => 'password',
        ])
        ->assertRedirect(route('recruiter.dashboard', absolute: false));

    $owner->refresh();
    $organization->refresh();
    expect($organization->hasCompletedOnboarding())->toBeTrue()
        ->and($owner->must_change_password)->toBeFalse()
        ->and(Hash::check('NewPassword1', $owner->password))->toBeTrue();
});

test('a guest or student cannot change an organisation password from an open session', function () {
    $owner = organisationPasswordOwner(onboarded: true);

    $this->post('/organisation/onboarding', [
        'current_password' => 'password',
        'password' => 'NewPassword1',
        'password_confirmation' => 'NewPassword1',
    ])->assertRedirect(route('login', absolute: false));

    $student = User::factory()->create([
        'role' => ['student'],
        'email_verified_at' => now(),
    ]);

    $this->actingAs($student)
        ->post('/organisation/onboarding', [
            'current_password' => 'password',
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1',
        ])
        ->assertRedirect();

    $owner->refresh();
    expect($owner->must_change_password)->toBeTrue()
        ->and(Hash::check('password', $owner->password))->toBeTrue()
        ->and(Hash::check('NewPassword1', $owner->password))->toBeFalse();
});
