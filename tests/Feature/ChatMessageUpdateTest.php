<?php

use App\Models\Conversation;
use App\Models\Follower;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    Storage::fake('attachments');
});

function chatUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'role' => ['student'],
        'status' => 'Studying',
        'email_verified_at' => now(),
        'account_state' => 0,
    ], $overrides));
}

function chatConversation(User $sender, User $recipient): Conversation
{
    Follower::query()->create([
        'follower_id' => $sender->id,
        'followed_id' => $recipient->id,
    ]);

    return Conversation::query()->create([
        'user_one_id' => $sender->id,
        'user_two_id' => $recipient->id,
    ]);
}

test('sender can update a plain text chat message', function () {
    $sender = chatUser();
    $recipient = chatUser();
    $conversation = chatConversation($sender, $recipient);

    $message = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $sender->id,
        'body' => 'Hello there',
    ]);

    $this->actingAs($sender, 'sanctum')
        ->putJson('/api/mobile/chat/message/'.$message->id, [
            'body' => 'Hello updated',
        ])
        ->assertOk()
        ->assertJsonPath('message.body', 'Hello updated')
        ->assertJsonPath('message.edited', true);

    expect($message->fresh()->body)->toBe('Hello updated');
});

test('cannot update attachment or structured messages', function () {
    $sender = chatUser();
    $recipient = chatUser();
    $conversation = chatConversation($sender, $recipient);

    $withAttachment = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $sender->id,
        'body' => 'caption',
        'attachment_path' => 'chat/attachments/photo.jpg',
        'attachment_type' => 'image',
        'attachment_name' => 'photo.jpg',
    ]);

    $this->actingAs($sender, 'sanctum')
        ->putJson('/api/mobile/chat/message/'.$withAttachment->id, [
            'body' => 'new caption',
        ])
        ->assertUnprocessable();

    $storyReply = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $sender->id,
        'body' => json_encode([
            'type' => 'story_reply',
            'text' => 'nice',
        ]),
    ]);

    $this->actingAs($sender, 'sanctum')
        ->putJson('/api/mobile/chat/message/'.$storyReply->id, [
            'body' => 'edited',
        ])
        ->assertUnprocessable();
});

test('recipient cannot update someone elses message', function () {
    $sender = chatUser();
    $recipient = chatUser();
    $conversation = chatConversation($sender, $recipient);

    $message = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $sender->id,
        'body' => 'mine',
    ]);

    $this->actingAs($recipient, 'sanctum')
        ->putJson('/api/mobile/chat/message/'.$message->id, [
            'body' => 'hacked',
        ])
        ->assertNotFound();
});
