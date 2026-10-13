<?php

use App\Models\Organization;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('recruiter organisation workspace users are excluded from community broadcasts', function () {
    $owner = User::factory()->create(['role' => ['recruiter']]);
    Organization::query()->create([
        'email' => 'org@example.com',
        'account_user_id' => $owner->id,
        'account_state' => 0,
    ]);

    $employer = User::factory()->create(['role' => ['recruiter']]);
    $student = User::factory()->create(['role' => ['student']]);

    expect(Organization::userReceivesCommunityBroadcasts($owner))->toBeFalse()
        ->and(Organization::userReceivesCommunityBroadcasts($employer))->toBeFalse()
        ->and(Organization::userReceivesCommunityBroadcasts($student))->toBeTrue();
});
