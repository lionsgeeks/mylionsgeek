<?php

namespace App\Http\Controllers\API;

use Ably\AblyRest;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserBlock;
use App\Models\UserBlockNotification;
use App\Models\UserReport;
use App\Models\UserReportNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Throwable;

class UserModerationController extends Controller
{
    public function report(Request $request, int $userId)
    {
        $reporter = Auth::guard('sanctum')->user();
        if (! $reporter instanceof User) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ((int) $reporter->id === (int) $userId) {
            return response()->json(['message' => 'You cannot report yourself'], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:2000',
        ]);

        $reported = User::query()->findOrFail($userId);

        try {
            $report = null;
            $shouldNotify = false;

            DB::transaction(function () use ($validated, $reporter, $reported, &$report, &$shouldNotify) {
                $report = UserReport::query()->firstOrCreate(
                    [
                        'reporter_id' => (int) $reporter->id,
                        'reported_user_id' => (int) $reported->id,
                    ],
                    [
                        'reason' => (string) $validated['reason'],
                        'status' => UserReport::STATUS_PENDING,
                    ]
                );

                $shouldNotify = $report->wasRecentlyCreated;

                if ($report->wasRecentlyCreated === false && $report->status === UserReport::STATUS_PENDING) {
                    $incoming = (string) $validated['reason'];
                    if ($incoming !== '' && $incoming !== (string) ($report->reason ?? '')) {
                        $report->reason = $incoming;
                        $report->save();
                        $shouldNotify = true;
                    }
                }
            });

            if ($shouldNotify && $report) {
                $this->notifyStaffAboutUserReport($report, $reporter, $reported);
            }

            return response()->json([
                'message' => 'Report submitted',
                'report' => [
                    'id' => (int) $report->id,
                    'reported_user_id' => (int) $report->reported_user_id,
                    'status' => (string) $report->status,
                ],
            ], 201);
        } catch (Throwable $e) {
            Log::error('Failed to create user report: '.$e->getMessage());
            report($e);

            return response()->json(['message' => 'Failed to submit report'], 500);
        }
    }

    public function block(Request $request, int $userId)
    {
        $blocker = Auth::guard('sanctum')->user();
        if (! $blocker instanceof User) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ((int) $blocker->id === (int) $userId) {
            return response()->json(['message' => 'You cannot block yourself'], 422);
        }

        $blocked = User::query()->findOrFail($userId);

        try {
            $block = null;
            $created = false;

            DB::transaction(function () use ($blocker, $blocked, &$block, &$created) {
                $block = UserBlock::query()->firstOrCreate([
                    'blocker_id' => (int) $blocker->id,
                    'blocked_id' => (int) $blocked->id,
                ]);
                $created = $block->wasRecentlyCreated;
            });

            if ($created && $block) {
                $this->notifyStaffAboutUserBlock($block, $blocker, $blocked);
            }

            return response()->json([
                'message' => $created ? 'User blocked' : 'User already blocked',
                'blocked' => true,
                'blocked_user_id' => (int) $blocked->id,
            ], $created ? 201 : 200);
        } catch (Throwable $e) {
            Log::error('Failed to block user: '.$e->getMessage());
            report($e);

            return response()->json(['message' => 'Failed to block user'], 500);
        }
    }

    public function unblock(Request $request, int $userId)
    {
        $blocker = Auth::guard('sanctum')->user();
        if (! $blocker instanceof User) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        UserBlock::query()
            ->where('blocker_id', (int) $blocker->id)
            ->where('blocked_id', (int) $userId)
            ->delete();

        return response()->json([
            'message' => 'User unblocked',
            'blocked' => false,
            'blocked_user_id' => (int) $userId,
        ]);
    }

    public function index(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        if (! $user instanceof User) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'blocked_user_ids' => $user->blockedUserIds(),
        ]);
    }

    private function notifyStaffAboutUserReport(UserReport $report, User $reporter, User $reported): void
    {
        if (! Schema::hasTable('user_report_notifications')) {
            return;
        }

        $admins = User::query()
            ->select(['id', 'name', 'image', 'role'])
            ->get()
            ->filter(fn (User $u) => $this->isStaff($u))
            ->values();

        if ($admins->isEmpty()) {
            return;
        }

        $ablyKey = config('services.ably.key');
        $ably = $ablyKey ? new AblyRest($ablyKey) : null;

        foreach ($admins as $admin) {
            try {
                $notif = UserReportNotification::query()->create([
                    'notified_user_id' => (int) $admin->id,
                    'user_report_id' => (int) $report->id,
                ]);

                if (! $ably) {
                    continue;
                }

                try {
                    $channel = $ably->channels->get("notifications:{$admin->id}");
                    $channel->publish('new_notification', [
                        'id' => 'user-report-'.$notif->id,
                        'type' => 'user_report',
                        'sender_name' => $reporter->name,
                        'sender_image' => $reporter->image,
                        'message' => "{$reporter->name} reported {$reported->name}",
                        'link' => '/admin/users/'.$reported->id,
                        'mobile_link' => '/profile/'.$reported->id,
                        'icon_type' => 'flag',
                        'created_at' => $notif->created_at->toISOString(),
                        'read_at' => null,
                        'reported_user_id' => (int) $reported->id,
                        'report_id' => (int) $report->id,
                    ]);
                } catch (Throwable $e) {
                    Log::warning('Failed to publish user report notification via Ably for admin '.$admin->id.': '.$e->getMessage());
                }
            } catch (Throwable $e) {
                Log::error('Failed to create user report notification for admin '.$admin->id.': '.$e->getMessage());
                report($e);
            }
        }
    }

    private function notifyStaffAboutUserBlock(UserBlock $block, User $blocker, User $blocked): void
    {
        if (! Schema::hasTable('user_block_notifications')) {
            return;
        }

        $admins = User::query()
            ->select(['id', 'name', 'image', 'role'])
            ->get()
            ->filter(fn (User $u) => $this->isStaff($u))
            ->values();

        if ($admins->isEmpty()) {
            return;
        }

        $ablyKey = config('services.ably.key');
        $ably = $ablyKey ? new AblyRest($ablyKey) : null;

        foreach ($admins as $admin) {
            try {
                $notif = UserBlockNotification::query()->create([
                    'notified_user_id' => (int) $admin->id,
                    'user_block_id' => (int) $block->id,
                ]);

                if (! $ably) {
                    continue;
                }

                try {
                    $channel = $ably->channels->get("notifications:{$admin->id}");
                    $channel->publish('new_notification', [
                        'id' => 'user-block-'.$notif->id,
                        'type' => 'user_block',
                        'sender_name' => $blocker->name,
                        'sender_image' => $blocker->image,
                        'message' => "{$blocker->name} blocked {$blocked->name}",
                        'link' => '/admin/users/'.$blocked->id,
                        'mobile_link' => '/profile/'.$blocked->id,
                        'icon_type' => 'ban',
                        'created_at' => $notif->created_at->toISOString(),
                        'read_at' => null,
                        'blocked_user_id' => (int) $blocked->id,
                        'block_id' => (int) $block->id,
                    ]);
                } catch (Throwable $e) {
                    Log::warning('Failed to publish user block notification via Ably for admin '.$admin->id.': '.$e->getMessage());
                }
            } catch (Throwable $e) {
                Log::error('Failed to create user block notification for admin '.$admin->id.': '.$e->getMessage());
                report($e);
            }
        }
    }

    private function isStaff(User $user): bool
    {
        $roles = is_array($user->role) ? $user->role : [$user->role];
        $allowed = ['admin', 'super_admin', 'moderateur', 'coach', 'studio_responsable'];

        return count(array_intersect($roles, $allowed)) > 0;
    }
}
