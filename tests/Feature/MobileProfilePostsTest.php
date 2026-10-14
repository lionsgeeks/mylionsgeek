<?php

use App\Models\Post;
use App\Models\User;
use App\Models\UserBlock;
use Illuminate\Support\Facades\Auth;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function profilePostsUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => ['student'],
        'status' => 'Studying',
        'email_verified_at' => now(),
        'account_state' => 0,
        'image' => 'pdp.png',
    ], $overrides));
}

function profilePostsPost(User $author, string $description, string $createdAt, bool $hidden = false): Post
{
    $post = Post::query()->create([
        'user_id' => $author->id,
        'description' => $description,
        'images' => null,
        'status' => 1,
    ]);

    $post->forceFill([
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
        'is_hidden' => $hidden,
    ])->save();

    return $post->refresh();
}

function profilePostsGet(User $viewer, string $uri)
{
    Auth::forgetGuards();

    return test()->actingAs($viewer, 'sanctum')->getJson($uri);
}

test('a profile posts list includes every post that user wrote, newest first', function () {
    $author = profilePostsUser(['email' => 'author.posts@example.com']);
    $other = profilePostsUser(['email' => 'other.posts@example.com']);

    $oldest = profilePostsPost($author, 'Oldest', now()->subDays(3)->toDateTimeString());
    $middle = profilePostsPost($author, 'Middle', now()->subDays(2)->toDateTimeString());
    $newest = profilePostsPost($author, 'Newest', now()->subDay()->toDateTimeString());
    profilePostsPost($other, 'Someone else', now()->toDateTimeString());

    $response = profilePostsGet($author, "/api/mobile/profile/{$author->id}/posts?limit=20")
        ->assertOk()
        ->assertJsonCount(3, 'posts')
        ->assertJsonPath('next_offset', null);

    $ids = collect($response->json('posts'))->pluck('id')->map(fn ($id) => (int) $id)->all();

    expect($ids)->toBe([(int) $newest->id, (int) $middle->id, (int) $oldest->id])
        ->and($response->json('posts.0.user.id'))->toBe($author->id)
        ->and($response->json('posts.0.description'))->toBe('Newest');
});

test('profile post pages can be followed until every post is returned', function () {
    $author = profilePostsUser(['email' => 'author.pages@example.com']);
    $older = profilePostsPost($author, 'Older page', now()->subHour()->toDateTimeString());
    $newer = profilePostsPost($author, 'Newer page', now()->toDateTimeString());

    $page = profilePostsGet($author, "/api/mobile/profile/{$author->id}/posts?limit=1&offset=0")
        ->assertOk()
        ->assertJsonCount(1, 'posts')
        ->assertJsonPath('next_offset', 1)
        ->assertJsonPath('posts.0.id', $newer->id);

    profilePostsGet($author, "/api/mobile/profile/{$author->id}/posts?limit=1&offset=".$page->json('next_offset'))
        ->assertOk()
        ->assertJsonCount(1, 'posts')
        ->assertJsonPath('next_offset', null)
        ->assertJsonPath('posts.0.id', $older->id);
});

test('a hidden post is left out and a blocked profile returns nothing', function () {
    $viewer = profilePostsUser(['email' => 'viewer.posts@example.com']);
    $author = profilePostsUser(['email' => 'author.hidden.posts@example.com']);
    $visible = profilePostsPost($author, 'Visible', now()->subMinute()->toDateTimeString());
    profilePostsPost($author, 'Hidden', now()->toDateTimeString(), true);

    $response = profilePostsGet($viewer, "/api/mobile/profile/{$author->id}/posts")
        ->assertOk()
        ->assertJsonCount(1, 'posts');

    expect((int) $response->json('posts.0.id'))->toBe((int) $visible->id);

    UserBlock::query()->create([
        'blocker_id' => $viewer->id,
        'blocked_id' => $author->id,
    ]);

    profilePostsGet($viewer, "/api/mobile/profile/{$author->id}/posts")
        ->assertOk()
        ->assertJsonCount(0, 'posts')
        ->assertJsonPath('next_offset', null);
});

test('guests cannot list profile posts and an unknown profile is not found', function () {
    $author = profilePostsUser(['email' => 'author.guest.posts@example.com']);

    $this->getJson("/api/mobile/profile/{$author->id}/posts")->assertUnauthorized();

    profilePostsGet($author, '/api/mobile/profile/999999/posts')->assertNotFound();
});
