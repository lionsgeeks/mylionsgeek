<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index()
    {
        return Inertia::render('students/leaderboard/index');
    }

    public function getData(Request $request)
{
 $range = $request->query('range', 'alltime'); // alltime | week | month

        // Map frontend value to WakaTime endpoint
        $map = [
            'alltime' => 'stats/all_time',
            'week' => 'stats/last_7_days',
            'month' => 'stats/last_30_days',
        ];

        $endpoint = $map[$range] ?? 'stats/all_time';

        $apiKeys = User::whereNotNull('wakatime_api_key')->pluck('wakatime_api_key');
        $results = [];

        foreach ($apiKeys as $key) {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($key . ':'),
            ])->get("https://wakatime.com/api/v1/users/current/{$endpoint}");

            $results[] = $response->successful() ? $response->json() : ['error' => 'Failed to fetch data'];
        }

        return response()->json($results);
    }
    

}
