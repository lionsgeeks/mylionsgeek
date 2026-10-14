<?php

use App\Models\Post;
use App\Models\User;
use App\Models\UserBlock;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function repostProfileUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => ['student'],
        'status' => 'Studying',
        'email_verified_at' => now(),
        'account_state' => 0,
        'image' => 'pdp.png',
    ], $overrides));
}

function repostProfilePost(User $author, string $description, bool $hidden = false): Post
{
    $post = Post::query()->create([
        'user_id' => $author->id,
        'description' => $description,
        'images' => null,
        'status' => 1,
    ]);

    if ($hidden) {
        $post->forceFill(['is_hidden' => true])->save();
    }

    return $post;
}

function repostProfileRow(User $reposter, Post $post, string $createdAt): void
{
    DB::table('reposts_posts')->insert([
        'user_id' => $reposter->id,
        'post_id' => $post->id,
        'description' => null,
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
    ]);
}

function repostProfileGet(User $viewer, string $uri)
{
    Auth::forgetGuards();

    return test()->actingAs($viewer, 'sanctum')->getJson($uri);
}

test('a profile repost list includes every repost, newest first', function () {
    $reposter = repostProfileUser(['email' => 'reposter.all@example.com']);
    $author = repostProfileUser(['email' => 'author.all@example.com']);
    $other = repostProfileUser(['email' => 'other.reposter@example.com']);

    $oldest = repostProfilePost($author, 'Oldest reposted post');
    $middle = repostProfilePost($author, 'Middle reposted post');
    $newest = repostProfilePost($author, 'Newest reposted post');
    $someoneElse = repostProfilePost($author, 'Reposted by someone else');

    repostProfileRow($reposter, $oldest, now()->subDays(3)->toDateTimeString());
    repostProfileRow($reposter, $middle, now()->subDays(2)->toDateTimeString());
    repostProfileRow($reposter, $newest, now()->subDay()->toDateTimeString());
    repostProfileRow($other, $someoneElse, now()->toDateTimeString());

    $response = repostProfileGet($reposter, "/api/mobile/profile/{$reposter->id}/reposts?limit=20")
        ->assertOk()
        ->assertJsonCount(3, 'reposts')
        ->assertJsonPath('next_offset', null);

    $ids = collect($response->json('reposts'))
        ->pluck('interaction_post_id')
        ->map(fn ($id) => (int) $id)
        ->all();

    expect($ids)->toBe([(int) $newest->id, (int) $middle->id, (int) $oldest->id])
        ->and($response->json('reposts.0.type'))->toBe('repost')
        ->and($response->json('reposts.0.user.id'))->toBe($reposter->id)
        ->and($response->json('reposts.0.repost_of.description'))->toBe('Newest reposted post');
});

test('profile repost pages can be followed until every repost is returned', function () {
    $reposter = repostProfileUser(['email' => 'reposter.pages@example.com']);
    $author = repostProfileUser(['email' => 'author.pages@example.com']);
    $first = repostProfilePost($author, 'Page one');
    $second = repostProfilePost($author, 'Page two');

    repostProfileRow($reposter, $second, now()->subHour()->toDateTimeString());
    repostProfileRow($reposter, $first, now()->toDateTimeString());

    $page = repostProfileGet($reposter, "/api/mobile/profile/{$reposter->id}/reposts?limit=1&offset=0")
        ->assertOk()
        ->assertJsonCount(1, 'reposts')
        ->assertJsonPath('next_offset', 1)
        ->assertJsonPath('reposts.0.interaction_post_id', $first->id);

    repostProfileGet($reposter, "/api/mobile/profile/{$reposter->id}/reposts?limit=1&offset=".$page->json('next_offset'))
        ->assertOk()
        ->assertJsonCount(1, 'reposts')
        ->assertJsonPath('next_offset', null)
        ->assertJsonPath('reposts.0.interaction_post_id', $second->id);
});

test('hidden originals and another persons reposts are left out', function () {
    $viewer = repostProfileUser(['email' => 'viewer.hidden@example.com']);
    $reposter = repostProfileUser(['email' => 'reposter.hidden@example.com']);
    $author = repostProfileUser(['email' => 'author.hidden@example.com']);

    $visible = repostProfilePost($author, 'Visible');
    $hidden = repostProfilePost($author, 'Hidden', true);
    repostProfileRow($reposter, $visible, now()->subMinute()->toDateTimeString());
    repostProfileRow($reposter, $hidden, now()->toDateTimeString());

    $response = repostProfileGet($viewer, "/api/mobile/profile/{$reposter->id}/reposts")
        ->assertOk()
        ->assertJsonCount(1, 'reposts');

    expect((int) $response->json('reposts.0.interaction_post_id'))->toBe((int) $visible->id);
});

test('a blocked profile returns no reposts', function () {
    $viewer = repostProfileUser(['email' => 'viewer.block@example.com']);
    $reposter = repostProfileUser(['email' => 'reposter.block@example.com']);
    $author = repostProfileUser(['email' => 'author.block@example.com']);
    $post = repostProfilePost($author, 'Should stay hidden');
    repostProfileRow($reposter, $post, now()->toDateTimeString());

    UserBlock::query()->create([
        'blocker_id' => $viewer->id,
        'blocked_id' => $reposter->id,
    ]);

    repostProfileGet($viewer, "/api/mobile/profile/{$reposter->id}/reposts")
        ->assertOk()
        ->assertJsonCount(0, 'reposts')
        ->assertJsonPath('next_offset', null);
});

test('guests cannot list profile reposts and an unknown profile is not found', function () {
    $reposter = repostProfileUser(['email' => 'reposter.guest@example.com']);

    $this->getJson("/api/mobile/profile/{$reposter->id}/reposts")->assertUnauthorized();

    repostProfileGet($reposter, '/api/mobile/profile/999999/reposts')->assertNotFound();
});
