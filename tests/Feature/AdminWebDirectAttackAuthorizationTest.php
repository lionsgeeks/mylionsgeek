<?php

/**
 * Direct-attack authorization coverage for web /admin/* routes.
 * Uses real session auth + RoleMiddleware (not Sanctum mobile).
 */

use App\Models\Formation;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();

    if (Schema::hasTable('formations') && ! Schema::hasColumn('formations', 'category')) {
        Schema::table('formations', function (Blueprint $table) {
            $table->string('category')->nullable();
            $table->string('promo')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
        });
    }
});

function adminWebUser(array $roles, array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => $roles,
        'status' => 'Studying',
        'email_verified_at' => now(),
        'account_state' => 0,
        'access_cowork' => 0,
        'access_studio' => 0,
        'access_scan' => 0,
    ], $overrides));
}

function adminWebAssertDenied($response): void
{
    expect(in_array($response->status(), [302, 401, 403], true))->toBeTrue();

    if ($response->status() === 302) {
        $location = (string) $response->headers->get('Location');
        // Must not land on an admin surface after denial.
        expect(str_contains($location, '/admin/users'))->toBeFalse()
            ->and(str_contains($location, '/admin/dashboard'))->toBeFalse()
            ->and(str_contains($location, '/admin/training'))->toBeFalse();
    }

    $body = $response->getContent();
    expect($body)->not->toContain('wakatime_api_key')
        ->and($body)->not->toContain('expo_push_token')
        ->and($body)->not->toContain('activation_token');
}

test('guest cannot open admin users index', function () {
    $response = $this->get('/admin/users');
    adminWebAssertDenied($response);
});

test('guest cannot open admin dashboard', function () {
    $response = $this->get('/admin/dashboard');
    adminWebAssertDenied($response);
});

test('guest cannot open admin training', function () {
    $response = $this->get('/admin/training');
    adminWebAssertDenied($response);
});

test('guest cannot export admin users', function () {
    $response = $this->get('/admin/users/export');
    adminWebAssertDenied($response);
});

test('student cannot open admin users index', function () {
    $student = adminWebUser(['student']);

    $response = $this->actingAs($student)->get('/admin/users');
    adminWebAssertDenied($response);
});

test('student cannot open admin dashboard', function () {
    $student = adminWebUser(['student']);

    $response = $this->actingAs($student)->get('/admin/dashboard');
    adminWebAssertDenied($response);
});

test('student cannot open admin training or create a formation', function () {
    $student = adminWebUser(['student']);
    $before = Formation::query()->count();

    adminWebAssertDenied($this->actingAs($student)->get('/admin/training'));

    $create = $this->actingAs($student)->post('/admin/training', [
        'name' => 'Hacked Formation',
        'category' => 'coding',
        'start_time' => '2026-10-01',
        'role' => 'admin',
    ]);
    adminWebAssertDenied($create);

    expect(Formation::query()->count())->toBe($before)
        ->and(Formation::query()->where('name', 'Hacked Formation')->exists())->toBeFalse();
});

test('student cannot reset another user password via admin route', function () {
    $student = adminWebUser(['student']);
    $target = adminWebUser(['student'], ['email' => 'target.adminweb@example.com']);
    $hashBefore = $target->password;

    $response = $this->actingAs($student)
        ->post('/admin/users/'.$target->id.'/reset-password');

    adminWebAssertDenied($response);
    expect($target->fresh()->password)->toBe($hashBefore);
});

test('student cannot cancel cowork reservation via admin route', function () {
    $owner = adminWebUser(['student'], ['access_cowork' => 1]);
    $student = adminWebUser(['student']);

    $coworkId = (int) DB::table('reservation_coworks')->insertGetId([
        'user_id' => $owner->id,
        'table' => 3,
        'seats' => 1,
        'day' => '2026-10-10',
        'start' => '10:00',
        'end' => '12:00',
        'approved' => 1,
        'canceled' => 0,
        'passed' => 0,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = $this->actingAs($student)
        ->post('/admin/reservations/cowork/'.$coworkId.'/cancel');

    adminWebAssertDenied($response);
    expect((int) DB::table('reservation_coworks')->where('id', $coworkId)->value('canceled'))->toBe(0);
});

test('recruiter wrong-role cannot open admin users or training', function () {
    $recruiter = adminWebUser(['recruiter']);

    adminWebAssertDenied($this->actingAs($recruiter)->get('/admin/users'));
    adminWebAssertDenied($this->actingAs($recruiter)->get('/admin/training'));
});

test('admin can open admin users index (positive control)', function () {
    $admin = adminWebUser(['admin']);

    $this->actingAs($admin)
        ->get('/admin/users')
        ->assertOk();
});

test('admin can open admin dashboard (positive control)', function () {
    $admin = adminWebUser(['admin']);

    $this->actingAs($admin)
        ->get('/admin/dashboard')
        ->assertOk();
});

test('admin can open admin training (positive control)', function () {
    $admin = adminWebUser(['admin']);

    $this->actingAs($admin)
        ->get('/admin/training')
        ->assertOk();
});

test('body role=admin does not grant student admin users access', function () {
    $student = adminWebUser(['student']);

    $response = $this->actingAs($student)
        ->withHeaders(['X-Role' => 'admin'])
        ->get('/admin/users?role=admin&is_admin=1');

    adminWebAssertDenied($response);
});
