<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Computer;
use App\Models\Equipment;
use App\Models\Formation;
use App\Models\Project;
use App\Models\Reservation;
use App\Models\ReservationCowork;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // Total counts with safety checks
            $stats = [
                'users' => Schema::hasTable('users') ? User::count() : 0,
                'reservations' => Schema::hasTable('reservations')
                    ? Reservation::where('canceled', 0)->count()
                    : 0,
                'cowork_reservations_today' => Schema::hasTable('reservation_coworks')
                    ? ReservationCowork::whereDate('day', today())
                        ->where('canceled', 0)
                        ->count()
                    : 0,
                'computers' => Schema::hasTable('computers') ? Computer::count() : 0,
                'equipment' => Schema::hasTable('equipment') ? Equipment::count() : 0,
                'projects' => Schema::hasTable('projects') ? Project::count() : 0,
                'trainings' => Schema::hasTable('formations')
                    ? Formation::whereNotNull('start_time')
                        ->where('start_time', '!=', 'NULL')
                        ->where('start_time', '!=', '')
                        ->get()
                        ->filter(function ($formation) {
                            if (! $formation->start_time || $formation->start_time === 'NULL' || $formation->start_time === '') {
                                return false;
                            }
                            try {
                                $startDate = Carbon::parse($formation->start_time);

                                // Calculate months difference (can be negative for future dates)
                                $monthsDifference = now()->diffInMonths($startDate, false);

                                // Include trainings where start date is within 6 months (past or future)
                                // Use absolute value to handle both past and future dates
                                return abs($monthsDifference) < 6;
                            } catch (\Exception $e) {
                                Log::warning('Failed to parse training start_time: '.$formation->start_time.' - '.$e->getMessage());

                                return false;
                            }
                        })
                        ->count()
                    : 0,
                'appointments' => Schema::hasTable('reservations')
                    ? Reservation::where('type', 'appointment')
                        ->where('canceled', 0)
                        ->where('approved', 0)
                        ->count()
                    : 0,
            ];

            // Computer stats
            $computerStats = [
                'total' => Schema::hasTable('computers') ? Computer::count() : 0,
                'working' => Schema::hasTable('computers')
                    ? Computer::whereRaw('LOWER(TRIM(state)) = ?', ['working'])->count()
                    : 0,
                'not_working' => Schema::hasTable('computers')
                    ? Computer::whereRaw('LOWER(TRIM(state)) = ?', ['not_working'])->count()
                    : 0,
                'damaged' => Schema::hasTable('computers')
                    ? Computer::whereRaw('LOWER(TRIM(state)) = ?', ['damaged'])->count()
                    : 0,
                'assigned' => Schema::hasTable('computers')
                    ? Computer::whereNotNull('user_id')->where('user_id', '!=', 0)->count()
                    : 0,
            ];

            // Equipment stats
            $equipmentStats = [
                'total' => Schema::hasTable('equipment') ? Equipment::count() : 0,
                'working' => Schema::hasTable('equipment')
                    ? Equipment::where('state', 1)->count()
                    : 0,
                'not_working' => Schema::hasTable('equipment')
                    ? Equipment::where('state', 0)->count()
                    : 0,
            ];

            // Project stats
            $projectStats = [
                'total' => Schema::hasTable('projects') ? Project::count() : 0,
                'active' => Schema::hasTable('projects')
                    ? Project::where('status', 'active')->count()
                    : 0,
                'completed' => Schema::hasTable('projects')
                    ? Project::where('status', 'completed')->count()
                    : 0,
                'on_hold' => Schema::hasTable('projects')
                    ? Project::where('status', 'on_hold')->count()
                    : 0,
            ];

            // Recent reservations
            $recentReservations = [];
            if (Schema::hasTable('reservations')) {
                $recentReservations = Reservation::with(['user:id,name', 'studio:id,name'])
                    ->where('canceled', 0)
                    ->orderByDesc('created_at')
                    ->limit(5)
                    ->get(['id', 'title', 'day', 'start', 'end', 'type', 'user_id', 'studio_id', 'created_at'])
                    ->map(function ($r) {
                        return [
                            'id' => $r->id,
                            'title' => $r->title ?? 'Untitled',
                            'type' => $r->type ?? 'N/A',
                            'date' => $r->day ?? 'N/A',
                            'time' => ($r->start && $r->end) ? ($r->start.' - '.$r->end) : 'N/A',
                            'user_name' => $r->user->name ?? 'N/A',
                            'studio_name' => $r->studio->name ?? 'N/A',
                            'created_at' => $r->created_at?->diffForHumans() ?? 'N/A',
                        ];
                    })->toArray();
            }

            // Pending appointments
            $pendingAppointments = [];
            if (Schema::hasTable('reservations')) {
                $pendingAppointments = Reservation::with(['user:id,name'])
                    ->where('type', 'appointment')
                    ->where('canceled', 0)
                    ->where('approved', 0)
                    ->orderByDesc('created_at')
                    ->limit(5)
                    ->get(['id', 'title', 'day', 'start', 'end', 'user_id', 'created_at'])
                    ->map(function ($r) {
                        return [
                            'id' => $r->id,
                            'title' => $r->title ?? 'Untitled',
                            'date' => $r->day ?? 'N/A',
                            'time' => ($r->start && $r->end) ? ($r->start.' - '.$r->end) : 'N/A',
                            'user_name' => $r->user->name ?? 'N/A',
                            'created_at' => $r->created_at?->diffForHumans() ?? 'N/A',
                        ];
                    })->toArray();
            }

            // Recent users
            $recentUsers = [];
            if (Schema::hasTable('users')) {
                $recentUsers = User::orderByDesc('created_at')
                    ->limit(5)
                    ->get(['id', 'name', 'email', 'image', 'created_at'])
                    ->map(function ($u) {
                        return [
                            'id' => $u->id,
                            'name' => $u->name ?? 'Unknown',
                            'email' => $u->email ?? 'N/A',
                            'image' => $u->image ?? null,
                            'created_at' => $u->created_at?->diffForHumans() ?? 'N/A',
                        ];
                    })->toArray();
            }

            // Recent projects
            $recentProjects = [];
            if (Schema::hasTable('projects')) {
                $recentProjects = Project::with(['creator:id,name'])
                    ->orderByDesc('created_at')
                    ->limit(5)
                    ->get(['id', 'name', 'status', 'creator_id', 'created_at'])
                    ->map(function ($p) {
                        return [
                            'id' => $p->id,
                            'name' => $p->name ?? 'Untitled',
                            'status' => $p->status ?? 'N/A',
                            'creator_name' => $p->creator->name ?? 'N/A',
                            'created_at' => $p->created_at?->diffForHumans() ?? 'N/A',
                        ];
                    })->toArray();
            }

            // Today's reservations count
            $todayReservations = Schema::hasTable('reservations')
                ? Reservation::whereDate('day', today())
                    ->where('canceled', 0)
                    ->count()
                : 0;

            // This week's reservations
            $weekReservations = Schema::hasTable('reservations')
                ? Reservation::whereBetween('day', [
                    now()->startOfWeek(),
                    now()->endOfWeek(),
                ])
                    ->where('canceled', 0)
                    ->count()
                : 0;

            // This month's reservations
            $monthReservations = Schema::hasTable('reservations')
                ? Reservation::whereMonth('day', now()->month)
                    ->whereYear('day', now()->year)
                    ->where('canceled', 0)
                    ->count()
                : 0;

            // Last 7 days reservation trend for dashboard charts
            $reservationTrend = [];
            if (Schema::hasTable('reservations')) {
                for ($i = 6; $i >= 0; $i--) {
                    $date = now()->subDays($i);
                    $reservationTrend[] = [
                        'label' => $date->format('D'),
                        'date' => $date->format('Y-m-d'),
                        'count' => Reservation::whereDate('day', $date)
                            ->where('canceled', 0)
                            ->count(),
                    ];
                }
            }

            // Last 7 days completed tasks for line chart
            $taskCompletionTrend = [];
            if (Schema::hasTable('tasks')) {
                for ($i = 6; $i >= 0; $i--) {
                    $date = now()->subDays($i);
                    $taskCompletionTrend[] = [
                        'label' => $date->format('D'),
                        'date' => $date->format('Y-m-d'),
                        'count' => Task::where('status', 'completed')
                            ->whereDate('completed_at', $date)
                            ->count(),
                    ];
                }
            }

            // Project owner activity feed (only for users who own projects)
            $isProjectOwner = false;
            $projectOwnerActivity = [];
            $userId = Auth::id();

            if ($userId && Schema::hasTable('projects') && Schema::hasTable('tasks')) {
                $ownedProjectIds = Project::where('created_by', $userId)->pluck('id');
                $isProjectOwner = $ownedProjectIds->isNotEmpty();

                if ($isProjectOwner) {
                    $projectOwnerActivity = Task::query()
                        ->whereIn('project_id', $ownedProjectIds)
                        ->with([
                            'project:id,name',
                            'creator:id,name',
                            'assignedTo:id,name',
                        ])
                        ->orderByDesc('updated_at')
                        ->limit(5)
                        ->get()
                        ->map(function (Task $task) {
                            $type = match ($task->status) {
                                'completed' => 'completed',
                                'in_progress' => 'in_progress',
                                'review' => 'review',
                                default => 'created',
                            };

                            $actor = $task->assignedTo?->name
                                ?? $task->creator?->name
                                ?? 'Team member';

                            return [
                                'id' => $task->id.'-'.$type,
                                'type' => $type,
                                'task_id' => $task->id,
                                'task_title' => $task->title ?? 'Untitled task',
                                'project_id' => $task->project_id,
                                'project_name' => $task->project?->name ?? 'Project',
                                'actor_name' => $actor,
                                'status' => $task->status,
                                'time_ago' => $task->updated_at?->diffForHumans() ?? 'N/A',
                                'href' => '/admin/projects/'.$task->project_id,
                            ];
                        })
                        ->values()
                        ->toArray();
                }
            }
        } catch (\Exception $e) {
            // Fallback to empty data if there's an error
            Log::error('Dashboard data error: '.$e->getMessage());
            $stats = [
                'users' => 0,
                'reservations' => 0,
                'cowork_reservations_today' => 0,
                'computers' => 0,
                'equipment' => 0,
                'projects' => 0,
                'trainings' => 0,
                'appointments' => 0,
            ];
            $computerStats = ['total' => 0, 'working' => 0, 'not_working' => 0, 'damaged' => 0, 'assigned' => 0];
            $equipmentStats = ['total' => 0, 'working' => 0, 'not_working' => 0];
            $projectStats = ['total' => 0, 'active' => 0, 'completed' => 0, 'on_hold' => 0];
            $recentReservations = [];
            $pendingAppointments = [];
            $recentUsers = [];
            $recentProjects = [];
            $todayReservations = 0;
            $weekReservations = 0;
            $monthReservations = 0;
            $reservationTrend = [];
            $taskCompletionTrend = [];
            $isProjectOwner = false;
            $projectOwnerActivity = [];
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'computerStats' => $computerStats,
            'equipmentStats' => $equipmentStats,
            'projectStats' => $projectStats,
            'recentReservations' => $recentReservations,
            'pendingAppointments' => $pendingAppointments,
            'recentUsers' => $recentUsers,
            'recentProjects' => $recentProjects,
            'todayReservations' => $todayReservations,
            'weekReservations' => $weekReservations,
            'monthReservations' => $monthReservations,
            'reservationTrend' => $reservationTrend ?? [],
            'taskCompletionTrend' => $taskCompletionTrend ?? [],
            'isProjectOwner' => $isProjectOwner ?? false,
            'projectOwnerActivity' => $projectOwnerActivity ?? [],
        ]);
    }
}
