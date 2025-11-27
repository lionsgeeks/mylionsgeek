<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    /**
     * Get all conversations for the authenticated user
     */
    public function index()
    {
        $user = Auth::user();

        // Get IDs of users that the current user follows
        $followingIds = \App\Models\Follower::where('follower_id', $user->id)
            ->pluck('followed_id')
            ->toArray();

        $conversations = Conversation::where(function ($query) use ($user, $followingIds) {
            $query->where('user_one_id', $user->id)
                ->whereIn('user_two_id', $followingIds);
        })->orWhere(function ($query) use ($user, $followingIds) {
            $query->where('user_two_id', $user->id)
                ->whereIn('user_one_id', $followingIds);
        })
            ->with(['userOne', 'userTwo', 'messages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($user) {
                $otherUser = $conversation->getOtherUser($user->id);
                $unreadCount = $conversation->getUnreadCountForUser($user->id);
                $lastMessage = $conversation->messages->first();

                return [
                    'id' => $conversation->id,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'image' => $otherUser->image,
                        'email' => $otherUser->email,
                    ],
                    'last_message' => $lastMessage ? [
                        'id' => $lastMessage->id,
                        'body' => $lastMessage->body,
                        'sender_id' => $lastMessage->sender_id,
                        'created_at' => $lastMessage->created_at->toISOString(),
                    ] : null,
                    'unread_count' => $unreadCount,
                    'last_message_at' => $conversation->last_message_at?->toISOString(),
                    'created_at' => $conversation->created_at->toISOString(),
                ];
            });

        if (request()->header('X-Inertia')) {
            return redirect()->back()->with([
                'conversations' => $conversations,
            ]);
        }
        
        return response()->json([
            'conversations' => $conversations,
        ]);
    }

    /**
     * Get or create a conversation between two users
     */
    public function getOrCreateConversation($userId)
    {
        $currentUser = Auth::user();

        if ($currentUser->id == $userId) {
            if (request()->header('X-Inertia')) {
                return redirect()->back()->withErrors(['error' => 'Cannot create conversation with yourself']);
            }
            return response()->json(['error' => 'Cannot create conversation with yourself'], 400);
        }

        // Check if current user is following the target user
        $isFollowing = \App\Models\Follower::where('follower_id', $currentUser->id)
            ->where('followed_id', $userId)
            ->exists();

        if (!$isFollowing) {
            if (request()->header('X-Inertia')) {
                return redirect()->back()->withErrors(['error' => 'You can only message users you follow']);
            }
            return response()->json(['error' => 'You can only message users you follow'], 403);
        }

        // Check if conversation exists
        $conversation = Conversation::where(function ($query) use ($currentUser, $userId) {
            $query->where('user_one_id', $currentUser->id)
                ->where('user_two_id', $userId);
        })->orWhere(function ($query) use ($currentUser, $userId) {
            $query->where('user_one_id', $userId)
                ->where('user_two_id', $currentUser->id);
        })->first();

        // Create if doesn't exist
        if (!$conversation) {
            $conversation = Conversation::create([
                'user_one_id' => min($currentUser->id, $userId),
                'user_two_id' => max($currentUser->id, $userId),
            ]);
        }

        $conversation->load(['userOne', 'userTwo', 'messages' => function ($query) {
            $query->orderBy('created_at', 'asc');
        }]);

        $otherUser = $conversation->getOtherUser($currentUser->id);

        $conversationData = [
            'id' => $conversation->id,
            'other_user' => [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'image' => $otherUser->image,
                'email' => $otherUser->email,
            ],
            'messages' => $conversation->messages->map(function ($message) {
                return [
                    'id' => $message->id,
                    'body' => $message->body,
                    'sender_id' => $message->sender_id,
                    'attachment_path' => $message->attachment_path,
                    'attachment_type' => $message->attachment_type,
                    'attachment_name' => $message->attachment_name,
                    'attachment_size' => $message->attachment_path && file_exists(storage_path('app/public/' . $message->attachment_path)) ? filesize(storage_path('app/public/' . $message->attachment_path)) : null,
                    'is_read' => $message->is_read,
                    'read_at' => $message->read_at ? $message->read_at->toISOString() : null,
                    'created_at' => $message->created_at->toISOString(),
                ];
            }),
        ];

        if (request()->header('X-Inertia')) {
            return redirect()->back()->with([
                'conversation' => $conversationData,
            ]);
        }
        
        return response()->json([
            'conversation' => $conversationData,
        ]);
    }

    /**
     * Get messages for a specific conversation
     */
    public function getMessages($conversationId)
    {
        $user = Auth::user();

        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($user) {
                $query->where('user_one_id', $user->id)
                    ->orWhere('user_two_id', $user->id);
            })
            ->firstOrFail();

        $messages = $conversation->messages()
            ->with('sender:id,name,image')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'body' => $message->body,
                    'sender_id' => $message->sender_id,
                    'sender' => [
                        'id' => $message->sender->id,
                        'name' => $message->sender->name,
                        'image' => $message->sender->image,
                    ],
                    'attachment_path' => $message->attachment_path,
                    'attachment_type' => $message->attachment_type,
                    'attachment_name' => $message->attachment_name,
                    'attachment_size' => $message->attachment_path && file_exists(storage_path('app/public/' . $message->attachment_path)) ? filesize(storage_path('app/public/' . $message->attachment_path)) : null,
                    'is_read' => $message->is_read,
                    'read_at' => $message->read_at ? $message->read_at->toISOString() : null,
                    'created_at' => $message->created_at->toISOString(),
                ];
            });

        // Mark messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        // Always return JSON for fetch requests
        return response()->json([
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request, $conversationId)
    {
        $request->validate([
            'body' => 'nullable|string|max:5000',
            'attachment' => 'nullable|file|max:10240', // 10MB max
            'attachment_type' => 'nullable|in:file,audio,image,video',
        ]);

        $user = Auth::user();

        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($user) {
                $query->where('user_one_id', $user->id)
                    ->orWhere('user_two_id', $user->id);
            })
            ->firstOrFail();

        // Get the other user
        $otherUserId = $conversation->user_one_id == $user->id 
            ? $conversation->user_two_id 
            : $conversation->user_one_id;

        // Check if current user is following the other user
        $isFollowing = \App\Models\Follower::where('follower_id', $user->id)
            ->where('followed_id', $otherUserId)
            ->exists();

        if (!$isFollowing) {
            if (request()->header('X-Inertia')) {
                return redirect()->back()->withErrors(['error' => 'You can only message users you follow']);
            }
            return response()->json(['error' => 'You can only message users you follow'], 403);
        }

        // Require either body or attachment
        if (empty($request->body) && !$request->hasFile('attachment')) {
            if (request()->header('X-Inertia')) {
                return redirect()->back()->withErrors(['error' => 'Message body or attachment is required']);
            }
            return response()->json(['error' => 'Message body or attachment is required'], 422);
        }

        $attachmentPath = null;
        $attachmentName = null;
        $attachmentType = $request->attachment_type;

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentName = $file->getClientOriginalName();
            
            // Determine attachment type if not provided
            if (!$attachmentType) {
                $mimeType = $file->getMimeType();
                if (str_starts_with($mimeType, 'image/')) {
                    $attachmentType = 'image';
                } elseif (str_starts_with($mimeType, 'audio/')) {
                    $attachmentType = 'audio';
                } elseif (str_starts_with($mimeType, 'video/')) {
                    $attachmentType = 'video';
                } else {
                    $attachmentType = 'file';
                }
            }

            // Store file
            $attachmentPath = $file->store('chat/attachments', 'public');
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $request->body ?? '',
            'attachment_path' => $attachmentPath,
            'attachment_type' => $attachmentType,
            'attachment_name' => $attachmentName,
            'is_read' => false,
        ]);

        // Update conversation's last_message_at
        $conversation->update([
            'last_message_at' => now(),
        ]);

        $message->load('sender:id,name,image');

        $messageData = [
            'id' => $message->id,
            'body' => $message->body,
            'sender_id' => $message->sender_id,
            'sender' => [
                'id' => $message->sender->id,
                'name' => $message->sender->name,
                'image' => $message->sender->image,
            ],
            'attachment_path' => $message->attachment_path,
            'attachment_type' => $message->attachment_type,
            'attachment_name' => $message->attachment_name,
            'attachment_size' => $message->attachment_path && file_exists(storage_path('app/public/' . $message->attachment_path)) ? filesize(storage_path('app/public/' . $message->attachment_path)) : null,
            'is_read' => $message->is_read,
            'read_at' => $message->read_at ? $message->read_at->toISOString() : null,
            'created_at' => $message->created_at->toISOString(),
        ];

        // Always return JSON for fetch requests
        return response()->json([
            'message' => $messageData,
        ], 201);
    }

    /**
     * Get unread messages count
     */
    public function getUnreadCount()
    {
        $user = Auth::user();

        $conversations = Conversation::where('user_one_id', $user->id)
            ->orWhere('user_two_id', $user->id)
            ->get();

        $totalUnread = 0;
        foreach ($conversations as $conversation) {
            $totalUnread += $conversation->getUnreadCountForUser($user->id);
        }

        if (request()->header('X-Inertia')) {
            return redirect()->back()->with([
                'unread_count' => $totalUnread,
            ]);
        }
        
        return response()->json([
            'unread_count' => $totalUnread,
        ]);
    }

    /**
     * Mark conversation as read
     */
    public function markAsRead($conversationId)
    {
        $user = Auth::user();

        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($user) {
                $query->where('user_one_id', $user->id)
                    ->orWhere('user_two_id', $user->id);
            })
            ->firstOrFail();

        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        // Always return JSON for fetch requests
        return response()->json(['success' => true]);
    }

    /**
     * Delete a message
     */
    public function deleteMessage($messageId)
    {
        $user = Auth::user();

        $message = Message::where('id', $messageId)
            ->where('sender_id', $user->id)
            ->firstOrFail();

        // Delete attachment file if exists
        if ($message->attachment_path) {
            $filePath = storage_path('app/public/' . $message->attachment_path);
            if (file_exists($filePath)) {
                @unlink($filePath);
            }
        }

        $message->delete();

        // Always return JSON for fetch requests
        return response()->json(['success' => true]);
    }

    /**
     * Get posts for a user
     */
    public function getUserPosts($userId)
    {
        $userController = new \App\Http\Controllers\UsersController();
        $posts = $userController->getPosts($userId);
        
        // Always return JSON for fetch requests
        return response()->json(['posts' => $posts]);
    }

    /**
     * Delete a conversation
     */
    public function deleteConversation($conversationId)
    {
        $user = Auth::user();

        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($user) {
                $query->where('user_one_id', $user->id)
                    ->orWhere('user_two_id', $user->id);
            })
            ->firstOrFail();

        $conversation->delete();

        // Always return JSON for fetch requests
        return response()->json(['success' => true]);
    }
}
