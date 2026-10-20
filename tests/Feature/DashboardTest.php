<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get(route('dashboard'))->assertOk();
});

test('coaches are not prompted to mark attendance', function () {
    $coach = User::factory()->create([
        'role' => ['coach'],
    ]);

    $this->actingAs($coach)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->missing('attendanceWarning'));
});
