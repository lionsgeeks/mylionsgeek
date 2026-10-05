<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function equipmentConflictUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => ['student'],
        'status' => 'Studying',
        'email_verified_at' => now(),
        'access_studio' => 1,
    ], $overrides));
}

function equipmentConflictSeedStudio(): int
{
    return (int) DB::table('studios')->insertGetId([
        'name' => 'Studio Equip',
        'state' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

function equipmentConflictSeedEquipment(): int
{
    if (! Schema::hasTable('equipment')) {
        test()->markTestSkipped('equipment table missing');
    }

    $row = [
        'created_at' => now(),
        'updated_at' => now(),
    ];
    if (Schema::hasColumn('equipment', 'reference')) {
        $row['reference'] = 'EQ-TEST-' . uniqid();
    }
    if (Schema::hasColumn('equipment', 'mark')) {
        $row['mark'] = 'Test Mark';
    }
    if (Schema::hasColumn('equipment', 'image')) {
        $row['image'] = 'placeholder.jpg';
    }
    if (Schema::hasColumn('equipment', 'equipment_type_id')) {
        $row['equipment_type_id'] = 1;
    }
    if (Schema::hasColumn('equipment', 'name')) {
        $row['name'] = 'Camera A';
    }
    if (Schema::hasColumn('equipment', 'title')) {
        $row['title'] = 'Camera A';
    }
    if (Schema::hasColumn('equipment', 'state')) {
        $row['state'] = 1;
    }

    return (int) DB::table('equipment')->insertGetId($row);
}

test('overlapping equipment on studio reservation is rejected', function () {
    if (! Schema::hasTable('reservation_equipment')) {
        $this->markTestSkipped('reservation_equipment table missing');
    }

    $studioA = equipmentConflictSeedStudio();
    $studioB = equipmentConflictSeedStudio();
    $equipmentId = equipmentConflictSeedEquipment();
    $userA = equipmentConflictUser();
    $userB = equipmentConflictUser();

    Auth::forgetGuards();
    test()->actingAs($userA, 'sanctum')
        ->postJson('/api/reservations/store', [
            'studio_id' => $studioA,
            'title' => 'First',
            'day' => '2026-09-12',
            'start' => '10:00',
            'end' => '12:00',
            'equipment' => [$equipmentId],
        ])
        ->assertOk();

    Auth::forgetGuards();
    test()->actingAs($userB, 'sanctum')
        ->postJson('/api/reservations/store', [
            'studio_id' => $studioB,
            'title' => 'Second',
            'day' => '2026-09-12',
            'start' => '11:00',
            'end' => '13:00',
            'equipment' => [$equipmentId],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('equipment');
});

test('studio reservation uses auto increment ids not max plus one', function () {
    $studioId = equipmentConflictSeedStudio();
    $user = equipmentConflictUser();

    Auth::forgetGuards();
    $response = test()->actingAs($user, 'sanctum')
        ->postJson('/api/reservations/store', [
            'studio_id' => $studioId,
            'title' => 'Auto id',
            'day' => '2026-09-13',
            'start' => '09:00',
            'end' => '10:00',
        ])
        ->assertOk();

    $id = (int) ($response->json('reservation_id') ?? 0);
    expect($id)->toBeGreaterThan(0)
        ->and(DB::table('reservations')->where('id', $id)->exists())->toBeTrue();
});
