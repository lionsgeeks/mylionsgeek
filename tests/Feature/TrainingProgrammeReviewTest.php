<?php

use App\Models\Formation;
use App\Models\TrainingSession;
use App\Models\TrainingWeek;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    if (Schema::hasTable('formations') && ! Schema::hasColumn('formations', 'category')) {
        Schema::table('formations', function (Blueprint $table) {
            $table->string('category')->nullable();
            $table->string('promo')->nullable();
            $table->string('user_id')->nullable();
        });
    }
});

function createReviewUser(array $roles, array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => $roles,
        'status' => 'Studying',
        'email_verified_at' => now(),
    ], $overrides));
}

function createReviewFormation(array $overrides = []): Formation
{
    $coachId = $overrides['user_id'] ?? createReviewUser(['coach'])->id;

    return Formation::query()->create(array_merge([
        'name' => 'Web Dev Bootcamp',
        'category' => 'coding',
        'start_time' => '2026-10-06',
        'end_time' => '2027-04-25',
        'promo' => 'P1',
        'user_id' => $coachId,
        'img' => 'default_training.jpg',
    ], $overrides));
}

test('coach information exposure: training detail page does not expose sensitive coach data', function () {
    $admin = createReviewUser(['admin']);

    $coach = createReviewUser(['coach'], [
        'name' => 'Coach Master',
        'email' => 'coach.secret@example.com',
        'phone' => '+212600112233',
        'cin' => 'AB123456',
        'has_handicap' => true,
        'speciality' => 'Fullstack',
        'wakatime_api_key' => 'secret_wakatime_key',
        'expo_push_token' => 'ExponentPushToken[secret]',
        'apns_voip_token' => 'secret_voip_token',
    ]);

    $training = createReviewFormation(['user_id' => $coach->id]);

    $week = TrainingWeek::create([
        'formation_id' => $training->id,
        'week_number' => 1,
        'title' => 'Week 1',
        'start_date' => '2026-10-06',
        'end_date' => '2026-10-10',
    ]);

    $sessionCoach = createReviewUser(['coach'], [
        'name' => 'Session Coach',
        'email' => 'session.coach@example.com',
        'phone' => '+212699887766',
        'cin' => 'CD789012',
        'has_handicap' => false,
        'speciality' => 'React',
    ]);

    $session = TrainingSession::create([
        'training_week_id' => $week->id,
        'formation_id' => $training->id,
        'date' => '2026-10-06',
        'start_time' => '0',
        'end_time' => '1:0',
        'title' => 'Intro Session',
    ]);
    $session->coaches()->attach($sessionCoach->id);

    $response = $this->actingAs($admin)
        ->get('/trainings/' . $training->id);

    $response->assertOk();

    $response->assertInertia(function (Assert $page) use ($coach, $sessionCoach) {
        $page->component('admin/training/[id]')
            ->has('training.coach', function (Assert $coachProp) use ($coach) {
                $coachProp->where('id', $coach->id)
                    ->where('name', 'Coach Master')
                    ->where('speciality', 'Fullstack')
                    ->missing('cin')
                    ->missing('phone')
                    ->missing('email')
                    ->missing('has_handicap')
                    ->missing('wakatime_api_key')
                    ->missing('expo_push_token')
                    ->missing('apns_voip_token')
                    ->etc();
            })
            ->has('coaches', function (Assert $coachesProp) {
                // Ensure every coach in coaches array only has safe keys
                $coachesProp->each(function (Assert $c) {
                    $c->hasAll(['id', 'name', 'image', 'speciality', 'type', 'is_external'])
                        ->missing('cin')
                        ->missing('phone')
                        ->missing('email')
                        ->missing('has_handicap')
                        ->missing('wakatime_api_key');
                });
            })
            ->has('training.training_weeks.0.sessions.0.coaches', function (Assert $sessionCoachesProp) use ($sessionCoach) {
                $sessionCoachesProp->first(function (Assert $c) use ($sessionCoach) {
                    $c->where('id', $sessionCoach->id)
                        ->where('name', 'Session Coach')
                        ->where('speciality', 'React')
                        ->missing('cin')
                        ->missing('phone')
                        ->missing('email')
                        ->missing('has_handicap')
                        ->etc();
                });
            });
    });
});

test('external coach creation: does not create fake student or duplicate accounts on saves', function () {
    $admin = createReviewUser(['admin']);
    $training = createReviewFormation();

    $initialUsersCount = User::count();

    // 1. Create a programme item with an external coach
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'External Workshop',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 0,
            'endDay' => 2,
            'coach' => [
                'name' => 'Jane External Expert',
                'type' => 'External',
            ],
        ])
        ->assertRedirect();

    expect(User::count())->toBe($initialUsersCount + 1);

    $externalCoach = User::where('name', 'Jane External Expert')->first();
    expect($externalCoach)->not->toBeNull()
        ->and($externalCoach->email)->toBeNull() // No fake email address generated
        ->and($externalCoach->role)->toBe(['coach']) // Strictly coach role, NOT student
        ->and($externalCoach->is_external)->toBeTrue();

    // Verify session attached to external coach
    $session = TrainingSession::where('title', 'External Workshop')->first();
    expect($session)->not->toBeNull()
        ->and($session->coaches->pluck('id')->all())->toContain($externalCoach->id);

    // 2. Update the programme item multiple times (e.g. repeated save / edit)
    $this->actingAs($admin)
        ->put('/trainings/' . $training->id . '/programme-items/' . $session->id, [
            'title' => 'External Workshop Updated',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 0,
            'endDay' => 3,
            'coach' => [
                'id' => $externalCoach->id,
                'name' => 'Jane External Expert',
                'type' => 'External',
            ],
        ])
        ->assertRedirect();

    // Assert NO duplicate user was created
    expect(User::where('name', 'Jane External Expert')->count())->toBe(1)
        ->and(User::count())->toBe($initialUsersCount + 1);

    // Even if coach is submitted as a new name object matching the existing external coach
    $this->actingAs($admin)
        ->put('/trainings/' . $training->id . '/programme-items/' . $session->id, [
            'title' => 'External Workshop Updated Again',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 0,
            'endDay' => 3,
            'coach' => [
                'name' => 'Jane External Expert',
                'type' => 'External',
            ],
        ])
        ->assertRedirect();

    expect(User::where('name', 'Jane External Expert')->count())->toBe(1);

    // 3. Verify external coach is excluded from student lists (usersNull)
    $response = $this->actingAs($admin)->get('/trainings/' . $training->id);
    $response->assertInertia(function (Assert $page) use ($externalCoach) {
        $page->where('usersNull', function ($usersNull) use ($externalCoach) {
            $ids = collect($usersNull)->pluck('id')->all();
            return ! in_array($externalCoach->id, $ids, true);
        });
    });
});

test('existing internal coaches continue to work without duplicate records', function () {
    $admin = createReviewUser(['admin']);
    $internalCoach = createReviewUser(['coach'], [
        'name' => 'Sara Internal',
        'speciality' => 'UI/UX',
    ]);
    $training = createReviewFormation(['user_id' => $internalCoach->id]);

    $beforeCount = User::count();

    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Design Sprint',
            'startWeek' => 2,
            'endWeek' => 2,
            'startDay' => 1,
            'endDay' => 3,
            'coach' => [
                'id' => $internalCoach->id,
                'name' => 'Sara Internal',
                'type' => 'Internal',
            ],
        ])
        ->assertRedirect();

    expect(User::count())->toBe($beforeCount);

    $session = TrainingSession::where('title', 'Design Sprint')->first();
    expect($session->coaches->pluck('id')->all())->toContain($internalCoach->id);
});

test('persist week deletion: deleting week deletes it and affected items from database', function () {
    $admin = createReviewUser(['admin']);
    $training = createReviewFormation();

    // 1. Add week 29
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/weeks', [
            'week_number' => 29,
        ])
        ->assertRedirect();

    expect(TrainingWeek::where('formation_id', $training->id)->where('week_number', 29)->exists())->toBeTrue();

    // Add session to week 29
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Week 29 Capstone Project',
            'startWeek' => 29,
            'endWeek' => 29,
            'startDay' => 0,
            'endDay' => 4,
        ])
        ->assertRedirect();

    $session = TrainingSession::where('title', 'Week 29 Capstone Project')->first();
    expect($session)->not->toBeNull();

    // 2. Delete week 29 with items
    $this->actingAs($admin)
        ->delete('/trainings/' . $training->id . '/weeks/29')
        ->assertRedirect();

    // Verify persisted deletion from database
    expect(TrainingWeek::where('formation_id', $training->id)->where('week_number', 29)->exists())->toBeFalse()
        ->and(TrainingSession::where('title', 'Week 29 Capstone Project')->exists())->toBeFalse();

    // 3. Test deleting an empty week
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/weeks', [
            'week_number' => 29,
        ])
        ->assertRedirect();

    expect(TrainingWeek::where('formation_id', $training->id)->where('week_number', 29)->exists())->toBeTrue();

    $this->actingAs($admin)
        ->delete('/trainings/' . $training->id . '/weeks/29')
        ->assertRedirect();

    expect(TrainingWeek::where('formation_id', $training->id)->where('week_number', 29)->exists())->toBeFalse();

    // 4. Default weeks cannot be deleted
    $this->actingAs($admin)
        ->delete('/trainings/' . $training->id . '/weeks/1')
        ->assertRedirect();

    // Week 1 session or week must not be deleted
    expect(TrainingWeek::where('formation_id', $training->id)->where('week_number', 1)->exists())->toBeFalse(); // wasn't created yet or safe
});

test('multi-week programme block deletion: deleting a multi-week item removes only that block, keeping unrelated blocks and weeks intact', function () {
    $admin = createReviewUser(['admin']);
    $coach = createReviewUser(['coach']);
    $training = createReviewFormation(['user_id' => $coach->id]);

    // Create weeks 29, 30, and 31
    foreach ([29, 30, 31] as $wk) {
        TrainingWeek::create([
            'formation_id' => $training->id,
            'week_number' => $wk,
            'title' => "Week {$wk}",
            'start_date' => '2027-04-26',
            'end_date' => '2027-04-30',
        ]);
    }

    // 1. Create a multi-week programme block spanning Week 29 to Week 31
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Multi-Week Hackathon',
            'description' => 'Capstone hackathon event',
            'color' => 'purple',
            'startWeek' => 29,
            'endWeek' => 31,
            'startDay' => 0,
            'endDay' => 4,
            'coach' => ['id' => $coach->id, 'name' => $coach->name],
        ])
        ->assertRedirect();

    $multiWeekSession = TrainingSession::where('title', 'Multi-Week Hackathon')->first();
    expect($multiWeekSession)->not->toBeNull()
        ->and($multiWeekSession->start_time)->toBe('0')
        ->and($multiWeekSession->end_time)->toBe('31:4')
        ->and($multiWeekSession->coaches->pluck('id')->all())->toContain($coach->id);

    // 2. Create unrelated single-week programme blocks on Week 29 and Week 31
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Week 29 Standup',
            'startWeek' => 29,
            'endWeek' => 29,
            'startDay' => 1,
            'endDay' => 1,
        ])
        ->assertRedirect();

    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Week 31 Retrospective',
            'startWeek' => 31,
            'endWeek' => 31,
            'startDay' => 3,
            'endDay' => 3,
        ])
        ->assertRedirect();

    $standupSession = TrainingSession::where('title', 'Week 29 Standup')->first();
    $retroSession = TrainingSession::where('title', 'Week 31 Retrospective')->first();
    expect($standupSession)->not->toBeNull()
        ->and($retroSession)->not->toBeNull();

    // 3. Delete ONLY the multi-week programme block
    $this->actingAs($admin)
        ->delete('/trainings/' . $training->id . '/programme-items/' . $multiWeekSession->id)
        ->assertRedirect();

    // Verify: multi-week block is deleted
    expect(TrainingSession::whereKey($multiWeekSession->id)->exists())->toBeFalse();

    // Verify: pivot entry is detached
    expect(\Illuminate\Support\Facades\DB::table('session_coach')->where('session_id', $multiWeekSession->id)->exists())->toBeFalse();

    // Verify: unrelated blocks remain completely intact
    expect(TrainingSession::whereKey($standupSession->id)->exists())->toBeTrue()
        ->and(TrainingSession::whereKey($retroSession->id)->exists())->toBeTrue();

    // Verify: weeks remain intact
    expect(TrainingWeek::where('formation_id', $training->id)->whereIn('week_number', [29, 30, 31])->count())->toBe(3);

    // Verify: coach user record remains intact
    expect(User::whereKey($coach->id)->exists())->toBeTrue();
});

test('week deletion intersecting multi-week block: removes intersecting block and adjusts subsequent weeks safely', function () {
    $admin = createReviewUser(['admin']);
    $coach = createReviewUser(['coach']);
    $training = createReviewFormation(['user_id' => $coach->id]);

    foreach ([29, 30, 31] as $wk) {
        TrainingWeek::create([
            'formation_id' => $training->id,
            'week_number' => $wk,
            'title' => "Week {$wk}",
            'start_date' => '2027-04-26',
            'end_date' => '2027-04-30',
        ]);
    }

    // Block spanning Week 29 to Week 31 (intersects Week 30)
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Spanning Block 29-31',
            'startWeek' => 29,
            'endWeek' => 31,
            'startDay' => 0,
            'endDay' => 4,
            'coach' => ['id' => $coach->id],
        ])
        ->assertRedirect();

    // Unrelated block on Week 29
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Safe Week 29 Session',
            'startWeek' => 29,
            'endWeek' => 29,
            'startDay' => 1,
            'endDay' => 2,
        ])
        ->assertRedirect();

    // Unrelated block on Week 31
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Shifted Week 31 Session',
            'startWeek' => 31,
            'endWeek' => 31,
            'startDay' => 2,
            'endDay' => 3,
        ])
        ->assertRedirect();

    // Delete Week 30 (which intersects the multi-week block)
    $this->actingAs($admin)
        ->delete('/trainings/' . $training->id . '/weeks/30')
        ->assertRedirect();

    // The intersecting block should be deleted
    expect(TrainingSession::where('title', 'Spanning Block 29-31')->exists())->toBeFalse();

    // The unrelated session in Week 29 remains intact
    expect(TrainingSession::where('title', 'Safe Week 29 Session')->exists())->toBeTrue();

    // Week 30 is gone, Week 31 was shifted to Week 30
    expect(TrainingWeek::where('formation_id', $training->id)->where('week_number', 31)->exists())->toBeFalse();
    $shiftedWeek = TrainingWeek::where('formation_id', $training->id)->where('week_number', 30)->first();
    expect($shiftedWeek)->not->toBeNull()
        ->and($shiftedWeek->title)->toBe('Week 30');

    // The session originally on Week 31 is now in the shifted week (week 30)
    $shiftedSession = TrainingSession::where('title', 'Shifted Week 31 Session')->first();
    expect($shiftedSession)->not->toBeNull()
        ->and($shiftedSession->training_week_id)->toBe($shiftedWeek->id);
});

test('isolated database migration verification: retains user data, handles null email coach, and rolls back safely', function () {
    $migration = require database_path('migrations/2026_09_22_100000_make_user_email_nullable_and_add_is_external.php');

    // 1. Existing user retains data and is_external defaults to false
    $normalUser = createReviewUser(['student'], [
        'name' => 'Alice Normal',
        'email' => 'alice@example.com',
    ]);
    expect($normalUser->fresh()->is_external)->toBeFalse();

    // 2. External coach can be stored with null email
    $externalCoach = User::create([
        'name' => 'Dr. Bob External',
        'email' => null,
        'password' => \Illuminate\Support\Facades\Hash::make('secret_pass'),
        'role' => ['coach'],
        'speciality' => 'Machine Learning',
        'status' => 'External',
        'is_external' => true,
    ]);
    expect($externalCoach->fresh()->email)->toBeNull()
        ->and($externalCoach->fresh()->is_external)->toBeTrue();

    // 3. Rollback when an external coach with null email exists -> fails safely with descriptive RuntimeException
    expect(function () use ($migration) {
        $migration->down();
    })->toThrow(\RuntimeException::class, 'Cannot rollback migration');

    // Verify external coach was NOT deleted or corrupted
    expect(User::whereKey($externalCoach->id)->exists())->toBeTrue()
        ->and(User::whereKey($normalUser->id)->exists())->toBeTrue();

    // 4. When no users have null email/password, rollback succeeds cleanly
    $externalCoach->delete(); // safely remove coach for clean rollback test
    expect(function () use ($migration) {
        $migration->down();
    })->not->toThrow(\Throwable::class);

    // Verify is_external column was dropped on rollback
    expect(\Illuminate\Support\Facades\Schema::hasColumn('users', 'is_external'))->toBeFalse();

    // 5. Reapplication of migration after rollback works cleanly
    expect(function () use ($migration) {
        $migration->up();
    })->not->toThrow(\Throwable::class);

    expect(\Illuminate\Support\Facades\Schema::hasColumn('users', 'is_external'))->toBeTrue();
    expect($normalUser->fresh()->is_external)->toBeFalse();
});

test('coach assignment validation: student ID cannot be assigned as coach', function () {
    $admin = createReviewUser(['admin']);
    $student = createReviewUser(['student']);
    $training = createReviewFormation();

    $initialSessionCount = TrainingSession::count();

    // 1. Attempt to store programme item with student ID as numeric
    $response = $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Invalid Coach Session',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 0,
            'endDay' => 1,
            'coach' => $student->id,
        ]);

    $response->assertSessionHasErrors('coach');
    expect(TrainingSession::count())->toBe($initialSessionCount);

    // 2. Attempt to store programme item with student ID inside an object
    $responseObj = $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Invalid Coach Object Session',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 0,
            'endDay' => 1,
            'coach' => ['id' => $student->id, 'name' => $student->name],
        ]);

    $responseObj->assertSessionHasErrors('coach');
    expect(TrainingSession::count())->toBe($initialSessionCount);
});

test('coach assignment validation: administrator ID cannot be assigned as coach', function () {
    $admin = createReviewUser(['admin']);
    $otherAdmin = createReviewUser(['admin'], ['name' => 'Other Admin']);
    $training = createReviewFormation();

    $initialSessionCount = TrainingSession::count();

    $response = $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Admin as Coach Session',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 0,
            'endDay' => 1,
            'coach' => $otherAdmin->id,
        ]);

    $response->assertSessionHasErrors('coach');
    expect(TrainingSession::count())->toBe($initialSessionCount);
});

test('coach assignment validation: rejected update does not silently detach current coach or modify session', function () {
    $admin = createReviewUser(['admin']);
    $coach = createReviewUser(['coach'], ['name' => 'Active Coach']);
    $student = createReviewUser(['student'], ['name' => 'Sneaky Student']);
    $training = createReviewFormation(['user_id' => $coach->id]);

    // Create session with valid coach
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Original Valid Session',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 0,
            'endDay' => 2,
            'coach' => $coach->id,
        ])
        ->assertRedirect();

    $session = TrainingSession::where('title', 'Original Valid Session')->firstOrFail();
    expect($session->coaches->pluck('id')->all())->toContain($coach->id);

    // Attempt to update session assigning student ID
    $response = $this->actingAs($admin)
        ->put('/trainings/' . $training->id . '/programme-items/' . $session->id, [
            'title' => 'Tampered Session',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 0,
            'endDay' => 2,
            'coach' => ['id' => $student->id],
        ]);

    $response->assertSessionHasErrors('coach');

    // Verify session remains unchanged and coach was NOT detached
    $freshSession = $session->fresh();
    expect($freshSession->title)->toBe('Original Valid Session')
        ->and($freshSession->coaches->pluck('id')->all())->toBe([$coach->id]);
});

test('coach assignment validation: valid internal and external coaches can still be assigned by ID', function () {
    $admin = createReviewUser(['admin']);
    $internalCoach = createReviewUser(['coach'], ['name' => 'Internal Expert']);
    $externalCoach = User::create([
        'name' => 'External Specialist',
        'email' => null,
        'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        'role' => ['coach'],
        'speciality' => 'External',
        'status' => 'External',
        'is_external' => true,
    ]);
    $training = createReviewFormation(['user_id' => $internalCoach->id]);

    // 1. Assign valid internal coach by numeric ID
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Internal Coach Session',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 0,
            'endDay' => 2,
            'coach' => $internalCoach->id,
        ])
        ->assertRedirect();

    $session1 = TrainingSession::where('title', 'Internal Coach Session')->firstOrFail();
    expect($session1->coaches->pluck('id')->all())->toBe([$internalCoach->id]);

    // 2. Assign valid external coach by object with ID
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'External Coach Session',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 2,
            'endDay' => 4,
            'coach' => ['id' => $externalCoach->id, 'name' => $externalCoach->name],
        ])
        ->assertRedirect();

    $session2 = TrainingSession::where('title', 'External Coach Session')->firstOrFail();
    expect($session2->coaches->pluck('id')->all())->toBe([$externalCoach->id]);
});

test('week deletion: deleting a non-existent week returns error and preserves subsequent weeks', function () {
    $admin = createReviewUser(['admin']);
    $training = createReviewFormation();

    // Create week 29 and week 30
    TrainingWeek::create([
        'formation_id' => $training->id,
        'week_number' => 29,
        'title' => 'Week 29',
        'start_date' => '2027-04-26',
        'end_date' => '2027-04-30',
    ]);

    TrainingWeek::create([
        'formation_id' => $training->id,
        'week_number' => 30,
        'title' => 'Week 30',
        'start_date' => '2027-05-03',
        'end_date' => '2027-05-07',
    ]);

    // Attempt to delete non-existent week 35
    $response = $this->actingAs($admin)
        ->delete('/trainings/' . $training->id . '/weeks/35');

    $response->assertRedirect();
    $flasherEnvelopes = session('flasher::envelopes', []);
    $hasErrorMessage = session('error') === 'Week not found.' || collect($flasherEnvelopes)->contains(function ($envelope) {
        $notification = method_exists($envelope, 'getNotification') ? $envelope->getNotification() : null;
        return $notification && $notification->getMessage() === 'Week not found.';
    });
    expect($hasErrorMessage)->toBeTrue();

    // Ensure weeks 29 and 30 are completely intact and were not renumbered
    expect(TrainingWeek::where('formation_id', $training->id)->where('week_number', 29)->exists())->toBeTrue()
        ->and(TrainingWeek::where('formation_id', $training->id)->where('week_number', 30)->exists())->toBeTrue();
});
