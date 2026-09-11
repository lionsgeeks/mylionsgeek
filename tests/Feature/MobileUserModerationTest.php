<?php

use App\Models\Post;
use App\Models\PostReport;
use App\Models\PostReportNotification;
use App\Models\User;
use App\Models\UserBlock;
use App\Models\UserBlockNotification;
use App\Models\UserReport;
use App\Models\UserReportNotification;
use Illuminate\Support\Facades\Auth;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function moderationUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => ['student'],
        'status' => 'Studying',
        'email_verified_at' => now(),
        'account_state' => 0,
    ], $overrides));
}

function moderationStaff(): User
{
    return moderationUser([
        'role' => ['admin'],
        'email' => 'staff.moderation@example.com',
    ]);
}

function moderationLogin(User $user, string $password = 'password'): string
{
    $response = test()->postJson('/api/mobile/login', [
        'email' => $user->email,
        'password' => $password,
    ])->assertOk();

    $token = $response->json('token');
    expect($token)->toBeString()->not->toBeEmpty();

    return $token;
}

function moderationAuth(string $token, string $method, string $uri, array $data = [])
{
    Auth::forgetGuards();

    $pending = test()->flushSession()->withToken($token);

    return match (strtoupper($method)) {
        'GET' => $pending->getJson($uri),
        'POST' => $pending->postJson($uri, $data),
        'DELETE' => $pending->deleteJson($uri, $data),
        default => throw new InvalidArgumentException("Unsupported method {$method}"),
    };
}

test('guest cannot report or block users', function () {
    $target = moderationUser(['email' => 'target.guest@example.com']);

    $this->postJson("/api/mobile/users/{$target->id}/report", [
        'reason' => 'Harassment or bullying',
    ])->assertUnauthorized();

    $this->postJson("/api/mobile/users/{$target->id}/block")->assertUnauthorized();
    $this->getJson('/api/mobile/blocks')->assertUnauthorized();
});

test('post report still works and notifies staff on first report', function () {
    $staff = moderationStaff();
    $author = moderationUser(['email' => 'author.post@example.com']);
    $reporter = moderationUser(['email' => 'reporter.post@example.com']);

    $post = Post::query()->create([
        'user_id' => $author->id,
        'description' => 'A public community post',
        'images' => null,
        'status' => 1,
    ]);

    $token = moderationLogin($reporter);

    moderationAuth($token, 'POST', "/api/mobile/posts/{$post->id}/report", [
        'reason' => 'Harassment or bullying',
    ])->assertCreated()
        ->assertJsonPath('message', 'Report submitted');

    expect(PostReport::query()->count())->toBe(1)
        ->and(PostReportNotification::query()->where('notified_user_id', $staff->id)->count())->toBe(1);
});

test('user report creates row and staff notification on first report', function () {
    $staff = moderationStaff();
    $reporter = moderationUser(['email' => 'reporter.user@example.com']);
    $reported = moderationUser(['email' => 'reported.user@example.com']);

    $token = moderationLogin($reporter);

    moderationAuth($token, 'POST', "/api/mobile/users/{$reported->id}/report", [
        'reason' => 'Harassment or bullying',
    ])->assertCreated()
        ->assertJsonPath('message', 'Report submitted');

    expect(UserReport::query()->count())->toBe(1)
        ->and(UserReportNotification::query()->where('notified_user_id', $staff->id)->count())->toBe(1);

    // Same reason again should not duplicate staff notify.
    moderationAuth($token, 'POST', "/api/mobile/users/{$reported->id}/report", [
        'reason' => 'Harassment or bullying',
    ])->assertCreated();

    expect(UserReport::query()->count())->toBe(1)
        ->and(UserReportNotification::query()->where('notified_user_id', $staff->id)->count())->toBe(1);
});

test('block creates row notifies staff once and is idempotent', function () {
    $staff = moderationStaff();
    $blocker = moderationUser(['email' => 'blocker.user@example.com']);
    $blocked = moderationUser(['email' => 'blocked.user@example.com']);

    $token = moderationLogin($blocker);

    moderationAuth($token, 'POST', "/api/mobile/users/{$blocked->id}/block")
        ->assertCreated()
        ->assertJsonPath('blocked', true);

    expect(UserBlock::query()->count())->toBe(1)
        ->and(UserBlockNotification::query()->where('notified_user_id', $staff->id)->count())->toBe(1);

    moderationAuth($token, 'POST', "/api/mobile/users/{$blocked->id}/block")
        ->assertOk()
        ->assertJsonPath('message', 'User already blocked');

    expect(UserBlock::query()->count())->toBe(1)
        ->and(UserBlockNotification::query()->where('notified_user_id', $staff->id)->count())->toBe(1);

    moderationAuth($token, 'GET', '/api/mobile/blocks')
        ->assertOk()
        ->assertJsonPath('blocked_user_ids', [(int) $blocked->id]);
});

test('feed excludes blocked authors for the blocker', function () {
    $blocker = moderationUser(['email' => 'feed.blocker@example.com']);
    $blocked = moderationUser(['email' => 'feed.blocked@example.com']);
    $other = moderationUser(['email' => 'feed.other@example.com']);

    $blockedPost = Post::query()->create([
        'user_id' => $blocked->id,
        'description' => 'Post from blocked user',
        'images' => null,
        'status' => 1,
    ]);

    $visiblePost = Post::query()->create([
        'user_id' => $other->id,
        'description' => 'Post from visible user',
        'images' => null,
        'status' => 1,
    ]);

    UserBlock::query()->create([
        'blocker_id' => $blocker->id,
        'blocked_id' => $blocked->id,
    ]);

    $token = moderationLogin($blocker);

    $response = moderationAuth($token, 'GET', '/api/mobile/feed?limit=20&offset=0')
        ->assertOk();

    $feed = collect($response->json('feed') ?? []);
    $ids = $feed->pluck('id')->map(fn ($id) => (int) $id)->all();

    expect($ids)->toContain((int) $visiblePost->id)
        ->and($ids)->not->toContain((int) $blockedPost->id);
});

test('user cannot block or report themselves', function () {
    $user = moderationUser(['email' => 'self.moderation@example.com']);
    $token = moderationLogin($user);

    moderationAuth($token, 'POST', "/api/mobile/users/{$user->id}/block")
        ->assertStatus(422);

    moderationAuth($token, 'POST', "/api/mobile/users/{$user->id}/report", [
        'reason' => 'Harassment or bullying',
    ])->assertStatus(422);
});
