<?php

use App\Models\Conversation;
use App\Models\Follower;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function replyReactUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => ['student'],
        'status' => 'Studying',
        'email_verified_at' => now(),
        'account_state' => 0,
    ], $overrides));
}

function replyReactConversation(User $a, User $b): Conversation
{
    Follower::query()->create([
        'follower_id' => $a->id,
        'followed_id' => $b->id,
    ]);
    Follower::query()->create([
        'follower_id' => $b->id,
        'followed_id' => $a->id,
    ]);

    return Conversation::query()->create([
        'user_one_id' => min($a->id, $b->id),
        'user_two_id' => max($a->id, $b->id),
    ]);
}

test('sender can reply to a message in the same conversation', function () {
    $sender = replyReactUser();
    $recipient = replyReactUser();
    $conversation = replyReactConversation($sender, $recipient);

    $parent = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $recipient->id,
        'body' => 'Original',
    ]);

    $this->actingAs($sender, 'sanctum')
        ->postJson('/api/mobile/chat/conversation/'.$conversation->id.'/send', [
            'body' => 'Reply body',
            'reply_to' => $parent->id,
        ])
        ->assertCreated()
        ->assertJsonPath('message.reply_to', $parent->id)
        ->assertJsonPath('message.reply_preview.id', $parent->id);
});

test('reply_to from another conversation is rejected', function () {
    $sender = replyReactUser();
    $recipient = replyReactUser();
    $outsider = replyReactUser();
    $conversation = replyReactConversation($sender, $recipient);
    $other = replyReactConversation($recipient, $outsider);

    $foreign = Message::query()->create([
        'conversation_id' => $other->id,
        'sender_id' => $outsider->id,
        'body' => 'Foreign',
    ]);

    $this->actingAs($sender, 'sanctum')
        ->postJson('/api/mobile/chat/conversation/'.$conversation->id.'/send', [
            'body' => 'Nope',
            'reply_to' => $foreign->id,
        ])
        ->assertUnprocessable();
});

test('participants can toggle and replace reactions', function () {
    $sender = replyReactUser();
    $recipient = replyReactUser();
    $conversation = replyReactConversation($sender, $recipient);

    $message = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $sender->id,
        'body' => 'React me',
    ]);

    $this->actingAs($recipient, 'sanctum')
        ->postJson('/api/mobile/chat/message/'.$message->id.'/react', [
            'reaction' => '❤️',
        ])
        ->assertOk()
        ->assertJsonPath('message.my_reaction', '❤️');

    expect(MessageReaction::query()->where('message_id', $message->id)->count())->toBe(1);

    $this->actingAs($recipient, 'sanctum')
        ->postJson('/api/mobile/chat/message/'.$message->id.'/react', [
            'reaction' => '👍',
        ])
        ->assertOk()
        ->assertJsonPath('message.my_reaction', '👍');

    expect(MessageReaction::query()->where('message_id', $message->id)->value('reaction'))->toBe('👍');

    $this->actingAs($recipient, 'sanctum')
        ->postJson('/api/mobile/chat/message/'.$message->id.'/react', [
            'reaction' => '👍',
        ])
        ->assertOk()
        ->assertJsonPath('message.my_reaction', null);

    expect(MessageReaction::query()->where('message_id', $message->id)->count())->toBe(0);
});

test('outsider cannot react to a conversation message', function () {
    $sender = replyReactUser();
    $recipient = replyReactUser();
    $outsider = replyReactUser();
    $conversation = replyReactConversation($sender, $recipient);

    $message = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $sender->id,
        'body' => 'Private',
    ]);

    $this->actingAs($outsider, 'sanctum')
        ->postJson('/api/mobile/chat/message/'.$message->id.'/react', [
            'reaction' => '❤️',
        ])
        ->assertForbidden();
});
