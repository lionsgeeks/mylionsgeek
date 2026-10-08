<?php

use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('an organisation owner cannot invite an employer', function () {
    Mail::fake();

    $owner = User::factory()->create([
        'role' => ['recruiter'],
        'email' => 'owner@example.com',
        'email_verified_at' => now(),
        'account_state' => 0,
    ]);

    Organization::query()->create([
        'email' => 'owner@example.com',
        'enterprise_name' => 'Acme',
        'account_user_id' => $owner->id,
        'account_state' => 0,
        'onboarding_completed_at' => now(),
    ]);

    $this->actingAs($owner)
        ->post('/organisation/members', [
            'email' => 'new-employer@example.com',
            'name' => 'New Employer',
        ])
        ->assertStatus(405);

    expect(User::query()->where('email', 'new-employer@example.com')->exists())->toBeFalse();
    Mail::assertNothingSent();
});

test('a guest cannot invite an employer', function () {
    Mail::fake();

    $this->post('/organisation/members', [
        'email' => 'guest-employer@example.com',
        'name' => 'Guest Employer',
    ])->assertStatus(405);

    expect(User::query()->where('email', 'guest-employer@example.com')->exists())->toBeFalse();
    Mail::assertNothingSent();
});
