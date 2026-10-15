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

test('coach without can_add_users cannot create a user', function () {
    $coach = addUserActor(['coach']);
    $formation = Formation::query()->create(['name' => 'Coding', 'start_time' => null]);

    $this->actingAs($coach)
        ->from('/admin/users')
        ->post('/admin/users/store', addUserPayload($formation))
        ->assertForbidden();

    expect(User::query()->where('email', 'new.student@example.com')->exists())->toBeFalse();
});

test('coach with can_add_users can create a student', function () {
    $coach = addUserActor(['coach']);
    $coach->forceFill(['can_add_users' => 1])->save();
    $formation = Formation::query()->create(['name' => 'Coding', 'start_time' => null]);

    $this->actingAs($coach)
        ->from('/admin/users')
        ->post('/admin/users/store', addUserPayload($formation))
        ->assertRedirect('/admin/users');

    $created = User::query()->where('email', 'new.student@example.com')->first();

    expect($created)->not->toBeNull()
        ->and($created->normalizedRoles())->toBe(['student']);
});

test('coach with can_add_users cannot create an admin', function () {
    $coach = addUserActor(['coach']);
    $coach->forceFill(['can_add_users' => 1])->save();
    $formation = Formation::query()->create(['name' => 'Coding', 'start_time' => null]);

    $this->actingAs($coach)
        ->from('/admin/users')
        ->post('/admin/users/store', addUserPayload($formation, [
            'email' => 'elevated@example.com',
            'roles' => ['admin'],
        ]))
        ->assertForbidden();

    expect(User::query()->where('email', 'elevated@example.com')->exists())->toBeFalse();
});

test('admin can grant can_add_users on a coach profile', function () {
    $admin = addUserActor(['admin']);
    $coach = addUserActor(['coach']);

    $this->actingAs($admin)
        ->from('/admin/users/'.$coach->id)
        ->put('/students/update/'.$coach->id, [
            'can_add_users' => 1,
        ])
        ->assertRedirect();

    expect((int) $coach->fresh()->can_add_users)->toBe(1)
        ->and($coach->fresh()->canAddUsers())->toBeTrue();
});

test('coach cannot grant can_add_users on another coach', function () {
    $coach = addUserActor(['coach']);
    $coach->forceFill(['can_add_users' => 1])->save();
    $otherCoach = addUserActor(['coach']);

    $this->actingAs($coach)
        ->from('/admin/users/'.$otherCoach->id)
        ->put('/students/update/'.$otherCoach->id, [
            'can_add_users' => 1,
        ])
        ->assertRedirect();

    expect((int) $otherCoach->fresh()->can_add_users)->toBe(0);
});

test('editing a coach phone keeps can_add_users granted', function () {
    $admin = addUserActor(['admin']);
    $coach = addUserActor(['coach']);
    $coach->forceFill([
        'can_add_users' => 1,
        'access_studio' => 1,
        'access_cowork' => 1,
        'access_scan' => 1,
        'phone' => '0600000000',
    ])->save();

    $this->actingAs($admin)
        ->from('/admin/users/'.$coach->id)
        ->put('/students/update/'.$coach->id, [
            'phone' => '0612345678',
        ])
        ->assertRedirect();

    $coach->refresh();

    expect($coach->phone)->toBe('0612345678')
        ->and((int) $coach->can_add_users)->toBe(1)
        ->and((int) $coach->access_studio)->toBe(1)
        ->and((int) $coach->access_cowork)->toBe(1)
        ->and((int) $coach->access_scan)->toBe(1);
});

test('admin coach profile payload includes can_add_users and access flags', function () {
    $admin = addUserActor(['admin']);
    $coach = addUserActor(['coach']);
    $coach->forceFill([
        'can_add_users' => 1,
        'access_studio' => 1,
        'access_cowork' => 0,
        'access_scan' => 1,
    ])->save();

    $this->actingAs($admin)
        ->get('/admin/users/'.$coach->id)
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/[id]')
            ->where('user.can_add_users', 1)
            ->where('user.access_studio', 1)
            ->where('user.access_cowork', 0)
            ->where('user.access_scan', 1)
        );
});
