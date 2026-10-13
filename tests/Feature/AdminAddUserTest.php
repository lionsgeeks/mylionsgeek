<?php

use App\Models\Formation;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Mail::fake();
    $this->withoutVite();
});

function addUserActor(array $roles): User
{
    return User::factory()->create([
        'role' => $roles,
        'email_verified_at' => now(),
        'account_state' => 0,
    ]);
}

function addUserPayload(Formation $formation, array $overrides = []): array
{
    return array_merge([
        'name' => 'New Student',
        'email' => 'new.student@example.com',
        'gender' => 'female',
        'formation_id' => $formation->id,
        'access_studio' => 0,
        'access_cowork' => 1,
        'access_scan' => 0,
        'roles' => ['student'],
        'entreprise' => 'Should Not Save',
        'account_state' => 1,
    ], $overrides);
}

test('guest cannot create a user', function () {
    $formation = Formation::query()->create(['name' => 'Coding', 'start_time' => null]);

    $this->post('/admin/users/store', addUserPayload($formation))
        ->assertRedirect('/login');

    expect(User::query()->where('email', 'new.student@example.com')->exists())->toBeFalse();
});

test('student cannot create a user', function () {
    $student = addUserActor(['student']);
    $formation = Formation::query()->create(['name' => 'Coding', 'start_time' => null]);

    $this->actingAs($student)
        ->post('/admin/users/store', addUserPayload($formation))
        ->assertRedirect(route('student.feed'));

    expect(User::query()->where('email', 'new.student@example.com')->exists())->toBeFalse();
});

test('admin create requires gender and ignores a company name for students', function () {
    $admin = addUserActor(['admin']);
    $formation = Formation::query()->create(['name' => 'Coding', 'start_time' => null]);

    $this->actingAs($admin)
        ->from('/admin/users')
        ->post('/admin/users/store', addUserPayload($formation, ['gender' => '']))
        ->assertSessionHasErrors('gender');

    expect(User::query()->where('email', 'new.student@example.com')->exists())->toBeFalse();

    $this->actingAs($admin)
        ->from('/admin/users')
        ->post('/admin/users/store', addUserPayload($formation))
        ->assertRedirect('/admin/users');

    $created = User::query()->where('email', 'new.student@example.com')->first();

    expect($created)->not->toBeNull()
        ->and($created->gender)->toBe('female')
        ->and($created->entreprise)->toBeNull()
        ->and((int) $created->account_state)->toBe(0)
        ->and((int) $created->access_studio)->toBe(0)
        ->and((int) $created->access_scan)->toBe(0)
        ->and((int) $created->access_cowork)->toBe(1)
        ->and($created->normalizedRoles())->toBe(['student']);
});

test('admin create stores the company name for a recruiter', function () {
    $admin = addUserActor(['admin']);
    $formation = Formation::query()->create(['name' => 'Coding', 'start_time' => null]);

    $this->actingAs($admin)
        ->from('/admin/users')
        ->post('/admin/users/store', addUserPayload($formation, [
            'email' => 'recruiter@example.com',
            'name' => 'New Recruiter',
            'roles' => ['recruiter'],
            'gender' => 'male',
            'entreprise' => 'LionsGeek',
        ]))
        ->assertRedirect('/admin/users');

    $created = User::query()->where('email', 'recruiter@example.com')->first();

    expect($created->gender)->toBe('male')
        ->and($created->entreprise)->toBe('LionsGeek')
        ->and((int) $created->account_state)->toBe(0);
});
