<?php

use App\Services\AttendanceSlotService;
use Carbon\Carbon;

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2025-06-22 09:00:00', 'Africa/Casablanca'));
});

afterEach(function () {
    Carbon::setTestNow();
});

function slotService(): AttendanceSlotService
{
    return new AttendanceSlotService;
}

function atTime(string $time): Carbon
{
    return Carbon::parse("2025-06-22 {$time}", 'Africa/Casablanca');
}

test('09:42 is morning present', function () {
    $now = atTime('09:42:00');
    expect(slotService()->currentSlot($now))->toBe('morning');
    expect(slotService()->gradeStatus($now, 'morning'))->toBe('present');
});

test('09:46 is morning late', function () {
    $now = atTime('09:46:00');
    expect(slotService()->currentSlot($now))->toBe('morning');
    expect(slotService()->gradeStatus($now, 'morning'))->toBe('late');
});

test('11:05 is a gap with no active slot', function () {
    $now = atTime('11:05:00');
    expect(slotService()->currentSlot($now))->toBeNull();
    expect(slotService()->phase($now))->toBe('gap');
});

test('08:00 is outside school hours', function () {
    $now = atTime('08:00:00');
    expect(slotService()->currentSlot($now))->toBeNull();
    expect(slotService()->phase($now))->toBe('closed');
});

test('16:59 is evening late', function () {
    $now = atTime('16:59:00');
    expect(slotService()->currentSlot($now))->toBe('evening');
    expect(slotService()->gradeStatus($now, 'evening'))->toBe('late');
});

test('17:30 is outside school hours', function () {
    $now = atTime('17:30:00');
    expect(slotService()->currentSlot($now))->toBeNull();
    expect(slotService()->phase($now))->toBe('closed');
});

test('11:35 is lunch present', function () {
    $now = atTime('11:35:00');
    expect(slotService()->currentSlot($now))->toBe('lunch');
    expect(slotService()->gradeStatus($now, 'lunch'))->toBe('present');
});

test('12:59 is still lunch', function () {
    $now = atTime('12:59:59');
    expect(slotService()->currentSlot($now))->toBe('lunch');
});

test('13:00 is a gap between lunch and evening', function () {
    $now = atTime('13:00:00');
    expect(slotService()->currentSlot($now))->toBeNull();
    expect(slotService()->phase($now))->toBe('gap');
});

test('13:30 is a gap before evening opens', function () {
    $now = atTime('13:30:00');
    expect(slotService()->currentSlot($now))->toBeNull();
    expect(slotService()->phase($now))->toBe('gap');
});

test('09:44:59 is present boundary', function () {
    $now = atTime('09:44:59');
    expect(slotService()->gradeStatus($now, 'morning'))->toBe('present');
});

test('09:45:00 is late boundary', function () {
    $now = atTime('09:45:00');
    expect(slotService()->gradeStatus($now, 'morning'))->toBe('late');
});

test('buildCheckInSlots preserves earlier marks and defaults future to absent', function () {
    $slots = slotService()->buildCheckInSlots(
        ['morning' => 'present', 'lunch' => null, 'evening' => null],
        'lunch',
        'late',
    );

    expect($slots)->toBe([
        'morning' => 'present',
        'lunch' => 'late',
        'evening' => 'absent',
    ]);
});

test('buildCheckInSlots marks past unscanned slots absent', function () {
    $slots = slotService()->buildCheckInSlots(
        null,
        'evening',
        'present',
    );

    expect($slots)->toBe([
        'morning' => 'absent',
        'lunch' => 'absent',
        'evening' => 'present',
    ]);
});
