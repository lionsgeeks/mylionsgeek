<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Carbon\Carbon;

class LeaderboardController extends Controller
{
    public function index()
    {
        return Inertia::render('students/leaderboard/index');
    }

    public function getData(Request $request)
    {
        $range = $request->query('range', 'alltime'); // alltime | week | month | daily
        $promo = $request->query('promo', 'all');
        $search = $request->query('search', '');
        $includeInsights = $request->query('insights', false);

        // Map frontend value to WakaTime endpoint
        $map = [
            'alltime' => 'stats/all_time',
            'week' => 'stats/last_7_days',
            'month' => 'stats/last_30_days',
            'daily' => 'stats/last_7_days', // We'll filter daily from weekly data
        ];

        $endpoint = $map[$range] ?? 'stats/all_time';

        // Get users with Wakatime API keys
        $query = User::whereNotNull('wakatime_api_key');
        
        if ($promo !== 'all') {
            $query->where('promo', $promo);
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->get();
        $results = [];
        $successCount = 0;
        $errorCount = 0;

        foreach ($users as $user) {
            try {
                $response = Http::timeout(15)->withHeaders([
                    'Authorization' => 'Basic ' . base64_encode($user->wakatime_api_key . ':'),
                ])->get("https://wakatime.com/api/v1/users/current/{$endpoint}");

                if ($response->successful()) {
                    $data = $response->json();
                    
                    // Add user information to the response
                    $data['user'] = [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'image' => $user->image ?? null,
                        'promo' => $user->promo ?? null,
                        'created_at' => $user->created_at,
                    ];

                    // Calculate additional metrics
                    $data['metrics'] = $this->calculateMetrics($data, $range);
                    $data['success'] = true;
                    
                    // Fetch additional insights if requested
                    if ($includeInsights) {
                        $data['insights'] = $this->fetchUserInsights($user, $range);
                    }
                    
                    $results[] = $data;
                    $successCount++;
                } else {
                    $results[] = [
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'image' => $user->image ?? null,
                            'promo' => $user->promo ?? null,
                            'created_at' => $user->created_at,
                        ],
                        'data' => [
                            'total_seconds' => 0,
                            'daily_average' => 0,
                            'languages' => [],
                        ],
                        'error' => 'Failed to fetch WakaTime data',
                        'success' => false,
                        'metrics' => [
                            'total_seconds' => 0,
                            'daily_average' => 0,
                            'win_rate' => 0,
                            'total_hours' => 0,
                            'languages_count' => 0,
                            'top_language' => 'Unknown',
                            'rank' => 999,
                        ]
                    ];
                    $errorCount++;
                }
            } catch (\Exception $e) {
                $results[] = [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar ?? null,
                        'promo' => $user->promo ?? null,
                        'created_at' => $user->created_at,
                    ],
                    'data' => [
                        'total_seconds' => 0,
                        'daily_average' => 0,
                        'languages' => [],
                    ],
                    'error' => 'API request failed: ' . $e->getMessage(),
                    'success' => false,
                    'metrics' => [
                        'total_seconds' => 0,
                        'daily_average' => 0,
                        'win_rate' => 0,
                        'total_hours' => 0,
                        'languages_count' => 0,
                        'top_language' => 'Unknown',
                        'rank' => 999,
                    ]
                ];
                $errorCount++;
            }
        }

        // Sort by total seconds and add ranking
        usort($results, function($a, $b) {
            $aSeconds = $a['data']['total_seconds'] ?? 0;
            $bSeconds = $b['data']['total_seconds'] ?? 0;
            return $bSeconds - $aSeconds;
        });

        // Add ranking
        foreach ($results as $index => &$result) {
            $result['metrics']['rank'] = $index + 1;
        }

        // Calculate overall stats
        $totalHours = array_sum(array_column($results, 'metrics.total_hours'));
        $averageHours = count($results) > 0 ? round($totalHours / count($results), 1) : 0;

        return response()->json([
            'data' => $results,
            'filters' => [
                'range' => $range,
                'promo' => $promo,
                'search' => $search,
            ],
            'stats' => [
                'total_users' => count($results),
                'successful_requests' => $successCount,
                'failed_requests' => $errorCount,
                'total_hours' => round($totalHours, 1),
                'average_hours' => $averageHours,
            ],
            'total' => count($results),
            'last_updated' => now()->toISOString(),
        ]);
    }

    private function calculateMetrics($data, $range)
    {
        $totalSeconds = $data['data']['total_seconds'] ?? 0;
        $dailyAverage = $data['data']['daily_average'] ?? 0;
        
        // Calculate win rate based on consistency
        $days = $this->getDaysForRange($range);
        $winRate = $days > 0 ? min(100, ($dailyAverage / 3600) * 10) : 0; // Simplified win rate calculation
        
        return [
            'total_seconds' => $totalSeconds,
            'daily_average' => $dailyAverage,
            'win_rate' => round($winRate, 1),
            'total_hours' => round($totalSeconds / 3600, 1),
            'languages_count' => count($data['data']['languages'] ?? []),
            'top_language' => $data['data']['languages'][0]['name'] ?? 'Unknown',
        ];
    }

    private function getDaysForRange($range)
    {
        return match($range) {
            'daily' => 1,
            'week' => 7,
            'month' => 30,
            'alltime' => 365,
            default => 7,
        };
    }

    public function getWeeklyWinners()
    {
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        
        $users = User::whereNotNull('wakatime_api_key')->get();
        $weeklyData = [];

        foreach ($users as $user) {
            try {
                $response = Http::timeout(10)->withHeaders([
                    'Authorization' => 'Basic ' . base64_encode($user->wakatime_api_key . ':'),
                ])->get("https://wakatime.com/api/v1/users/current/stats/last_7_days");

                if ($response->successful()) {
                    $data = $response->json();
                    $weeklyData[] = [
                        'user' => $user,
                        'data' => $data,
                        'total_seconds' => $data['data']['total_seconds'] ?? 0,
                    ];
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        // Sort by total seconds and get top 3
        usort($weeklyData, function($a, $b) {
            return $b['total_seconds'] - $a['total_seconds'];
        });

        return response()->json([
            'winners' => array_slice($weeklyData, 0, 3),
            'week' => [
                'start' => $startOfWeek->toDateString(),
                'end' => $endOfWeek->toDateString(),
            ]
        ]);
    }

    private function fetchUserInsights($user, $range)
    {
        $insights = [];
        
        try {
            // Map range to WakaTime range format
            $wakatimeRange = match($range) {
                'daily' => 'last_7_days',
                'week' => 'last_7_days',
                'month' => 'last_30_days',
                'alltime' => 'all_time',
                default => 'last_7_days',
            };

            // Fetch multiple insights in parallel
            $responses = Http::pool(function ($pool) use ($user, $wakatimeRange) {
                return [
                    'best_day' => $pool->timeout(10)->withHeaders([
                        'Authorization' => 'Basic ' . base64_encode($user->wakatime_api_key . ':'),
                    ])->get("https://wakatime.com/api/v1/users/current/insights/best_day?range={$wakatimeRange}"),
                    
                    'daily_average' => $pool->timeout(10)->withHeaders([
                        'Authorization' => 'Basic ' . base64_encode($user->wakatime_api_key . ':'),
                    ])->get("https://wakatime.com/api/v1/users/current/insights/daily_average?range={$wakatimeRange}"),
                    
                    'languages' => $pool->timeout(10)->withHeaders([
                        'Authorization' => 'Basic ' . base64_encode($user->wakatime_api_key . ':'),
                    ])->get("https://wakatime.com/api/v1/users/current/insights/languages?range={$wakatimeRange}"),
                    
                    'projects' => $pool->timeout(10)->withHeaders([
                        'Authorization' => 'Basic ' . base64_encode($user->wakatime_api_key . ':'),
                    ])->get("https://wakatime.com/api/v1/users/current/insights/projects?range={$wakatimeRange}"),
                    
                    'editors' => $pool->timeout(10)->withHeaders([
                        'Authorization' => 'Basic ' . base64_encode($user->wakatime_api_key . ':'),
                    ])->get("https://wakatime.com/api/v1/users/current/insights/editors?range={$wakatimeRange}"),
                    
                    'machines' => $pool->timeout(10)->withHeaders([
                        'Authorization' => 'Basic ' . base64_encode($user->wakatime_api_key . ':'),
                    ])->get("https://wakatime.com/api/v1/users/current/insights/machines?range={$wakatimeRange}"),
                ];
            });

            // Process responses
            foreach ($responses as $key => $response) {
                if ($response->successful()) {
                    $insights[$key] = $response->json();
                } else {
                    $insights[$key] = null;
                }
            }

        } catch (\Exception $e) {
            // Return empty insights on error
            $insights = [
                'best_day' => null,
                'daily_average' => null,
                'languages' => null,
                'projects' => null,
                'editors' => null,
                'machines' => null,
            ];
        }

        return $insights;
    }
}
