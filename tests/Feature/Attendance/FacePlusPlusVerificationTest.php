<?php

use App\Models\Attendance;
use App\Models\AttendanceListe;
use App\Models\FaceEnrollment;
use App\Models\Formation;
use App\Models\User;
use App\Services\FaceVerification\FacePlusPlusVerificationService;
use App\Services\FaceVerification\FaceVerificationService;
use Carbon\Carbon;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

beforeEach(function () {
    Schema::dropAllTables();

    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email');
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password');
        $table->string('remember_token')->nullable();
        $table->json('role')->nullable();
        $table->string('status')->default('Studying');
        $table->integer('formation_id')->nullable();
        $table->string('image')->nullable();
        $table->timestamps();
    });

    Schema::create('formations', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('img')->default('default_training.jpg');
        $table->string('category')->nullable();
        $table->string('start_time')->nullable();
        $table->string('end_time')->nullable();
        $table->integer('user_id')->nullable();
        $table->string('promo')->nullable();
        $table->boolean('is_active')->default(false);
        $table->timestamps();
    });

    Schema::create('attendances', function (Blueprint $table) {
        $table->id();
        $table->integer('formation_id');
        $table->string('attendance_day');
        $table->string('staff_name');
        $table->timestamps();
    });

    Schema::create('attendance_lists', function (Blueprint $table) {
        $table->id();
        $table->integer('user_id');
        $table->integer('attendance_id');
        $table->string('attendance_day');
        $table->string('morning')->nullable();
        $table->string('lunch')->nullable();
        $table->string('evening')->nullable();
        $table->timestamps();
    });

    Schema::create('discipline_notifications', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id')->nullable();
        $table->string('message_notification')->nullable();
        $table->decimal('discipline_change', 5, 2)->nullable();
        $table->string('path')->nullable();
        $table->string('type')->nullable();
        $table->timestamps();
    });

    Schema::create('notes', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->unsignedBigInteger('attendance_id')->nullable();
        $table->string('note');
        $table->string('author')->nullable();
        $table->timestamps();
    });

    Schema::create('face_enrollments', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->string('disk');
        $table->string('path');
        $table->unsignedBigInteger('enrolled_by')->nullable();
        $table->timestamp('enrolled_at');
        $table->timestamps();
        $table->unique('user_id');
    });

    $this->formation = Formation::create([
        'name' => 'Test Formation',
        'category' => 'coding',
        'start_time' => '2025-01-01',
        'user_id' => null,
    ]);

    allowSchoolNetwork(['203.0.113.1']);
});

afterEach(function () {
    Carbon::setTestNow();
});

function facePlusStudent(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => ['student'],
        'status' => 'Studying',
        'formation_id' => test()->formation->id,
        'email_verified_at' => now(),
        'image' => 'ref.jpg',
    ], $overrides));
}

function seedProfilePhoto(User $student, string $filename = 'ref.jpg', string $bytes = 'reference-photo-bytes'): void
{
    Storage::disk('public')->put('img/profile/'.$filename, $bytes);
    $student->forceFill(['image' => $filename])->save();
}

function seedStaffEnrollment(User $student, string $bytes = 'private-reference-bytes'): void
{
    $path = $student->id.'/reference.jpg';
    Storage::disk('face_enrollments')->put($path, $bytes);
    FaceEnrollment::query()->create([
        'user_id' => $student->id,
        'disk' => 'face_enrollments',
        'path' => $path,
        'enrolled_by' => null,
        'enrolled_at' => now(),
    ]);
}

function freezeFacePlusTime(string $time): void
{
    Carbon::setTestNow(Carbon::parse(Carbon::now()->toDateString().' '.$time, 'Africa/Casablanca'));
}

function fakeFacePlusCompare(int $status = 200, array $body = ['confidence' => 95]): void
{
    Http::fake([
        config('face_verification.api_url') => Http::response($body, $status),
    ]);
}

function postFacePlusCheckIn(TestCase $test, User $actor): Illuminate\Testing\TestResponse
{
    return $test->actingAs($actor, 'sanctum')
        ->withServerVariables(['REMOTE_ADDR' => '203.0.113.1'])
        ->post('/api/mobile/attendance/check-in', [
            'formation_id' => $test->formation->id,
            'attendance_day' => Carbon::now()->toDateString(),
            'live_photo' => m8LivePhoto(),
        ], [
            'Accept' => 'application/json',
        ]);
}

test('production binding uses face++ when configured', function () {
    bindFacePlusPlusVerifier();

    expect(app(FaceVerificationService::class))->toBeInstanceOf(FacePlusPlusVerificationService::class);
});

test('matching face++ compare creates attendance', function () {
    freezeFacePlusTime('09:42:00');
    bindFacePlusPlusVerifier();
    fakeFacePlusCompare(200, ['confidence' => 95]);
    $student = facePlusStudent();
    seedStaffEnrollment($student);
    seedProfilePhoto($student, 'friend.jpg', 'friend-face-bytes');

    postFacePlusCheckIn($this, $student)
        ->assertOk()
        ->assertJsonPath('slot', 'morning')
        ->assertJsonPath('status', 'present');

    $body = Http::recorded()[0][0]->body();
    expect(AttendanceListe::query()->where('user_id', $student->id)->exists())->toBeTrue()
        ->and($body)->toContain('private-reference-bytes')
        ->and($body)->not->toContain('friend-face-bytes');
});

test('face++ confidence below threshold is rejected', function () {
    freezeFacePlusTime('09:42:00');
    bindFacePlusPlusVerifier();
    fakeFacePlusCompare(200, ['confidence' => 40]);
    $student = facePlusStudent();
    seedStaffEnrollment($student);
    seedProfilePhoto($student, 'friend.jpg', 'friend-face-bytes');

    postFacePlusCheckIn($this, $student)
        ->assertUnprocessable()
        ->assertJson(['message' => 'Face not recognized.', 'error_code' => 'FACE_NOT_RECOGNIZED']);

    expect(AttendanceListe::count())->toBe(0)
        ->and(Attendance::count())->toBe(0);
});

test('first check-in locks the profile photo and later edits are ignored', function () {
    freezeFacePlusTime('09:42:00');
    bindFacePlusPlusVerifier();
    fakeFacePlusCompare(200, ['confidence' => 95]);
    $student = facePlusStudent();
    seedProfilePhoto($student, 'me.jpg', 'original-face-bytes');

    postFacePlusCheckIn($this, $student)
        ->assertOk()
        ->assertJsonPath('status', 'present');

    seedProfilePhoto($student, 'friend.jpg', 'friend-face-bytes');

    postFacePlusCheckIn($this, $student)
        ->assertStatus(409);

    $recorded = Http::recorded();
    expect($recorded[0][0]->body())->toContain('original-face-bytes')
        ->and($recorded[1][0]->body())->toContain('original-face-bytes')
        ->and($recorded[1][0]->body())->not->toContain('friend-face-bytes')
        ->and(FaceEnrollment::query()->where('user_id', $student->id)->count())->toBe(1);
});

test('missing profile photo and enrollment stays unavailable', function () {
    freezeFacePlusTime('09:42:00');
    bindFacePlusPlusVerifier();
    fakeFacePlusCompare();
    $student = facePlusStudent(['image' => null]);

    postFacePlusCheckIn($this, $student)
        ->assertStatus(503)
        ->assertJson(['message' => 'Unable to verify your identity.']);

    expect(AttendanceListe::count())->toBe(0)
        ->and(Http::recorded())->toBeEmpty()
        ->and(FaceEnrollment::query()->count())->toBe(0);
});

test('face++ http error keeps verification unavailable', function () {
    freezeFacePlusTime('09:42:00');
    bindFacePlusPlusVerifier();
    fakeFacePlusCompare(500, ['error_message' => 'INTERNAL_ERROR']);
    $student = facePlusStudent();
    seedStaffEnrollment($student);

    postFacePlusCheckIn($this, $student)
        ->assertStatus(503)
        ->assertJson(['message' => 'Unable to verify your identity.']);

    expect(AttendanceListe::count())->toBe(0);
});

test('invalid face++ threshold fail-closes as unavailable', function (mixed $threshold, array $body) {
    freezeFacePlusTime('09:42:00');
    bindFacePlusPlusVerifier();
    config(['face_verification.threshold' => $threshold]);
    fakeFacePlusCompare(200, $body);
    $student = facePlusStudent();
    seedStaffEnrollment($student);

    postFacePlusCheckIn($this, $student)
        ->assertStatus(503)
        ->assertJson(['message' => 'Unable to verify your identity.']);

    expect(AttendanceListe::count())->toBe(0)
        ->and(Http::recorded())->toBeEmpty();
})->with([
    'empty string' => ['', ['confidence' => 4]],
    'zero' => [0, ['confidence' => 4]],
    'zero string' => ['0', ['confidence' => 4]],
    'non-numeric' => ['no', ['confidence' => 4]],
    'negative' => [-1, ['confidence' => 4]],
    'above 100' => [150, ['confidence' => 4]],
    'zero with missing confidence' => [0, []],
]);
