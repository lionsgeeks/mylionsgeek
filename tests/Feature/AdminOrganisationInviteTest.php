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

test('inviting the same organisation email again is refused', function () {
    $admin = organisationInviteAdmin();

    $this->actingAs($admin)
        ->post('/admin/organisations', ['email' => 'acme@company.com'])
        ->assertSessionHasNoErrors();

    $this->actingAs($admin)
        ->from('/admin/organisations')
        ->post('/admin/organisations', ['email' => 'acme@company.com'])
        ->assertRedirect('/admin/organisations')
        ->assertSessionHasErrors('email');

    expect(Organization::query()->where('email', 'acme@company.com')->count())->toBe(1)
        ->and(User::query()->where('email', 'acme@company.com')->count())->toBe(1);
});

test('admin organisations list shows a pending invite without the activation token', function () {
    $admin = organisationInviteAdmin();

    $this->actingAs($admin)
        ->post('/admin/organisations', ['email' => 'pending-org@example.com']);

    $account = User::query()->where('email', 'pending-org@example.com')->first();
    $organization = Organization::query()->where('email', 'pending-org@example.com')->first();
    $tokenHash = (string) $account->getRawOriginal('activation_token');

    $this->actingAs($admin)
        ->get('/admin/organisations')
        ->assertOk()
        ->assertDontSee($tokenHash, false)
        ->assertInertia(fn ($page) => $page
            ->component('admin/organisations/index')
            ->where('organisations.0.invitation_status', 'pending')
            ->where('organisations.0.invitation_expired', false)
            ->missing('organisations.0.account.activation_token')
        );

    $this->actingAs($admin)
        ->get('/admin/organisations/'.$organization->id)
        ->assertOk()
        ->assertDontSee($tokenHash, false)
        ->assertInertia(fn ($page) => $page
            ->component('admin/organisations/[id]')
            ->where('organization.invitation_status', 'pending')
            ->where('organization.invitation_expired', false)
        );
});

test('admin can resend an expired organisation invitation and the previous link stops working', function () {
    $admin = organisationInviteAdmin();

    $this->actingAs($admin)
        ->post('/admin/organisations', ['email' => 'expired-org@example.com']);

    $account = User::query()->where('email', 'expired-org@example.com')->first();
    $organization = Organization::query()->where('email', 'expired-org@example.com')->first();

    $previousUrl = null;
    Mail::assertSent(OrganisationInvitedMail::class, function (OrganisationInvitedMail $mail) use (&$previousUrl, $account) {
        if (! $mail->hasTo($account->email)) {
            return false;
        }
        $previousUrl = $mail->completeProfileUrl;

        return true;
    });

    $account->forceFill(['activation_token_expires_at' => now()->subMinute()])->save();

    $this->actingAs($admin)
        ->get('/admin/organisations')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('organisations.0.invitation_status', 'pending')
            ->where('organisations.0.invitation_expired', true)
        );

    $this->actingAs($admin)
        ->from('/admin/organisations')
        ->post('/admin/organisations/'.$organization->id.'/resend-invitation')
        ->assertRedirect('/admin/organisations');

    $this->actingAs($admin)
        ->get('/admin/organisations')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('flash.success', 'Invitation email sent.'));

    $account->refresh();
    expect($account->hasPendingActivation())->toBeTrue()
        ->and($account->activation_token_expires_at?->isFuture())->toBeTrue()
        ->and(User::query()->where('email', 'expired-org@example.com')->count())->toBe(1);

    $resentUrl = Mail::sent(OrganisationInvitedMail::class)
        ->map(fn (OrganisationInvitedMail $mail) => $mail->completeProfileUrl)
        ->first(fn (string $url) => $url !== $previousUrl);

    expect($resentUrl)->not->toBeNull()
        ->and($resentUrl)->toContain('/organisation/invitation/');

    $this->flushSession();
    auth()->logout();

    $this->get($previousUrl)
        ->assertRedirect(route('login'));

    $this->assertGuest();

    $this->get($resentUrl)
        ->assertRedirect(route('organisation.onboarding', absolute: false));

    $this->assertAuthenticatedAs($account);
});

test('resend is refused after the organisation invitation is accepted', function () {
    $admin = organisationInviteAdmin();

    $this->actingAs($admin)
        ->post('/admin/organisations', ['email' => 'accepted-org@example.com']);

    $account = User::query()->where('email', 'accepted-org@example.com')->first();
    $organization = Organization::query()->where('email', 'accepted-org@example.com')->first();
    $account->consumeActivationToken();

    $this->actingAs($admin)
        ->from('/admin/organisations/'.$organization->id)
        ->post('/admin/organisations/'.$organization->id.'/resend-invitation')
        ->assertRedirect('/admin/organisations/'.$organization->id);

    $this->actingAs($admin)
        ->get('/admin/organisations/'.$organization->id)
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('flash.error', 'This invitation has already been accepted.')
            ->where('organization.invitation_status', 'accepted')
        );

    $account->refresh();
    expect($account->hasPendingActivation())->toBeFalse();

    $this->actingAs($admin)
        ->get('/admin/organisations')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('organisations.0.invitation_status', 'accepted')
            ->where('organisations.0.invitation_expired', false)
        );
});

test('guest cannot resend an organisation invitation', function () {
    $organization = Organization::query()->create([
        'email' => 'guest-resend@example.com',
        'account_state' => 0,
    ]);

    $this->post('/admin/organisations/'.$organization->id.'/resend-invitation')
        ->assertRedirect();

    Mail::assertNothingSent();
});

test('student cannot resend an organisation invitation', function () {
    $student = User::factory()->create([
        'role' => ['student'],
        'email_verified_at' => now(),
    ]);

    $organization = Organization::query()->create([
        'email' => 'student-resend@example.com',
        'account_state' => 0,
    ]);

    $this->actingAs($student)
        ->post('/admin/organisations/'.$organization->id.'/resend-invitation')
        ->assertRedirect();

    Mail::assertNothingSent();
});

test('resend reports a missing organisation account and a missing organisation', function () {
    $admin = organisationInviteAdmin();

    $organization = Organization::query()->create([
        'email' => 'no-account@example.com',
        'account_state' => 0,
    ]);

    $this->actingAs($admin)
        ->from('/admin/organisations')
        ->post('/admin/organisations/'.$organization->id.'/resend-invitation')
        ->assertRedirect('/admin/organisations');

    $this->actingAs($admin)
        ->get('/admin/organisations')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('flash.error', 'This organisation has no account to invite.'));

    Mail::assertNothingSent();

    $this->actingAs($admin)
        ->post('/admin/organisations/999999/resend-invitation')
        ->assertNotFound();
});

test('admin is told when a resent organisation invitation email fails', function () {
    $admin = organisationInviteAdmin();
    $account = User::factory()->create([
        'email' => 'fail-resend@example.com',
        'role' => ['recruiter'],
        'email_verified_at' => now(),
    ]);
    $account->issueActivationToken();

    $organization = Organization::query()->create([
        'email' => 'fail-resend@example.com',
        'account_user_id' => $account->id,
        'account_state' => 0,
    ]);

    $mailer = Mockery::mock(\Illuminate\Mail\MailManager::class);
    $mailer->shouldReceive('to')
        ->once()
        ->with('fail-resend@example.com')
        ->andThrow(new RuntimeException('smtp down'));
    Mail::swap($mailer);

    $this->actingAs($admin)
        ->from('/admin/organisations')
        ->post('/admin/organisations/'.$organization->id.'/resend-invitation')
        ->assertRedirect('/admin/organisations');

    $this->actingAs($admin)
        ->get('/admin/organisations')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where(
            'flash.error',
            'The invitation email could not be sent. Use Resend invitation to try again.',
        ));

    $account->refresh();
    expect($account->hasPendingActivation())->toBeTrue()
        ->and(Organization::query()->where('email', 'fail-resend@example.com')->count())->toBe(1);
});

test('organisation invitation resend is rate limited', function () {
    $admin = organisationInviteAdmin();

    $this->actingAs($admin)
        ->post('/admin/organisations', ['email' => 'limited-org@example.com']);

    $organization = Organization::query()->where('email', 'limited-org@example.com')->first();

    $this->actingAs($admin)->from('/admin/organisations');

    for ($attempt = 0; $attempt < 6; $attempt++) {
        $this->post('/admin/organisations/'.$organization->id.'/resend-invitation')
            ->assertRedirect('/admin/organisations');
    }

    $this->post('/admin/organisations/'.$organization->id.'/resend-invitation')
        ->assertStatus(429);
});
