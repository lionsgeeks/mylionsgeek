<?php

use App\Models\Education;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function eduUser(): User
{
    return User::factory()->create([
        'role' => ['student'],
        'status' => 'Studying',
        'email_verified_at' => now(),
        'account_state' => 0,
    ]);
}

function eduPayload(array $overrides = []): array
{
    return array_merge([
        'institution' => 'ISTA NTIC',
        'degree' => 'Diploma',
        'field' => 'Web development',
        'start_month' => 9,
        'start_year' => 2020,
        'is_current' => false,
        'end_month' => 6,
        'end_year' => 2022,
        'description' => 'Full stack course',
    ], $overrides);
}

function eduFor(User $user, array $overrides = []): Education
{
    $education = Education::create(array_merge([
        'school' => 'Old School',
        'degree' => 'Bachelor',
        'field_of_study' => 'Math',
        'start_month' => '9',
        'start_year' => '2015',
        'end_month' => '6',
        'end_year' => '2018',
        'description' => 'Old description',
    ], $overrides));
    $user->educations()->attach($education->id);

    return $education;
}

function eduAs(User $user)
{
    Auth::forgetGuards();

    return test()->actingAs($user, 'sanctum');
}

test('anonymous users cannot create update or delete education', function () {
    $owner = eduUser();
    $education = eduFor($owner);

    $this->postJson('/api/mobile/profile/education', eduPayload())->assertUnauthorized();
    $this->putJson("/api/mobile/profile/education/{$education->id}", eduPayload())->assertUnauthorized();
    $this->deleteJson("/api/mobile/profile/education/{$education->id}")->assertUnauthorized();

    expect(Education::count())->toBe(1)
        ->and($education->fresh()->school)->toBe('Old School');
});

test('user can create an education and it is linked to them', function () {
    $user = eduUser();

    eduAs($user)->postJson('/api/mobile/profile/education', eduPayload())
        ->assertCreated()
        ->assertJsonPath('data.school', 'ISTA NTIC')
        ->assertJsonPath('data.field_of_study', 'Web development')
        ->assertJsonPath('data.start_year', '2020');

    $this->assertDatabaseHas('education', ['school' => 'ISTA NTIC', 'end_year' => '2022']);
    expect($user->educations()->count())->toBe(1);
});

test('optional fields can be omitted when creating', function () {
    $user = eduUser();

    eduAs($user)->postJson('/api/mobile/profile/education', [
        'institution' => 'Self taught',
        'start_month' => 1,
        'start_year' => 2021,
        'is_current' => true,
    ])->assertCreated();

    $this->assertDatabaseHas('education', [
        'school' => 'Self taught',
        'degree' => null,
        'end_year' => null,
    ]);
});

test('current education stores no end date', function () {
    $user = eduUser();

    eduAs($user)->postJson('/api/mobile/profile/education', eduPayload(['is_current' => true]))
        ->assertCreated()
        ->assertJsonPath('data.end_year', null)
        ->assertJsonPath('data.end_month', null);
});

test('create rejects invalid input and stores nothing', function (array $overrides, string $errorKey) {
    $user = eduUser();

    eduAs($user)->postJson('/api/mobile/profile/education', eduPayload($overrides))
        ->assertUnprocessable()
        ->assertJsonValidationErrors($errorKey);

    expect(Education::count())->toBe(0)
        ->and($user->educations()->count())->toBe(0);
})->with([
    'missing institution' => [['institution' => ''], 'institution'],
    'institution too long' => [['institution' => str_repeat('a', 256)], 'institution'],
    'description too long' => [['description' => str_repeat('a', 256)], 'description'],
    'start month out of range' => [['start_month' => 13], 'start_month'],
    'start year too old' => [['start_year' => 1800], 'start_year'],
    'start year in the future' => [['start_year' => 2999], 'start_year'],
    'end before start year' => [['start_year' => 2022, 'end_year' => 2020], 'end_year'],
    'end before start month same year' => [['start_year' => 2021, 'start_month' => 8, 'end_year' => 2021, 'end_month' => 3], 'end_year'],
    'missing end date when not current' => [['end_year' => null, 'end_month' => null], 'end_year'],
]);

test('owner can update their education', function () {
    $user = eduUser();
    $education = eduFor($user);

    eduAs($user)->putJson("/api/mobile/profile/education/{$education->id}", eduPayload([
        'institution' => 'New School',
    ]))
        ->assertOk()
        ->assertJsonPath('data.school', 'New School');

    expect($education->fresh()->school)->toBe('New School')
        ->and($education->fresh()->end_year)->toBe('2022');
});

test('marking an education as current clears its end date', function () {
    $user = eduUser();
    $education = eduFor($user);

    eduAs($user)->putJson("/api/mobile/profile/education/{$education->id}", [
        'is_current' => true,
    ])->assertOk();

    expect($education->fresh()->end_year)->toBeNull()
        ->and($education->fresh()->end_month)->toBeNull();
});

test('update rejects an end date before the stored start date', function () {
    $user = eduUser();
    $education = eduFor($user);

    eduAs($user)->putJson("/api/mobile/profile/education/{$education->id}", [
        'end_year' => 2010,
        'end_month' => 1,
    ])->assertUnprocessable()->assertJsonValidationErrors('end_year');

    expect($education->fresh()->end_year)->toBe('2018');
});

test('user cannot update or delete another users education', function () {
    $owner = eduUser();
    $attacker = eduUser();
    $education = eduFor($owner);

    eduAs($attacker)->putJson("/api/mobile/profile/education/{$education->id}", eduPayload([
        'institution' => 'Hacked',
    ]))->assertForbidden();

    eduAs($attacker)->deleteJson("/api/mobile/profile/education/{$education->id}")->assertForbidden();

    expect($education->fresh()->school)->toBe('Old School')
        ->and($owner->educations()->count())->toBe(1);
});

test('updating or deleting a missing education returns 404', function () {
    $user = eduUser();

    eduAs($user)->putJson('/api/mobile/profile/education/99999', eduPayload())->assertNotFound();
    eduAs($user)->deleteJson('/api/mobile/profile/education/99999')->assertNotFound();
});

test('non numeric id does not match the education routes', function () {
    $user = eduUser();

    eduAs($user)->deleteJson('/api/mobile/profile/education/abc')->assertNotFound();
});

test('owner can delete their education and the link is removed', function () {
    $user = eduUser();
    $education = eduFor($user);
    $other = eduFor($user, ['school' => 'Keep me']);

    eduAs($user)->deleteJson("/api/mobile/profile/education/{$education->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Education deleted');

    $this->assertDatabaseMissing('education', ['id' => $education->id]);
    $this->assertDatabaseMissing('education_user', ['education_id' => $education->id]);
    $this->assertDatabaseHas('education', ['id' => $other->id]);
});

test('profile endpoint returns the created education', function () {
    $user = eduUser();

    eduAs($user)->postJson('/api/mobile/profile/education', eduPayload())->assertCreated();

    eduAs($user)->getJson('/api/mobile/profile')
        ->assertOk()
        ->assertJsonPath('educations.0.school', 'ISTA NTIC');
});
