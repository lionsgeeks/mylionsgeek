<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class UserProfileStatsService
{
    private const LEADERBOARD_CACHE_KEY = 'leaderboard_data_alltime_all__false';

    /**
     * @return array{posts_count: int, coding_hours: float|null, global_rank: int|null}
     */
    public function getStats(User $user): array
    {
        $leaderboardEntry = $this->findInLeaderboardCache($user->id);
        $totalSeconds = null;

        if ($leaderboardEntry !== null && ($leaderboardEntry['success'] ?? true)) {
            $totalSeconds = (int) ($leaderboardEntry['data']['total_seconds'] ?? 0);
        }

        $codingHours = isset($leaderboardEntry['metrics']['total_hours'])
            ? (float) $leaderboardEntry['metrics']['total_hours']
            : null;

        $globalRank = isset($leaderboardEntry['metrics']['rank'])
            ? (int) $leaderboardEntry['metrics']['rank']
            : null;

        if ($globalRank !== null && $globalRank >= 999) {
            $globalRank = null;
        }

        if ($codingHours === null && filled($user->wakatime_api_key)) {
            $fetchedSeconds = $this->fetchTotalSecondsFromWakaTime($user);
            if ($fetchedSeconds !== null) {
                $totalSeconds = $fetchedSeconds;
                $codingHours = round($fetchedSeconds / 3600, 1);
            }
        }

        if ($globalRank === null && $totalSeconds !== null && $totalSeconds > 0) {
            $globalRank = $this->resolveRankFromLeaderboardCache($totalSeconds);
        }

        return [
            'posts_count' => $this->getPostsCount($user),
            'coding_hours' => $codingHours,
            'global_rank' => $globalRank,
        ];
    }

    public function getPostsCount(User $user): int
    {
        return (int) Post::query()
            ->where('user_id', $user->id)
            ->where(function ($q) {
                $q->whereNull('is_hidden')->orWhere('is_hidden', false);
            })
            ->count();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findInLeaderboardCache(int $userId): ?array
    {
        $entries = $this->getLeaderboardCacheEntries();

        foreach ($entries as $entry) {
            if ((int) ($entry['user']['id'] ?? 0) === $userId) {
                return $entry;
            }
        }

        return null;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getLeaderboardCacheEntries(): array
    {
        $cached = Cache::get(self::LEADERBOARD_CACHE_KEY);

        if ($cached === null) {
            return [];
        }

        if ($cached instanceof \Illuminate\Http\JsonResponse) {
            $payload = $cached->getData(true);
        } elseif (is_array($cached)) {
            $payload = $cached;
        } else {
            return [];
        }

        return is_array($payload['data'] ?? null) ? $payload['data'] : [];
    }

    private function resolveRankFromLeaderboardCache(int $totalSeconds): ?int
    {
        $entries = $this->getLeaderboardCacheEntries();

        if ($entries === []) {
            return null;
        }

        $rank = 1;

        foreach ($entries as $entry) {
            if (($entry['success'] ?? true) === false) {
                continue;
            }

            $entrySeconds = (int) ($entry['data']['total_seconds'] ?? 0);

            if ($entrySeconds > $totalSeconds) {
                $rank++;
            }
        }

        return $rank;
    }

    private function fetchTotalSecondsFromWakaTime(User $user): ?int
    {
        if (! filled($user->wakatime_api_key)) {
            return null;
        }

        try {
            $certPath = storage_path('certs/cacert.pem');
            $request = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => 'Basic ' . base64_encode($user->wakatime_api_key . ':'),
                ]);

            if (is_file($certPath)) {
                $request = $request->withOptions(['verify' => $certPath]);
            }

            $response = $request->get('https://wakatime.com/api/v1/users/current/stats/all_time');

            if (! $response->successful()) {
                return null;
            }

            return (int) ($response->json('data.total_seconds') ?? 0);
        } catch (\Throwable) {
            return null;
        }
    }
}
