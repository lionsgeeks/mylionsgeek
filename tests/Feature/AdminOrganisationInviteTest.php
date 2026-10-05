<?php

use App\Mail\OrganisationInvitedMail;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
    Mail::fake();
});

function organisationInviteAdmin(): User
{
    return User::factory()->create([
        'role' => ['admin'],
        'email_verified_at' => now(),
        'account_state' => 0,
    ]);
}

test('guest cannot invite an organisation', function () {
    $this->post('/admin/organisations', ['email' => 'org@example.com'])
        ->assertRedirect();

    expect(Organization::query()->where('email', 'org@example.com')->exists())->toBeFalse();
    Mail::assertNothingSent();
});

test('student cannot invite an organisation', function () {
    $student = User::factory()->create([
        'role' => ['student'],
        'email_verified_at' => now(),
    ]);

    $this->actingAs($student)
        ->post('/admin/organisations', ['email' => 'org@example.com'])
        ->assertRedirect();

    expect(Organization::query()->where('email', 'org@example.com')->exists())->toBeFalse();
    Mail::assertNothingSent();
});

test('admin invite creates organisation account and sends invitation mail after response', function () {
    $admin = organisationInviteAdmin();

    $response = $this->actingAs($admin)
        ->from('/admin/organisations')
        ->post('/admin/organisations', ['email' => 'neworg-invite@example.com']);

    $response->assertRedirect('/admin/organisations')
        ->assertSessionHasNoErrors();

    $organization = Organization::query()->where('email', 'neworg-invite@example.com')->first();
    expect($organization)->not->toBeNull()
        ->and($organization->account_user_id)->not->toBeNull();

    $account = User::query()->find($organization->account_user_id);
    expect($account)->not->toBeNull()
        ->and($account->email)->toBe('neworg-invite@example.com')
        ->and($account->role)->toBe(['recruiter'])
        ->and($account->must_change_password)->toBeTrue()
        ->and($account->hasPendingActivation())->toBeTrue();

    Mail::assertSent(OrganisationInvitedMail::class, function (OrganisationInvitedMail $mail) use ($account) {
        return $mail->hasTo($account->email)
            && str_contains($mail->completeProfileUrl, '/organisation/invitation/');
    });
});

test('organisation invitation link signs in and redirects to onboarding', function () {
    $admin = organisationInviteAdmin();

    $this->actingAs($admin)
        ->from('/admin/organisations')
        ->post('/admin/organisations', ['email' => 'link-test@example.com']);

    $account = User::query()->where('email', 'link-test@example.com')->first();
    expect($account)->not->toBeNull();

    $invitationUrl = null;
    Mail::assertSent(OrganisationInvitedMail::class, function (OrganisationInvitedMail $mail) use (&$invitationUrl, $account) {
        if (! $mail->hasTo($account->email)) {
            return false;
        }
        $invitationUrl = $mail->completeProfileUrl;

        return true;
    });

    expect($invitationUrl)->not->toBeNull();

    $this->get($invitationUrl)
        ->assertRedirect(route('organisation.onboarding', absolute: false));

    $this->assertAuthenticatedAs($account);
});
