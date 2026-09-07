<?php

/**
 * Direct API (Postman-style) authorization penetration verification.
 *
 * Simulates attackers who bypass the mobile UI and call Sanctum routes
 * with curl/Postman using their own Bearer token only.
 *
 * Does not modify application (production) code — verification only.
 */

use App\Models\Conversation;
use App\Models\Formation;
use App\Models\Follower;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('attachments');
    Storage::fake('public');
    Config::set('services.lionsgeek.url', 'https://lionsgeek.pen.test');
    Config::set('services.lionsgeek.key', 'pen-upstream-server-key-only');
    Config::set('services.lionsgeek.verify', true);
    Http::preventStrayRequests();
});

function penUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => ['student'],
        'status' => 'Studying',
        'email_verified_at' => now(),
        'account_state' => 0,
        'access_scan' => 0,
        'access_studio' => 0,
        'access_cowork' => 0,
        'formation_id' => null,
    ], $overrides));
}

function penFormation(array $overrides = []): Formation
{
    return Formation::query()->create(array_merge([
        'name' => 'Pen Formation '.uniqid(),
        'img' => 'default_training.jpg',
        'start_time' => now()->toDateString(),
        'end_time' => now()->addMonths(3)->toDateString(),
    ], $overrides));
}

function penStudio(): int
{
    return (int) DB::table('studios')->insertGetId([
        'name' => 'Pen Studio '.uniqid(),
        'state' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

function penBodyHasSensitiveLeak(string $body): bool
{
    $needles = [
        'pen-upstream-server-key-only',
        'storage/logs',
        'stack trace',
        'SQLSTATE',
        'PDOException',
        'Bearer ',
        'full_token',
    ];

    foreach ($needles as $needle) {
        if (stripos($body, $needle) !== false) {
            return true;
        }
    }

    return false;
}

// ---------------------------------------------------------------------------
// 1) Training show IDOR
// ---------------------------------------------------------------------------

test('PEN training show: guest denied', function () {
    $formation = penFormation();

    $this->getJson('/api/mobile/trainings/'.$formation->id)
        ->assertUnauthorized();
});

test('PEN training show: invalid token denied', function () {
    $formation = penFormation();

    $this->withToken('invalid-pen-token')
        ->getJson('/api/mobile/trainings/'.$formation->id)
        ->assertUnauthorized();
});

test('PEN training show: student A cannot read formation B roster via IDOR', function () {
    $formationA = penFormation(['name' => 'Formation A']);
    $formationB = penFormation(['name' => 'Formation B']);
    $classmate = penUser([
        'formation_id' => $formationB->id,
        'email' => 'pen.classmate.b@example.com',
        'name' => 'Classmate B Secret',
    ]);
    $studentA = penUser(['formation_id' => $formationA->id]);

    $response = $this->actingAs($studentA, 'sanctum')
        ->getJson('/api/mobile/trainings/'.$formationB->id);

    $response->assertForbidden();
    $body = $response->getContent();
    expect($body)->toBe('')
        ->and($body)->not->toContain($classmate->email)
        ->and($body)->not->toContain('Classmate B Secret')
        ->and($body)->not->toContain('users')
        ->and($body)->not->toContain('training');
});

test('PEN training show: body role=admin does not escalate student', function () {
    $formationB = penFormation();
    $student = penUser();

    $this->actingAs($student, 'sanctum')
        ->withHeaders([
            'X-Role' => 'admin',
            'X-Is-Admin' => 'true',
        ])
        ->getJson('/api/mobile/trainings/'.$formationB->id.'?role=admin&is_admin=1')
        ->assertForbidden();
});

test('PEN training show: enrolled student can view own formation', function () {
    $formation = penFormation(['name' => 'Own Formation']);
    $student = penUser(['formation_id' => $formation->id]);

    $this->actingAs($student, 'sanctum')
        ->getJson('/api/mobile/trainings/'.$formation->id)
        ->assertOk()
        ->assertJsonPath('training.id', $formation->id)
        ->assertJsonMissingPath('usersNull');
});

test('PEN training show: admin can view any formation', function () {
    $formation = penFormation();
    $admin = penUser(['role' => ['admin']]);

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/mobile/trainings/'.$formation->id)
        ->assertOk()
        ->assertJsonPath('training.id', $formation->id);
});

test('PEN training manage: student cannot create formation via direct API', function () {
    $student = penUser();

    $this->actingAs($student, 'sanctum')
        ->postJson('/api/mobile/trainings', [
            'name' => 'Hacked Training',
            'img' => 'default_training.jpg',
            'start_time' => now()->toDateString(),
            'role' => 'admin',
        ])
        ->assertForbidden();

    expect(Formation::query()->where('name', 'Hacked Training')->exists())->toBeFalse();
});

// ---------------------------------------------------------------------------
// 2) Reservation ownership escalation
// ---------------------------------------------------------------------------

test('PEN reservation store: guest denied', function () {
    $this->postJson('/api/reservations/store', [
        'studio_id' => 1,
        'title' => 'x',
        'day' => '2026-10-01',
        'start' => '10:00',
        'end' => '12:00',
    ])->assertUnauthorized();
});

test('PEN reservation store: user A cannot create as user B via body user_id', function () {
    $a = penUser(['access_studio' => 1, 'name' => 'Actor A']);
    $b = penUser(['access_studio' => 1, 'name' => 'Victim B']);
    $studioId = penStudio();

    $this->actingAs($a, 'sanctum')
        ->postJson('/api/reservations/store', [
            'studio_id' => $studioId,
            'title' => 'Forged as B',
            'day' => '2026-10-02',
            'start' => '10:00',
            'end' => '12:00',
            'user_id' => $b->id,
            'role' => 'admin',
        ])
        ->assertSuccessful()
        ->assertJsonPath('success', true);

    expect(DB::table('reservations')->where('user_id', $b->id)->exists())->toBeFalse()
        ->and((int) DB::table('reservations')->where('user_id', $a->id)->count())->toBe(1);
});

test('PEN reservation store: student without access_studio denied even with forged flags', function () {
    $a = penUser(['access_studio' => 0]);
    $b = penUser(['access_studio' => 1]);
    $studioId = penStudio();

    $this->actingAs($a, 'sanctum')
        ->postJson('/api/reservations/store', [
            'studio_id' => $studioId,
            'title' => 'Should fail',
            'day' => '2026-10-03',
            'start' => '10:00',
            'end' => '12:00',
            'user_id' => $b->id,
            'access_studio' => 1,
        ])
        ->assertForbidden();

    expect(DB::table('reservations')->count())->toBe(0);
});

// ---------------------------------------------------------------------------
// 3) Test-push / push-status
// ---------------------------------------------------------------------------

test('PEN test-push: guest denied', function () {
    $this->postJson('/api/mobile/test-push')->assertUnauthorized();
});

test('PEN test-push: normal student denied', function () {
    $student = penUser();

    $response = $this->actingAs($student, 'sanctum')
        ->postJson('/api/mobile/test-push', ['title' => 'hack', 'body' => 'hack']);

    $response->assertForbidden();
    expect(penBodyHasSensitiveLeak($response->getContent()))->toBeFalse();
});

test('PEN push-status: normal student denied', function () {
    $this->actingAs(penUser(), 'sanctum')
        ->getJson('/api/mobile/push-status')
        ->assertForbidden();
});

test('PEN test-push: body role=admin does not escalate student', function () {
    $student = penUser();

    $this->actingAs($student, 'sanctum')
        ->postJson('/api/mobile/test-push', [
            'role' => 'admin',
            'roles' => ['admin'],
            'is_admin' => true,
        ])
        ->assertForbidden();
});

test('PEN test-push: admin allowed without leaking stack/secrets on missing token', function () {
    $admin = penUser(['role' => ['admin'], 'expo_push_token' => null]);

    $response = $this->actingAs($admin, 'sanctum')
        ->postJson('/api/mobile/test-push');

    $response->assertStatus(400);
    expect(penBodyHasSensitiveLeak($response->getContent()))->toBeFalse()
        ->and($response->json('full_token'))->toBeNull()
        ->and($response->json('file'))->toBeNull()
        ->and($response->json('line'))->toBeNull();
});

// ---------------------------------------------------------------------------
// 4) Events-info proxy
// ---------------------------------------------------------------------------

test('PEN events-info: guest denied on public list', function () {
    $this->getJson('/api/events-info/events')->assertUnauthorized();
});

test('PEN events-info: student cannot hit scan/PII routes', function () {
    $student = penUser();

    $this->actingAs($student, 'sanctum')
        ->getJson('/api/events-info/session-data?id=1')
        ->assertForbidden();

    $this->actingAs($student, 'sanctum')
        ->getJson('/api/events-info/lionsgate/infosessions')
        ->assertForbidden();

    $this->actingAs($student, 'sanctum')
        ->getJson('/api/events-info/profile-data?id=1')
        ->assertForbidden();
});

test('PEN events-info: body access_scan=1 does not escalate student to scan', function () {
    $student = penUser(['access_scan' => 0]);

    $this->actingAs($student, 'sanctum')
        ->withHeaders(['X-Access-Scan' => '1', 'X-Role' => 'admin'])
        ->getJson('/api/events-info/session-data?id=1&access_scan=1&role=admin')
        ->assertForbidden();
});

test('PEN events-info: student cannot see private event detail or participants', function () {
    Http::fake([
        'https://lionsgeek.pen.test/api/events/99' => Http::response([
            'event' => [
                'id' => 99,
                'name' => ['en' => 'Private'],
                'is_private' => true,
                'private_url_token' => 'secret-private-token-xyz',
            ],
            'participants' => [
                ['id' => 1, 'email' => 'visitor@example.com', 'name' => 'Visitor'],
            ],
        ], 200),
    ]);

    $student = penUser();

    $response = $this->actingAs($student, 'sanctum')
        ->getJson('/api/events-info/events/99');

    $response->assertForbidden();
    expect($response->getContent())->not->toContain('visitor@example.com')
        ->and($response->getContent())->not->toContain('secret-private-token-xyz')
        ->and($response->getContent())->not->toContain('pen-upstream-server-key-only');
});

test('PEN events-info: admin can list public events (authorized positive)', function () {
    Http::fake([
        'https://lionsgeek.pen.test/api/events' => Http::response([
            [
                'id' => 1,
                'name' => ['en' => 'Public Event'],
                'is_private' => false,
                'private_url_token' => 'should-be-stripped',
            ],
        ], 200),
    ]);

    $admin = penUser(['role' => ['admin']]);

    $response = $this->actingAs($admin, 'sanctum')
        ->getJson('/api/events-info/events');

    $response->assertOk();
    expect($response->getContent())->not->toContain('should-be-stripped')
        ->and($response->getContent())->not->toContain('pen-upstream-server-key-only');
});

test('PEN events-info: scan user can open session-data (authorized positive)', function () {
    Http::fake([
        'https://lionsgeek.pen.test/api/session-data*' => Http::response([
            'session' => ['id' => 1, 'private_url_token' => 'strip-me'],
            'participants' => [['id' => 7, 'email' => 'p@example.com', 'name' => 'P']],
        ], 200),
    ]);

    $scan = penUser(['access_scan' => 1]);

    $response = $this->actingAs($scan, 'sanctum')
        ->getJson('/api/events-info/session-data?id=1');

    $response->assertOk();
    expect($response->getContent())->not->toContain('strip-me')
        ->and($response->json('participants.0.email'))->toBe('p@example.com');
});

// ---------------------------------------------------------------------------
// 5) Chat attachment IDOR
// ---------------------------------------------------------------------------

test('PEN chat attachment: guest denied', function () {
    $this->getJson('/api/mobile/chat/message/1/attachment')
        ->assertUnauthorized();
});

test('PEN chat attachment: stranger with valid token cannot download', function () {
    $sender = penUser();
    $recipient = penUser();
    $stranger = penUser();

    Follower::query()->create([
        'follower_id' => $sender->id,
        'followed_id' => $recipient->id,
    ]);

    $conversation = Conversation::query()->create([
        'user_one_id' => $sender->id,
        'user_two_id' => $recipient->id,
    ]);

    Storage::disk('attachments')->put('chat/attachments/pen-secret.jpg', 'secret-bytes');

    $message = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $sender->id,
        'body' => null,
        'attachment_path' => 'chat/attachments/pen-secret.jpg',
        'attachment_type' => 'image',
        'attachment_name' => 'pen-secret.jpg',
    ]);

    $this->actingAs($stranger, 'sanctum')
        ->get('/api/mobile/chat/message/'.$message->id.'/attachment')
        ->assertForbidden();

    // Public storage path must not expose the private-disk object as a downloadable file.
    // Framework may 403/404 depending on static middleware; either denies unauthenticated content.
    $public = $this->get('/storage/chat/attachments/pen-secret.jpg');
    expect(in_array($public->status(), [403, 404], true))->toBeTrue()
        ->and($public->getContent())->not->toContain('secret-bytes');
});

test('PEN chat attachment: participant can download', function () {
    $sender = penUser();
    $recipient = penUser();

    $conversation = Conversation::query()->create([
        'user_one_id' => $sender->id,
        'user_two_id' => $recipient->id,
    ]);

    Storage::disk('attachments')->put('chat/attachments/pen-ok.jpg', 'ok-bytes');

    $message = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $sender->id,
        'body' => null,
        'attachment_path' => 'chat/attachments/pen-ok.jpg',
        'attachment_type' => 'image',
        'attachment_name' => 'pen-ok.jpg',
    ]);

    $this->actingAs($recipient, 'sanctum')
        ->get('/api/mobile/chat/message/'.$message->id.'/attachment')
        ->assertOk();
});

// ---------------------------------------------------------------------------
// 6) Notifications / Ably token
// ---------------------------------------------------------------------------

test('PEN notifications: guest denied', function () {
    $this->getJson('/api/mobile/notifications')->assertUnauthorized();
    $this->getJson('/api/mobile/notifications/ably-token')->assertUnauthorized();
});

test('PEN notifications: student can list own feed but response has no upstream/API secrets', function () {
    $student = penUser();

    $response = $this->actingAs($student, 'sanctum')
        ->getJson('/api/mobile/notifications');

    $response->assertOk();
    expect(penBodyHasSensitiveLeak($response->getContent()))->toBeFalse()
        ->and($response->json())->toHaveKey('notifications');
});

test('PEN notifications ably-token: student only gets own channel capability when configured', function () {
    $student = penUser();

    $response = $this->actingAs($student, 'sanctum')
        ->getJson('/api/mobile/notifications/ably-token');

    // Either Ably is not configured (500 generic) or token is scoped to own user id.
    if ($response->status() === 500) {
        expect($response->json('error'))->not->toBeEmpty()
            ->and(penBodyHasSensitiveLeak($response->getContent()))->toBeFalse();

        return;
    }

    $response->assertOk();
    expect($response->json('channelName'))->toBe('notifications:'.$student->id)
        ->and($response->getContent())->not->toContain('notifications:'.($student->id + 1));
});

// ---------------------------------------------------------------------------
// 7) User directory PII
// ---------------------------------------------------------------------------

test('PEN mobile users list: student cannot obtain emails/tokens of peers', function () {
    $peer = penUser([
        'email' => 'pen.peer.secret@example.com',
        'expo_push_token' => 'ExponentPushToken[pen-peer-secret]',
        'name' => 'Peer Visible',
    ]);
    $student = penUser();

    $response = $this->actingAs($student, 'sanctum')
        ->getJson('/api/mobile/users');

    $response->assertOk();
    $body = $response->getContent();
    expect($body)->not->toContain('pen.peer.secret@example.com')
        ->and($body)->not->toContain('ExponentPushToken[pen-peer-secret]')
        ->and($body)->not->toContain('password')
        ->and($body)->toContain('Peer Visible');
});
