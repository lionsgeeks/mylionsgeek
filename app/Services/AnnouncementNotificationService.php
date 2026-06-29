<?php

namespace App\Services;

use Ably\AblyRest;
use App\Models\Announcement;
use App\Models\AnnouncementNotification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Throwable;

class AnnouncementNotificationService
{
    public function notifyAllUsers(Announcement $announcement, User $sender): void
    {
        set_time_limit(0);

        $ablyKey = config('services.ably.key');
        $ably = $ablyKey ? new AblyRest($ablyKey) : null;

        User::query()
            ->where('id', '!=', $sender->id)
            ->where(function ($query) {
                $query->whereNull('status')
                    ->orWhereRaw('LOWER(status) != ?', ['left']);
            })
            ->select('id')
            ->chunkById(200, function ($recipients) use ($announcement, $sender, $ably) {
                $timestamp = now();
                $recipientIds = $recipients->pluck('id')->all();

                $rows = array_map(
                    fn (int $userId) => [
                        'user_id' => $userId,
                        'announcement_id' => $announcement->id,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ],
                    $recipientIds
                );

                AnnouncementNotification::insert($rows);

                $notifications = AnnouncementNotification::query()
                    ->where('announcement_id', $announcement->id)
                    ->whereIn('user_id', $recipientIds)
                    ->get();

                foreach ($notifications as $notification) {
                    $this->broadcast($notification, $announcement, $sender, $ably);
                }
            });
    }

    private function broadcast(
        AnnouncementNotification $notification,
        Announcement $announcement,
        User $sender,
        ?AblyRest $ably
    ): void {
        if (!$ably) {
            return;
        }

        try {
            $channel = $ably->channels->get("notifications:{$notification->user_id}");

            $channel->publish('new_notification', [
                'id' => 'announcement-' . $notification->id,
                'type' => 'announcement',
                'sender_name' => $announcement->title,
                'sender_image' => $sender->image,
                'message' => $announcement->message,
                'link' => '/dashboard',
                'icon_type' => 'megaphone',
                'created_at' => $notification->created_at->toISOString(),
                'read_at' => null,
                'announcement_id' => $announcement->id,
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to broadcast announcement notification via Ably: ' . $e->getMessage(), [
                'notification_id' => $notification->id,
                'user_id' => $notification->user_id,
            ]);
        }
    }
}
