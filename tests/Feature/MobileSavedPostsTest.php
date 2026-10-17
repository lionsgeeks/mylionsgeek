<?php

use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function savedPostsUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => ['student'],
        'status' => 'Studying',
        'email_verified_at' => now(),
        'account_state' => 0,
        'image' => 'pdp.png',
    ], $overrides));
}

function savedPostsPost(User $author, string $description, bool $hidden = false): Post
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

function savedPostsRow(User $user, Post $post, string $createdAt): void
{
    DB::table('post_saves')->insert([
        'user_id' => $user->id,
        'post_id' => $post->id,
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
    ]);
}

function savedPostsAct(User $user)
{
    Auth::forgetGuards();

    return test()->actingAs($user, 'sanctum');
}

test('saved posts are listed newest first and a second tap unsaves', function () {
    $user = savedPostsUser(['email' => 'saver.toggle@example.com']);
    $author = savedPostsUser(['email' => 'author.toggle@example.com']);
    $older = savedPostsPost($author, 'Older saved post');
    $newer = savedPostsPost($author, 'Newer saved post');

    savedPostsAct($user)->postJson("/api/mobile/posts/save/{$older->id}")
        ->assertOk()
        ->assertJsonPath('saved', true);

    savedPostsRow($user, $newer, now()->toDateTimeString());

    $listed = savedPostsAct($user)->getJson('/api/mobile/posts/saved')
        ->assertOk()
        ->assertJsonCount(2, 'posts')
        ->assertJsonPath('next_offset', null);

    $ids = collect($listed->json('posts'))->pluck('id')->map(fn ($id) => (int) $id)->all();
    expect($ids[0])->toBe((int) $newer->id)
        ->and($listed->json('posts.0.is_saved_by_user'))->toBeTrue();

    savedPostsAct($user)->postJson("/api/mobile/posts/save/{$newer->id}")
        ->assertOk()
        ->assertJsonPath('saved', false)
        ->assertJsonPath('post_id', $newer->id);

    $after = savedPostsAct($user)->getJson('/api/mobile/posts/saved')->assertOk();
    $remaining = collect($after->json('posts'))->pluck('id')->map(fn ($id) => (int) $id)->all();

    expect($remaining)->toBe([(int) $older->id]);
});

test('saved post pages can be followed until every save is returned', function () {
    $user = savedPostsUser(['email' => 'saver.pages@example.com']);
    $author = savedPostsUser(['email' => 'author.pages@example.com']);
    $first = savedPostsPost($author, 'First page');
    $second = savedPostsPost($author, 'Second page');

    savedPostsRow($user, $second, now()->subHour()->toDateTimeString());
    savedPostsRow($user, $first, now()->toDateTimeString());

    $page = savedPostsAct($user)->getJson('/api/mobile/posts/saved?limit=1&offset=0')
        ->assertOk()
        ->assertJsonCount(1, 'posts')
        ->assertJsonPath('next_offset', 1)
        ->assertJsonPath('posts.0.id', $first->id);

    savedPostsAct($user)->getJson('/api/mobile/posts/saved?limit=1&offset='.$page->json('next_offset'))
        ->assertOk()
        ->assertJsonCount(1, 'posts')
        ->assertJsonPath('next_offset', null)
        ->assertJsonPath('posts.0.id', $second->id);
});

test('a hidden post is left out of saved posts', function () {
    $user = savedPostsUser(['email' => 'saver.hidden@example.com']);
    $author = savedPostsUser(['email' => 'author.hidden@example.com']);
    $visible = savedPostsPost($author, 'Visible save');
    $hidden = savedPostsPost($author, 'Hidden save', true);

    savedPostsRow($user, $visible, now()->subMinute()->toDateTimeString());
    savedPostsRow($user, $hidden, now()->toDateTimeString());

    $response = savedPostsAct($user)->getJson('/api/mobile/posts/saved')
        ->assertOk()
        ->assertJsonCount(1, 'posts');

    expect((int) $response->json('posts.0.id'))->toBe((int) $visible->id);
});

test('guests cannot list or toggle saves and another user does not see them', function () {
    $owner = savedPostsUser(['email' => 'saver.private@example.com']);
    $other = savedPostsUser(['email' => 'saver.other@example.com']);
    $author = savedPostsUser(['email' => 'author.private@example.com']);
    $post = savedPostsPost($author, 'Private save');
    savedPostsRow($owner, $post, now()->toDateTimeString());

    test()->getJson('/api/mobile/posts/saved')->assertUnauthorized();
    test()->postJson("/api/mobile/posts/save/{$post->id}")->assertUnauthorized();

    savedPostsAct($other)->getJson('/api/mobile/posts/saved')
        ->assertOk()
        ->assertJsonCount(0, 'posts');
});
