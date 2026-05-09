<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostReport;
use App\Models\PostReportNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PostReportController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status', PostReport::STATUS_PENDING);
        $status = in_array($status, [PostReport::STATUS_PENDING, PostReport::STATUS_ACCEPTED, PostReport::STATUS_REFUSED], true)
            ? $status
            : PostReport::STATUS_PENDING;

        $reports = PostReport::query()
            ->with([
                'post:id,user_id,description,images,created_at',
                'post.user:id,name,image',
                'reporter:id,name,image',
                'reviewer:id,name,image',
            ])
            ->where('status', $status)
            ->orderByDesc('created_at')
            ->paginate(25)
            ->through(function (PostReport $r) {
                return [
                    'id' => (int) $r->id,
                    'status' => (string) $r->status,
                    'reason' => $r->reason,
                    'created_at' => $r->created_at?->toISOString(),
                    'reviewed_at' => $r->reviewed_at?->toISOString(),
                    'post' => $this->formatPost($r->post),
                    'reporter' => $this->formatUser($r->reporter),
                    'reviewer' => $this->formatUser($r->reviewer),
                ];
            });

        return Inertia::render('admin/post-reports/index', [
            'reports' => $reports,
            'filters' => [
                'status' => $status,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function show(int $report)
    {
        $reportModel = PostReport::query()
            ->with([
                'post',
                'post.user:id,name,image',
                'reporter:id,name,image',
                'reviewer:id,name,image',
            ])
            ->findOrFail($report);

        // Mark this notification as read for the current user (if exists).
        PostReportNotification::query()
            ->where('post_report_id', $reportModel->id)
            ->where('notified_user_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('admin/post-reports/[id]', [
            'report' => [
                'id' => (int) $reportModel->id,
                'status' => (string) $reportModel->status,
                'reason' => $reportModel->reason,
                'created_at' => $reportModel->created_at?->toISOString(),
                'reviewed_at' => $reportModel->reviewed_at?->toISOString(),
                'post' => $this->formatPost($reportModel->post),
                'reporter' => $this->formatUser($reportModel->reporter),
                'reviewer' => $this->formatUser($reportModel->reviewer),
            ],
        ]);
    }

    public function accept(int $report)
    {
        return $this->resolve($report, PostReport::STATUS_ACCEPTED);
    }

    public function refuse(int $report)
    {
        return $this->resolve($report, PostReport::STATUS_REFUSED);
    }

    private function resolve(int $reportId, string $status)
    {
        /** @var PostReport $report */
        $report = PostReport::query()->with('post:id,is_hidden')->findOrFail($reportId);

        if ($report->status !== PostReport::STATUS_PENDING) {
            return redirect()
                ->route('admin.post-reports.show', $report->id)
                ->with('error', 'This report has already been resolved.');
        }

        DB::transaction(function () use ($report, $status) {
            $report->status = $status;
            $report->reviewed_by = Auth::id();
            $report->reviewed_at = now();
            $report->save();

            if ($report->post) {
                $report->post->is_hidden = $status === PostReport::STATUS_ACCEPTED;
                $report->post->save();
            }

            PostReportNotification::query()
                ->where('post_report_id', $report->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        });

        return redirect()
            ->route('admin.post-reports.show', $report->id)
            ->with('success', $status === PostReport::STATUS_ACCEPTED ? 'Report accepted.' : 'Report refused.');
    }

    private function formatUser($user): ?array
    {
        if (!$user) return null;
        return [
            'id' => (int) $user->id,
            'name' => (string) ($user->name ?? 'User'),
            'image' => $user->image,
        ];
    }

    private function formatPost(?Post $post): ?array
    {
        if (!$post) return null;

        $images = $post->images ?? [];
        if (is_string($images)) {
            $decoded = json_decode($images, true);
            $images = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        return [
            'id' => (int) $post->id,
            'description' => (string) ($post->description ?? ''),
            'images' => is_array($images) ? array_values(array_filter($images)) : [],
            'created_at' => $post->created_at?->toISOString(),
            'user' => $this->formatUser($post->user),
        ];
    }
}

