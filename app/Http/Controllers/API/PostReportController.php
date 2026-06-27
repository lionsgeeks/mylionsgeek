<?php

namespace App\Http\Controllers\API;

use Ably\AblyRest;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostReport;
use App\Models\PostReportNotification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class PostReportController extends Controller
{
    public function store(Request $request, int $postId)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:2000',
        ]);

        $post = Post::with('user:id,name')->findOrFail($postId);

        if ((int) $post->user_id === (int) $user->id) {
            return response()->json(['message' => 'You cannot report your own post'], 422);
        }

        try {
            $report = null;

            DB::transaction(function () use ($validated, $user, $post, &$report) {
                $report = PostReport::query()->firstOrCreate(
                    [
                        'post_id' => (int) $post->id,
                        'reporter_id' => (int) $user->id,
                    ],
                    [
                        'reason' => (string) ($validated['reason'] ?? ''),
                        'status' => PostReport::STATUS_PENDING,
                    ]
                );

                // If the report already existed and is still pending, allow updating the reason.
                if ($report->wasRecentlyCreated === false && $report->status === PostReport::STATUS_PENDING) {
                    $incoming = (string) ($validated['reason'] ?? '');
                    if ($incoming !== '' && $incoming !== (string) ($report->reason ?? '')) {
                        $report->reason = $incoming;
                        $report->save();
                    }
                }
            });

            $this->notifyAdminsAboutReport($report, $user);

            return response()->json([
                'message' => 'Report submitted',
                'report' => [
                    'id' => (int) $report->id,
                    'post_id' => (int) $report->post_id,
                    'status' => (string) $report->status,
                ],
            ], 201);
        } catch (Throwable $e) {
            Log::error('Failed to create post report: ' . $e->getMessage());
            report($e);
            return response()->json(['message' => 'Failed to submit report'], 500);
        }
    }

    public function accept(Request $request, int $reportId)
    {
        return $this->resolve($request, $reportId, PostReport::STATUS_ACCEPTED);
    }

    public function refuse(Request $request, int $reportId)
    {
        return $this->resolve($request, $reportId, PostReport::STATUS_REFUSED);
    }

    private function resolve(Request $request, int $reportId, string $status)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$this->isStaff($user)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            /** @var PostReport $report */
            $report = PostReport::query()
                ->with(['post:id,user_id,is_hidden', 'reporter:id,name,image'])
                ->findOrFail($reportId);

            if ($report->status !== PostReport::STATUS_PENDING) {
                return response()->json([
                    'message' => 'This report was already resolved',
                    'report' => [
                        'id' => (int) $report->id,
                        'status' => (string) $report->status,
                    ],
                ], 409);
            }

            DB::transaction(function () use ($report, $status, $user) {
                $report->status = $status;
                $report->reviewed_by = (int) $user->id;
                $report->reviewed_at = now();
                $report->save();

                // Hide/unhide post based on report decision.
                if ($report->post) {
                    $report->post->is_hidden = $status === PostReport::STATUS_ACCEPTED;
                    $report->post->save();
                }

                // Mark all staff notifications about this report as read (optional, but keeps inbox clean)
                PostReportNotification::query()
                    ->where('post_report_id', $report->id)
                    ->whereNull('read_at')
                    ->update(['read_at' => now()]);
            });

            return response()->json([
                'message' => 'Report updated',
                'report' => [
                    'id' => (int) $report->id,
                    'post_id' => (int) $report->post_id,
                    'status' => (string) $report->status,
                    'reviewed_by' => (int) $report->reviewed_by,
                    'reviewed_at' => $report->reviewed_at?->toISOString(),
                    'post_is_hidden' => (bool) ($report->post?->is_hidden ?? false),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to resolve post report: ' . $e->getMessage());
            report($e);
            return response()->json(['message' => 'Failed to resolve report'], 500);
        }
    }

    private function notifyAdminsAboutReport(PostReport $report, User $reporter): void
    {
        try {
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
                $notif = PostReportNotification::query()->create([
                    'notified_user_id' => (int) $admin->id,
                    'post_report_id' => (int) $report->id,
                ]);

                if (!$ably) {
                    continue;
                }

                $channel = $ably->channels->get("notifications:{$admin->id}");
                $channel->publish('new_notification', [
                    'id' => 'post-report-' . $notif->id,
                    'type' => 'post_report',
                    'sender_name' => $reporter->name,
                    'sender_image' => $reporter->image,
                    'message' => "{$reporter->name} reported a post",
                    // Web deep-link
                    'link' => "/admin/post-reports/{$report->id}",
                    // Mobile deep-link (optional)
                    'mobile_link' => "/posts/{$report->post_id}?reportId={$report->id}",
                    'created_at' => $notif->created_at->toISOString(),
                    'read_at' => null,
                    'post_id' => (int) $report->post_id,
                    'report_id' => (int) $report->id,
                ]);
            }
        } catch (Throwable $e) {
            Log::error('Failed to notify admins about post report via Ably: ' . $e->getMessage());
            report($e);
        }
    }

    private function isStaff(User $user): bool
    {
        $roles = is_array($user->role) ? $user->role : [$user->role];
        $allowed = ['admin', 'super_admin', 'moderateur', 'coach', 'studio_responsable'];
        return count(array_intersect($roles, $allowed)) > 0;
    }
}

