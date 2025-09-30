<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class LeaderboardController extends Controller
{
    public function index()
    {
        return Inertia::render('students/leaderboard/index');
    }

    /**
     * Sanitize and validate range parameter
     */
    private function sanitizeRange($range)
    {
        $allowedRanges = ['alltime', 'week', 'month', 'this_week'];
        return in_array($range, $allowedRanges) ? $range : 'this_week';
    }

    /**
     * Sanitize and validate promo parameter (supports array or single value)
     */
    private function sanitizePromo($promo)
    {
        if ($promo === 'all') {
            return 'all';
        }

        // Handle array input
        if (is_array($promo)) {
            return array_filter($promo, function ($p) {
                return is_string($p) && !empty(trim($p));
            });
        }

        // Handle single value
        if (is_string($promo) && !empty(trim($promo))) {
            return trim($promo);
        }

        return 'all';
    }

    /**
     * Sanitize search input
     */
    private function sanitizeSearch($search)
    {
        if (!is_string($search)) {
            return '';
        }

        // Remove potentially dangerous characters and limit length
        $search = trim($search);
        $search = preg_replace('/[<>"\']/', '', $search);

        return strlen($search) > 100 ? substr($search, 0, 100) : $search;
    }

    /**
     * Generate cache key based on all parameters
     */
    private function generateCacheKey($range, $promo, $search, $includeInsights)
    {
        if (is_array($promo)) {
            sort($promo);
            $promoKey = implode(',', $promo);
        } else {
            $promoKey = $promo;
        }
        return "leaderboard_data_{$range}_{$promoKey}_{$search}_{$includeInsights}";
    }

    public function getData(Request $request)
    {
        // Sanitize and validate inputs
        // return response()->json("j");
        $range = $this->sanitizeRange($request->query('range', 'this_week'));
        $promo = $this->sanitizePromo($request->query('promo', 'all'));
        $includeInsights = filter_var($request->query('insights', false), FILTER_VALIDATE_BOOLEAN);

        // Create cache key based on range, promo, and insights (search will be handled client-side)
        $cacheKey = $this->generateCacheKey($range, $promo, '', $includeInsights);

        // Return cached data if available (15 minutes cache)
        return Cache::remember($cacheKey, 900, function () use ($range, $promo, $includeInsights) {
            return $this->fetchLeaderboardData($range, $promo, $includeInsights);
        });
    }
    private function fetchLeaderboardData($range, $promo, $includeInsights)
    {
        // Map frontend value to WakaTime endpoint
        $map = [
            'alltime' => 'stats/all_time',
            'week'    => 'stats/last_7_days',
            'month'   => 'stats/last_30_days',
        ];

        // Special case for "this_week"
        $isThisWeek = $range === 'this_week';

        if (!$isThisWeek) {
            $endpoint = $map[$range] ?? 'stats/all_time';
        }

        // Get users with Wakatime API keys
        $query = User::whereNotNull('wakatime_api_key');

        if ($promo !== 'all') {
            if (is_array($promo)) {
                $query->whereIn('promo', $promo);
            } else {
                $query->where('promo', $promo);
            }
        }

        $users = $query->get();
        $results = [];
        $successCount = 0;
        $errorCount = 0;
        $failedUsers = [];

        $existingData = $this->getExistingCachedData($range, $promo);

        foreach ($users as $user) {
            $userData = null;
            $fetchSuccess = false;
            $errorMessage = '';

            try {
                if ($isThisWeek) {
                    // Define the date range dynamically
                    $startDate = now()->startOfWeek()->toDateString(); // e.g. 2025-09-21
                    $endDate   = now()->endOfWeek()->toDateString();   // e.g. 2025-09-28

                    $response = Http::timeout(15)->withHeaders([
                        'Authorization' => 'Basic ' . base64_encode($user->wakatime_api_key . ':'),
                    ])->get('https://wakatime.com/api/v1/users/current/summaries', [
                        'start' => $startDate,
                        'end'   => $endDate,
                    ]);
                } else {
                    // Default endpoints
                    $response = Http::timeout(15)->withHeaders([
                        'Authorization' => 'Basic ' . base64_encode($user->wakatime_api_key . ':'),
                    ])->get("https://wakatime.com/api/v1/users/current/{$endpoint}");
                }

                if ($response->successful()) {
                    $data = $response->json();

                    if ($isThisWeek) {
                        // Summaries API returns an array of days, so sum them up
                        $totalSeconds = collect($data['data'] ?? [])
                            ->sum(fn($day) => $day['grand_total']['total_seconds'] ?? 0);

                        // Collect comprehensive data from all days
                        $languages = [];
                        $projects = [];
                        $editors = [];
                        $machines = [];
                        $dailyBreakdown = [];

                        foreach ($data['data'] ?? [] as $day) {
                            $dayDate = $day['range']['date'] ?? null;
                            $daySeconds = $day['grand_total']['total_seconds'] ?? 0;
                            
                            if ($dayDate && $daySeconds > 0) {
                                $dailyBreakdown[] = [
                                    'date' => $dayDate,
                                    'total_seconds' => $daySeconds,
                                    'text' => $day['grand_total']['text'] ?? '0 secs'
                                ];
                            }

                            // Aggregate languages
                            foreach ($day['languages'] ?? [] as $lang) {
                                $langName = $lang['name'] ?? 'Unknown';
                                if (!isset($languages[$langName])) {
                                    $languages[$langName] = [
                                        'name' => $langName,
                                        'total_seconds' => 0,
                                        'percent' => 0
                                    ];
                                }
                                $languages[$langName]['total_seconds'] += $lang['total_seconds'] ?? 0;
                            }

                            // Aggregate projects
                            foreach ($day['projects'] ?? [] as $project) {
                                $projectName = $project['name'] ?? 'Unknown';
                                if (!isset($projects[$projectName])) {
                                    $projects[$projectName] = [
                                        'name' => $projectName,
                                        'total_seconds' => 0,
                                        'percent' => 0
                                    ];
                                }
                                $projects[$projectName]['total_seconds'] += $project['total_seconds'] ?? 0;
                            }

                            // Aggregate editors
                            foreach ($day['editors'] ?? [] as $editor) {
                                $editorName = $editor['name'] ?? 'Unknown';
                                if (!isset($editors[$editorName])) {
                                    $editors[$editorName] = [
                                        'name' => $editorName,
                                        'total_seconds' => 0,
                                        'percent' => 0
                                    ];
                                }
                                $editors[$editorName]['total_seconds'] += $editor['total_seconds'] ?? 0;
                            }

                            // Aggregate machines
                            foreach ($day['machines'] ?? [] as $machine) {
                                $machineName = $machine['name'] ?? 'Unknown';
                                if (!isset($machines[$machineName])) {
                                    $machines[$machineName] = [
                                        'name' => $machineName,
                                        'total_seconds' => 0,
                                        'percent' => 0
                                    ];
                                }
                                $machines[$machineName]['total_seconds'] += $machine['total_seconds'] ?? 0;
                            }
                        }

                        // Calculate percentages and sort
                        $languages = $this->calculatePercentagesAndSort($languages, $totalSeconds);
                        $projects = $this->calculatePercentagesAndSort($projects, $totalSeconds);
                        $editors = $this->calculatePercentagesAndSort($editors, $totalSeconds);
                        $machines = $this->calculatePercentagesAndSort($machines, $totalSeconds);

                        $data = [
                            'data' => [
                                'total_seconds' => $totalSeconds,
                                'daily_average' => count($data['data'] ?? []) > 0
                                    ? round($totalSeconds / count($data['data']), 0)
                                    : 0,
                                'languages' => array_values($languages),
                                'projects' => array_values($projects),
                                'editors' => array_values($editors),
                                'machines' => array_values($machines),
                                'daily_breakdown' => $dailyBreakdown,
                            ],
                        ];
                    }

                    // Attach user info
                    $data['user'] = [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'image' => $user->image ?? null,
                        'promo' => $user->promo ?? null,
                        'created_at' => $user->created_at,
                    ];

                    // Metrics
                    $data['metrics'] = $this->calculateMetrics($data, $range);
                    $data['success'] = true;

                    if ($includeInsights) {
                        $data['insights'] = $this->fetchUserInsights($user, $range);
                    }

                    $userData = $data;
                    $fetchSuccess = true;
                    $successCount++;
                } else {
                    $errorMessage = 'Failed to fetch WakaTime data';
                }
            } catch (\Exception $e) {
                $errorMessage = 'API request failed: ' . $e->getMessage();
            }

            if (!$fetchSuccess) {
                $existingUserData = $this->findUserInExistingData($existingData, $user->id);

                if ($existingUserData && $existingUserData['success']) {
                    $userData = $existingUserData;
                    $userData['cached'] = true;
                    $userData['last_fetch_error'] = $errorMessage;
                } else {
                    $userData = [
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
                        'error' => $errorMessage,
                        'success' => false,
                        'metrics' => [
                            'total_seconds' => 0,
                            'daily_average' => 0,
                            'win_rate' => 0,
                            'total_hours' => 0,
                            'languages_count' => 0,
                            'top_language' => 'Unknown',
                            'rank' => 999,
                        ],
                    ];
                }
                $errorCount++;
                $failedUsers[] = [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'error' => $errorMessage,
                    'timestamp' => now()->toISOString(),
                ];
            }

            if ($userData) {
                $results[] = $userData;
            }
        }

        // Sort by total_seconds
        usort(
            $results,
            fn($a, $b) => ($b['data']['total_seconds'] ?? 0) - ($a['data']['total_seconds'] ?? 0)
        );

        foreach ($results as $index => &$result) {
            $result['metrics']['rank'] = $index + 1;
        }

        $totalHours = array_sum(array_column($results, 'metrics.total_hours'));
        $averageHours = count($results) > 0 ? round($totalHours / count($results), 1) : 0;

        return response()->json([
            'data' => $results,
            'filters' => [
                'range' => $range,
                'promo' => $promo,
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
        return match ($range) {
            'daily' => 1,
            'week' => 7,
            'month' => 30,
            'alltime' => 365,
            default => 7,
        };
    }

    /**
     * Previous week podium (Monday to Sunday of last completed week)
     * Cached for 15 minutes.
     */
    public function getPreviousWeekPodium()
    {
        // Determine last completed week: previous Monday -> previous Sunday
        $start = Carbon::now()->startOfWeek()->subWeek();
        $end = (clone $start)->endOfWeek();

        $cacheKey = sprintf('previous_week_podium_%s_%s', $start->toDateString(), $end->toDateString());

        return Cache::remember($cacheKey, 900, function () use ($start, $end) {
            $users = User::whereNotNull('wakatime_api_key')->get();
            $weeklyData = [];

            foreach ($users as $user) {
                try {
                    $response = Http::timeout(15)->withHeaders([
                        'Authorization' => 'Basic ' . base64_encode($user->wakatime_api_key . ':'),
                    ])->get('https://wakatime.com/api/v1/users/current/summaries', [
                        'start' => $start->toDateString(),
                        'end' => $end->toDateString(),
                    ]);

                    if ($response->successful()) {
                        $json = $response->json();
                        $totalSeconds = collect($json['data'] ?? [])
                            ->sum(fn($day) => $day['grand_total']['total_seconds'] ?? 0);

                        $weeklyData[] = [
                            'user' => [
                                'id' => $user->id,
                                'name' => $user->name,
                                'email' => $user->email,
                                'image' => $user->image ?? null,
                                'promo' => $user->promo ?? null,
                            ],
                            'total_seconds' => (int)$totalSeconds,
                            'total_hours' => round($totalSeconds / 3600, 1),
                        ];
                    }
                } catch (\Exception $e) {
                    // Skip on error; continue building podium from others
                    continue;
                }
            }

            // Sort by total seconds desc
            usort($weeklyData, function ($a, $b) {
                return ($b['total_seconds'] ?? 0) <=> ($a['total_seconds'] ?? 0);
            });

            // Assign ranks
            foreach ($weeklyData as $index => &$item) {
                $item['rank'] = $index + 1;
            }

            return response()->json([
                // Full ordered results for the modal (scrollable list)
                'results' => $weeklyData,
                // Convenience top3 for any existing consumers
                'winners' => array_slice($weeklyData, 0, 3),
                'period' => [
                    'start' => $start->toDateString(),
                    'end' => $end->toDateString(),
                ],
                'last_updated' => now()->toISOString(),
            ]);
        });
    }

    public function getWeeklyWinners()
    {
        // Cache weekly winners for 15 minutes
        return Cache::remember('weekly_winners', 900, function () {
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
            usort($weeklyData, function ($a, $b) {
                return $b['total_seconds'] - $a['total_seconds'];
            });

            return response()->json([
                'winners' => array_slice($weeklyData, 0, 3),
                'week' => [
                    'start' => $startOfWeek->toDateString(),
                    'end' => $endOfWeek->toDateString(),
                ]
            ]);
        });
    }

    private function fetchUserInsights($user, $range)
    {
        $insights = [];

        try {
            // Map range to WakaTime range format
            $wakatimeRange = match ($range) {
                // 'this_week' => 'last_7_days',
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

    /**
     * Get existing cached data to preserve valid data for failed fetches
     */
    private function getExistingCachedData($range, $promo)
    {
        $cacheKey = $this->generateCacheKey($range, $promo, '', false);
        $cachedData = Cache::get($cacheKey);

        if ($cachedData && isset($cachedData['data'])) {
            return $cachedData['data'];
        }

        return [];
    }

    /**
     * Find user data in existing cached data
     */
    private function findUserInExistingData($existingData, $userId)
    {
        foreach ($existingData as $userData) {
            if (isset($userData['user']['id']) && $userData['user']['id'] == $userId) {
                return $userData;
            }
        }

        return null;
    }

    /**
     * Calculate percentages and sort data by total_seconds
     */
    private function calculatePercentagesAndSort($data, $totalSeconds)
    {
        if ($totalSeconds <= 0) {
            return [];
        }

        // Calculate percentages
        foreach ($data as &$item) {
            $item['percent'] = round(($item['total_seconds'] / $totalSeconds) * 100, 1);
        }

        // Sort by total_seconds descending
        uasort($data, function ($a, $b) {
            return $b['total_seconds'] - $a['total_seconds'];
        });

        return $data;
    }
}
