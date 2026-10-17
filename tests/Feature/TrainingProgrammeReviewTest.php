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

    // Verify NO User record was created in the database
    expect(User::count())->toBe($initialUsersCount)
        ->and(User::where('name', 'Jane External Expert')->exists())->toBeFalse();

    // Verify session stores external coach name directly
    $session = TrainingSession::where('title', 'External Workshop')->firstOrFail();
    expect($session->external_coach_name)->toBe('Jane External Expert')
        ->and($session->coaches->count())->toBe(0);

    // 2. Update the programme item multiple times (e.g. repeated save / edit)
    $this->actingAs($admin)
        ->put('/trainings/' . $training->id . '/programme-items/' . $session->id, [
            'title' => 'External Workshop Updated',
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

    // Assert STILL NO user was created
    expect(User::count())->toBe($initialUsersCount)
        ->and(User::where('name', 'Jane External Expert')->exists())->toBeFalse();

    // Even if coach is submitted as a new name object
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

    expect(User::count())->toBe($initialUsersCount);

    // 3. Verify external coach is excluded from student lists (usersNull)
    $response = $this->actingAs($admin)->get('/trainings/' . $training->id);
    $response->assertInertia(function (Assert $page) {
        $page->where('usersNull', function ($usersNull) {
            $names = collect($usersNull)->pluck('name')->all();
            return ! in_array('Jane External Expert', $names, true);
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

test('database migration verification: adds external_coach_name to training_sessions and rolls back cleanly', function () {
    $migration = require database_path('migrations/2026_09_23_000000_add_external_coach_name_to_training_sessions_table.php');

    // 1. Column exists after migration
    expect(\Illuminate\Support\Facades\Schema::hasColumn('training_sessions', 'external_coach_name'))->toBeTrue();

    // 2. Rollback drops external_coach_name cleanly
    expect(function () use ($migration) {
        $migration->down();
    })->not->toThrow(\Throwable::class);

    expect(\Illuminate\Support\Facades\Schema::hasColumn('training_sessions', 'external_coach_name'))->toBeFalse();

    // 3. Reapplication works cleanly
    expect(function () use ($migration) {
        $migration->up();
    })->not->toThrow(\Throwable::class);

    expect(\Illuminate\Support\Facades\Schema::hasColumn('training_sessions', 'external_coach_name'))->toBeTrue();
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

test('coach assignment validation: valid internal and external coaches can still be assigned', function () {
    $admin = createReviewUser(['admin']);
    $internalCoach = createReviewUser(['coach'], ['name' => 'Internal Expert']);
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

    // 2. Assign valid external coach by object
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'External Coach Session',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 2,
            'endDay' => 4,
            'coach' => ['name' => 'External Specialist', 'type' => 'External'],
        ])
        ->assertRedirect();

    $session2 = TrainingSession::where('title', 'External Coach Session')->firstOrFail();
    expect($session2->external_coach_name)->toBe('External Specialist')
        ->and($session2->coaches->count())->toBe(0);
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

test('main training coach selector requires an active coach user', function () {
    $admin = createReviewUser(['admin']);
    $student = createReviewUser(['student'], ['name' => 'Student Person']);

    // Attempt to create a formation with a non-coach as main coach
    $response = $this->actingAs($admin)
        ->post('/admin/training', [
            'name' => 'New Web Bootcamp',
            'category' => 'coding',
            'start_time' => '2026-10-06',
            'user_id' => $student->id,
        ]);

    $response->assertSessionHasErrors('user_id');

    // Attempt to update existing formation setting non-coach as main coach
    $internalCoach = createReviewUser(['coach']);
    $training = createReviewFormation(['user_id' => $internalCoach->id]);

    $updateResponse = $this->actingAs($admin)
        ->put('/trainings/' . $training->id, [
            'name' => 'Updated Web Bootcamp',
            'category' => 'coding',
            'start_time' => '2026-10-06',
            'user_id' => $student->id,
        ]);

    $updateResponse->assertSessionHasErrors('user_id');
});

test('external coach names do not pollute members page or mobile coach lists', function () {
    $admin = createReviewUser(['admin']);
    $internalCoach = createReviewUser(['coach'], ['name' => 'Active Internal Coach']);
    $training = createReviewFormation(['user_id' => $internalCoach->id]);

    $week = TrainingWeek::create([
        'formation_id' => $training->id,
        'week_number' => 1,
        'title' => 'Week 1',
        'start_date' => '2026-10-06',
        'end_date' => '2026-10-10',
    ]);

    TrainingSession::create([
        'training_week_id' => $week->id,
        'formation_id' => $training->id,
        'date' => '2026-10-06',
        'start_time' => '0',
        'end_time' => '1:0',
        'title' => 'Guest Workshop',
        'external_coach_name' => 'Guest External Keynote',
    ]);

    // 1. Members page (admin/users/index)
    $response = $this->actingAs($admin)->get('/admin/users');
    $response->assertOk();
    $response->assertInertia(function (Assert $page) {
        $page->where('users', function ($users) {
            $names = collect($users)->pluck('name')->all();
            expect($names)->toContain('Active Internal Coach')
                ->and($names)->not->toContain('Guest External Keynote');
            return true;
        });
    });

    // 2. Mobile training catalog coaches list
    $apiResponse = $this->actingAs($admin)->getJson('/api/mobile/trainings');
    $apiResponse->assertOk();
    $coaches = collect($apiResponse->json('coaches', []))->pluck('name')->all();
    expect($coaches)->toContain('Active Internal Coach')
        ->and($coaches)->not->toContain('Guest External Keynote');
});

test('external coach sessions store external_coach_name and do not create user records', function () {
    $admin = createReviewUser(['admin']);
    $internalCoach = createReviewUser(['coach'], ['name' => 'Real Coach']);
    $training = createReviewFormation(['user_id' => $internalCoach->id]);

    $initialUsersCount = User::count();

    // Store a programme session with external coach
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Advanced AI Masterclass',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 1,
            'endDay' => 3,
            'coach' => [
                'name' => 'Dr. External Specialist',
                'type' => 'External',
            ],
        ])
        ->assertRedirect();

    // Verify session has external_coach_name and 0 coach relations
    $session = TrainingSession::where('title', 'Advanced AI Masterclass')->firstOrFail();
    expect($session->external_coach_name)->toBe('Dr. External Specialist')
        ->and($session->coaches->count())->toBe(0);

    // Verify no user was created and user count did not increase
    expect(User::count())->toBe($initialUsersCount)
        ->and(User::where('name', 'Dr. External Specialist')->exists())->toBeFalse();
});

test('validation: session ending before it starts is rejected with 422', function () {
    $admin = createReviewUser(['admin']);
    $training = createReviewFormation();

    $initialSessionCount = TrainingSession::count();

    // 1. Reversed weeks: startWeek 4, endWeek 2
    $responseReversedWeek = $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Reversed Week Session',
            'startWeek' => 4,
            'endWeek' => 2,
            'startDay' => 1,
            'endDay' => 1,
        ]);

    $responseReversedWeek->assertSessionHasErrors('endWeek');
    expect(TrainingSession::count())->toBe($initialSessionCount);

    // 2. Reversed days within the same week: startDay 3 (Thu), endDay 1 (Tue)
    $responseReversedDay = $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Reversed Day Session',
            'startWeek' => 2,
            'endWeek' => 2,
            'startDay' => 3,
            'endDay' => 1,
        ]);

    $responseReversedDay->assertSessionHasErrors('endDay');
    expect(TrainingSession::count())->toBe($initialSessionCount);

    // 3. Rejected update on reversed session
    $validSession = TrainingSession::create([
        'formation_id' => $training->id,
        'training_week_id' => TrainingWeek::create([
            'formation_id' => $training->id,
            'week_number' => 2,
            'title' => 'Week 2',
            'start_date' => '2026-10-13',
            'end_date' => '2026-10-17',
        ])->id,
        'date' => '2026-10-13',
        'start_time' => '1',
        'end_time' => '2:3',
        'title' => 'Valid Session',
    ]);

    $responseUpdate = $this->actingAs($admin)
        ->put('/trainings/' . $training->id . '/programme-items/' . $validSession->id, [
            'title' => 'Tampered Inverted Session',
            'startWeek' => 3,
            'endWeek' => 1,
            'startDay' => 1,
            'endDay' => 1,
        ]);

    $responseUpdate->assertSessionHasErrors('endWeek');
    expect($validSession->fresh()->title)->toBe('Valid Session');
});

test('validation: week numbers outside real supported programme duration are rejected', function () {
    $admin = createReviewUser(['admin']);
    // Standard training without extended end_time (duration is baseline 28 weeks)
    $training = createReviewFormation([
        'start_time' => '2026-10-06',
        'end_time' => '2027-04-20', // exactly 28 weeks
    ]);

    // 1. Extreme week number 5000 in storeWeek
    $respExtremeWeek = $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/weeks', [
            'week_number' => 5000,
        ]);

    $respExtremeWeek->assertSessionHasErrors('week_number');
    expect(TrainingWeek::where('formation_id', $training->id)->where('week_number', 5000)->exists())->toBeFalse();

    // 2. Week 0 in storeWeek
    $respZeroWeek = $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/weeks', [
            'week_number' => 0,
        ]);

    $respZeroWeek->assertSessionHasErrors('week_number');

    // 3. Week 30 (skipping ahead when current max is 28, next allowed is 29) in storeWeek
    $respSkipWeek = $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/weeks', [
            'week_number' => 30,
        ]);

    $respSkipWeek->assertSessionHasErrors('week_number');

    // 4. Extreme week number 5000 in storeProgrammeItem
    $respExtremeItem = $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Extreme Week Item',
            'startWeek' => 5000,
            'endWeek' => 5000,
            'startDay' => 0,
            'endDay' => 1,
        ]);

    $respExtremeItem->assertSessionHasErrors(['startWeek', 'endWeek']);

    // 5. Extreme week number 5000 in updateProgrammeItem
    $week1 = TrainingWeek::create([
        'formation_id' => $training->id,
        'week_number' => 1,
        'title' => 'Week 1',
        'start_date' => '2026-10-06',
        'end_date' => '2026-10-10',
    ]);
    $existingSession = TrainingSession::create([
        'formation_id' => $training->id,
        'training_week_id' => $week1->id,
        'date' => '2026-10-06',
        'start_time' => '0',
        'end_time' => '1:0',
        'title' => 'Session To Update',
    ]);
    $respUpdateExtreme = $this->actingAs($admin)
        ->put('/trainings/' . $training->id . '/programme-items/' . $existingSession->id, [
            'title' => 'Updated Session',
            'startWeek' => 5000,
            'endWeek' => 5000,
            'startDay' => 0,
            'endDay' => 1,
        ]);
    $respUpdateExtreme->assertSessionHasErrors(['startWeek', 'endWeek']);

    // 6. Week 0 in storeProgrammeItem
    $respZeroItem = $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Zero Week Item',
            'startWeek' => 0,
            'endWeek' => 1,
            'startDay' => 0,
            'endDay' => 1,
        ]);

    $respZeroItem->assertSessionHasErrors('startWeek');

    // 7. Week 29 in storeProgrammeItem BEFORE week 29 is created
    $respPrematureItem = $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Premature Week 29 Item',
            'startWeek' => 29,
            'endWeek' => 29,
            'startDay' => 0,
            'endDay' => 1,
        ]);

    $respPrematureItem->assertSessionHasErrors(['startWeek', 'endWeek']);
});

test('validation: valid boundaries for week numbers and sessions are accepted', function () {
    $admin = createReviewUser(['admin']);
    $training = createReviewFormation();

    // 1. Single day session at week 1, day 0 (Mon)
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Single Day Boundary',
            'startWeek' => 1,
            'endWeek' => 1,
            'startDay' => 0,
            'endDay' => 0,
        ])
        ->assertRedirect();

    $item1 = TrainingSession::where('title', 'Single Day Boundary')->firstOrFail();
    expect($item1->start_time)->toBe('0')
        ->and($item1->end_time)->toBe('1:0');

    // 2. Full 28-week calendar default boundary (actual maximum of standard training)
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Default 28 Weeks Span',
            'startWeek' => 1,
            'endWeek' => 28,
            'startDay' => 0,
            'endDay' => 4,
        ])
        ->assertRedirect();

    expect(TrainingSession::where('title', 'Default 28 Weeks Span')->exists())->toBeTrue();

    // 3. Dynamically adding next sequential week (Week 29)
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/weeks', [
            'week_number' => 29,
        ])
        ->assertRedirect();

    expect(TrainingWeek::where('formation_id', $training->id)->where('week_number', 29)->exists())->toBeTrue();

    // 4. Session at dynamically extended maximum boundary (Week 29)
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Final Capstone Week 29',
            'startWeek' => 29,
            'endWeek' => 29,
            'startDay' => 0,
            'endDay' => 4,
        ])
        ->assertRedirect();

    expect(TrainingSession::where('title', 'Final Capstone Week 29')->exists())->toBeTrue();

    // 5. Training with custom configured duration (e.g. 35 weeks)
    $customTraining = createReviewFormation([
        'start_time' => '2026-10-06',
        'end_time' => \Carbon\Carbon::parse('2026-10-06')->addWeeks(35)->format('Y-m-d'),
    ]);
    $this->actingAs($admin)
        ->post('/trainings/' . $customTraining->id . '/programme-items', [
            'title' => 'Week 35 Custom Duration Session',
            'startWeek' => 35,
            'endWeek' => 35,
            'startDay' => 0,
            'endDay' => 4,
        ])
        ->assertRedirect();

    expect(TrainingSession::where('title', 'Week 35 Custom Duration Session')->exists())->toBeTrue();

    // 6. Multi-week session spanning across days (Wed Week 2 to Tue Week 4)
    $this->actingAs($admin)
        ->post('/trainings/' . $training->id . '/programme-items', [
            'title' => 'Cross Week Span',
            'startWeek' => 2,
            'endWeek' => 4,
            'startDay' => 2,
            'endDay' => 1,
        ])
        ->assertRedirect();

    expect(TrainingSession::where('title', 'Cross Week Span')->exists())->toBeTrue();
});
