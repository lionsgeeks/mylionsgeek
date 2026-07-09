<?php

use App\Models\Attendance;
use App\Models\AttendanceListe;
use App\Models\Note;
use App\Services\AttendanceLegacyIdService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

beforeEach(function () {
    Schema::dropAllTables();

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
        $table->string('attendance_id');
        $table->string('attendance_day');
        $table->string('morning')->nullable();
        $table->string('lunch')->nullable();
        $table->string('evening')->nullable();
        $table->timestamps();
    });

    Schema::create('notes', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->string('attendance_id')->nullable();
        $table->string('note');
        $table->string('author')->nullable();
        $table->timestamps();
    });
});

test('ensureNumericId returns the same record when id is already numeric', function () {
    $attendance = Attendance::make([
        'formation_id' => 1,
        'attendance_day' => '2025-06-22',
        'staff_name' => 'Coach',
    ]);
    $attendance->setRawAttributes(['id' => 42] + $attendance->getAttributes(), true);

    $service = new AttendanceLegacyIdService;
    $result = $service->ensureNumericId($attendance, 'Coach');

    expect($result->id)->toBe(42);
    expect(Attendance::count())->toBe(0);
});

test('ensureNumericId migrates legacy non-numeric ids and reassigns related rows', function () {
    AttendanceListe::create([
        'user_id' => 7,
        'attendance_id' => 'legacy-uuid-1',
        'attendance_day' => '2025-06-22',
        'morning' => 'present',
        'lunch' => 'absent',
        'evening' => 'absent',
    ]);

    Note::create([
        'user_id' => 7,
        'attendance_id' => 'legacy-uuid-1',
        'note' => 'Check-in at 09:42',
        'author' => 'Student',
    ]);

    $legacy = Attendance::make([
        'formation_id' => 1,
        'attendance_day' => '2025-06-22',
        'staff_name' => 'Old Coach',
    ]);
    $legacy->setRawAttributes([
        'id' => 'legacy-uuid-1',
        'formation_id' => 1,
        'attendance_day' => '2025-06-22',
        'staff_name' => 'Old Coach',
    ], true);

    $service = new AttendanceLegacyIdService;
    $result = $service->ensureNumericId($legacy, 'New Coach');

    expect($result->id)->not->toBe('legacy-uuid-1');
    expect(is_numeric($result->id))->toBeTrue();
    expect(Attendance::count())->toBe(1);
    expect(AttendanceListe::first()->attendance_id)->toBe((string) $result->id);
    expect(Note::first()->attendance_id)->toBe((string) $result->id);
});
