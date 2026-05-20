<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Music search for the story creator's "music sticker" feature.
 *
 *  GET /api/mobile/music/search?q=<query>&limit=20
 *
 * Strategy:
 *   1. Try Spotify Web API (Client Credentials Flow) for nice metadata +
 *      cover art the user recognizes. Token is cached for ~55min in the
 *      Laravel cache, so we don't hit Spotify's /token endpoint on every
 *      request.
 *   2. Spotify removed `preview_url` from many tracks in late 2024. For
 *      every result without a preview_url, we issue a fast iTunes Search
 *      lookup ("title artist") and use Apple's 30-second `previewUrl`.
 *   3. If Spotify credentials aren't configured, or Spotify auth fails,
 *      we silently fall back to iTunes-only search so the feature still
 *      works in development.
 *
 *  Response shape (always JSON):
 *    {
 *      "source": "spotify+itunes" | "itunes",
 *      "items": [
 *        {
 *          "id":          "spotify-track-id" or "itunes-1234567890",
 *          "title":       "Song name",
 *          "artist":      "Artist name",
 *          "album":       "Album",
 *          "cover_url":   "https://...",
 *          "preview_url": "https://...mp3 (or m4a)",
 *          "duration_ms": 240000,
 *          "explicit":    false,
 *          "source":      "spotify" | "itunes"
 *        }, ...
 *      ]
 *    }
 */
class MusicController extends Controller
{
    private const SPOTIFY_TOKEN_CACHE_KEY = 'spotify:client_credentials_token';
    private const HTTP_TIMEOUT = 6;
    private const MAX_LIMIT    = 25;

    public function search(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $query = trim((string) $request->input('q', ''));
        $limit = (int) $request->input('limit', 20);
        if ($limit < 1)  $limit = 1;
        if ($limit > self::MAX_LIMIT) $limit = self::MAX_LIMIT;

        if ($query === '') {
            return response()->json([
                'source' => $this->isSpotifyConfigured() ? 'spotify+itunes' : 'itunes',
                'items'  => [],
            ]);
        }

        // Try Spotify first (if configured); otherwise iTunes-only.
        $token = $this->isSpotifyConfigured() ? $this->getSpotifyToken() : null;

        if ($token) {
            try {
                $items = $this->spotifySearch($token, $query, $limit);
                // Spotify worked — backfill missing preview_urls with iTunes.
                $items = $this->backfillPreviewsFromItunes($items);
                return response()->json([
                    'source' => 'spotify+itunes',
                    'items'  => $items,
                ]);
            } catch (Throwable $e) {
                Log::warning('Spotify search failed, falling back to iTunes: ' . $e->getMessage());
                // Fall through to iTunes-only.
            }
        }

        try {
            $items = $this->itunesSearch($query, $limit);
            return response()->json([
                'source' => 'itunes',
                'items'  => $items,
            ]);
        } catch (Throwable $e) {
            Log::error('Music search failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Music search is unavailable right now.',
                'source'  => 'itunes',
                'items'   => [],
            ], 503);
        }
    }

    // ─── Spotify ────────────────────────────────────────────────────────

    private function isSpotifyConfigured(): bool
    {
        return !empty(config('services.spotify.client_id'))
            && !empty(config('services.spotify.client_secret'));
    }

    /**
     * Fetches (and caches) a Spotify Client Credentials access token.
     * Returns null on failure so callers can degrade gracefully.
     */
    private function getSpotifyToken(): ?string
    {
        $cached = Cache::get(self::SPOTIFY_TOKEN_CACHE_KEY);
        if (is_string($cached) && $cached !== '') {
            return $cached;
        }

        $clientId     = (string) config('services.spotify.client_id');
        $clientSecret = (string) config('services.spotify.client_secret');
        if ($clientId === '' || $clientSecret === '') {
            return null;
        }

        try {
            $response = Http::asForm()
                ->withHeaders([
                    'Authorization' => 'Basic ' . base64_encode($clientId . ':' . $clientSecret),
                ])
                ->timeout(self::HTTP_TIMEOUT)
                ->post('https://accounts.spotify.com/api/token', [
                    'grant_type' => 'client_credentials',
                ]);

            if (!$response->ok()) {
                Log::warning('Spotify token request failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return null;
            }

            $body  = $response->json();
            $token = $body['access_token'] ?? null;
            $ttl   = (int) ($body['expires_in'] ?? 3600);
            if (!$token) return null;

            // Cache for the lifetime - 5min safety margin.
            Cache::put(self::SPOTIFY_TOKEN_CACHE_KEY, $token, max(60, $ttl - 300));
            return $token;
        } catch (Throwable $e) {
            Log::warning('Spotify token error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function spotifySearch(string $token, string $query, int $limit): array
    {
        $market = (string) config('services.spotify.market', 'US');
        $response = Http::withToken($token)
            ->timeout(self::HTTP_TIMEOUT)
            ->get('https://api.spotify.com/v1/search', [
                'q'      => $query,
                'type'   => 'track',
                'limit'  => $limit,
                'market' => $market,
            ]);

        if ($response->status() === 401) {
            // Token expired between cache hit and use — drop and re-throw.
            Cache::forget(self::SPOTIFY_TOKEN_CACHE_KEY);
            throw new \RuntimeException('Spotify token expired');
        }
        if (!$response->ok()) {
            throw new \RuntimeException('Spotify search HTTP ' . $response->status());
        }

        $tracks = $response->json('tracks.items') ?? [];
        $items  = [];
        foreach ($tracks as $t) {
            if (!is_array($t)) continue;
            $images = $t['album']['images'] ?? [];
            // Pick a mid-sized cover (~300px) when available.
            $cover = $images[1]['url'] ?? ($images[0]['url'] ?? null);
            $artists = array_map(fn ($a) => $a['name'] ?? '', $t['artists'] ?? []);
            $items[] = [
                'id'          => 'spotify-' . ($t['id'] ?? ''),
                'title'       => (string) ($t['name'] ?? ''),
                'artist'      => trim(implode(', ', array_filter($artists))),
                'album'       => (string) ($t['album']['name'] ?? ''),
                'cover_url'   => $cover,
                'preview_url' => $t['preview_url'] ?? null,
                'duration_ms' => (int) ($t['duration_ms'] ?? 0),
                'explicit'    => (bool) ($t['explicit'] ?? false),
                'source'      => 'spotify',
            ];
        }
        return $items;
    }

    /**
     * For every item missing preview_url, query iTunes for "title artist"
     * and patch the preview_url field. Best-effort, swallows errors.
     *
     * @param array<int, array<string, mixed>> $items
     * @return array<int, array<string, mixed>>
     */
    private function backfillPreviewsFromItunes(array $items): array
    {
        foreach ($items as $i => $item) {
            if (!empty($item['preview_url'])) continue;
            $title  = (string) ($item['title']  ?? '');
            $artist = (string) ($item['artist'] ?? '');
            if ($title === '' && $artist === '') continue;
            try {
                $preview = $this->itunesPreviewFor($title, $artist);
                if ($preview) {
                    $items[$i]['preview_url'] = $preview;
                    $items[$i]['source']      = 'spotify+itunes';
                }
            } catch (Throwable $e) {
                // Skip — keep item without preview.
            }
        }
        return $items;
    }

    // ─── iTunes ─────────────────────────────────────────────────────────

    /**
     * @return array<int, array<string, mixed>>
     */
    private function itunesSearch(string $query, int $limit): array
    {
        $response = Http::timeout(self::HTTP_TIMEOUT)
            ->get('https://itunes.apple.com/search', [
                'term'   => $query,
                'media'  => 'music',
                'entity' => 'song',
                'limit'  => $limit,
            ]);

        if (!$response->ok()) {
            throw new \RuntimeException('iTunes search HTTP ' . $response->status());
        }

        $results = $response->json('results') ?? [];
        $items   = [];
        foreach ($results as $r) {
            if (!is_array($r)) continue;
            $preview = $r['previewUrl'] ?? null;
            if (!$preview) continue;
            // Bump artwork to 300x300 (the API returns 100x100 by default).
            $cover = $r['artworkUrl100'] ?? null;
            if (is_string($cover)) {
                $cover = str_replace('100x100bb', '300x300bb', $cover);
            }
            $items[] = [
                'id'          => 'itunes-' . ($r['trackId'] ?? bin2hex(random_bytes(4))),
                'title'       => (string) ($r['trackName']  ?? ''),
                'artist'      => (string) ($r['artistName'] ?? ''),
                'album'       => (string) ($r['collectionName'] ?? ''),
                'cover_url'   => $cover,
                'preview_url' => $preview,
                'duration_ms' => (int) ($r['trackTimeMillis'] ?? 0),
                'explicit'    => ($r['trackExplicitness'] ?? '') === 'explicit',
                'source'      => 'itunes',
            ];
        }
        return $items;
    }

    /**
     *  GET /api/mobile/music/lyrics?artist=…&title=…
     *
     * Free lyrics lookup via Lyrics.ovh (no auth, no API key). Cached for
     * 12 hours per (artist, title) so we don't hammer the upstream.
     *
     * Response: { artist, title, lyrics: string|null, source: 'lyrics.ovh' }
     */
    public function lyrics(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $artist = trim((string) $request->input('artist', ''));
        $title  = trim((string) $request->input('title', ''));
        if ($artist === '' && $title === '') {
            return response()->json(['lyrics' => null, 'source' => 'lyrics.ovh']);
        }

        $cacheKey = 'lyrics:' . md5(mb_strtolower($artist . '||' . $title));
        $lyrics = Cache::remember($cacheKey, now()->addHours(12), function () use ($artist, $title) {
            try {
                // Lyrics.ovh expects URL path segments; double-encode reserved chars.
                $a = rawurlencode($artist);
                $t = rawurlencode($title);
                $response = Http::timeout(self::HTTP_TIMEOUT)
                    ->acceptJson()
                    ->get("https://api.lyrics.ovh/v1/{$a}/{$t}");
                if (!$response->ok()) return null;
                $body = $response->json();
                $text = isset($body['lyrics']) && is_string($body['lyrics']) ? trim($body['lyrics']) : null;
                if (!$text) return null;
                // Hard cap so a malicious or oversized response can never
                // blow up the JSON column we store overlays in.
                return mb_substr($text, 0, 6000);
            } catch (Throwable $e) {
                return null;
            }
        });

        return response()->json([
            'artist' => $artist,
            'title'  => $title,
            'lyrics' => $lyrics,
            'source' => 'lyrics.ovh',
        ]);
    }

    /**
     * Quick "best-match" iTunes lookup for a single track. Returns the
     * preview_url or null. Caches the result so we don't repeat the same
     * lookup within a request burst.
     */
    private function itunesPreviewFor(string $title, string $artist): ?string
    {
        $term = trim($title . ' ' . $artist);
        if ($term === '') return null;

        $cacheKey = 'itunes:preview:' . md5(mb_strtolower($term));
        return Cache::remember($cacheKey, now()->addHours(12), function () use ($term) {
            try {
                $response = Http::timeout(self::HTTP_TIMEOUT)
                    ->get('https://itunes.apple.com/search', [
                        'term'   => $term,
                        'media'  => 'music',
                        'entity' => 'song',
                        'limit'  => 1,
                    ]);
                if (!$response->ok()) return null;
                $r = $response->json('results.0');
                return $r['previewUrl'] ?? null;
            } catch (Throwable $e) {
                return null;
            }
        });
    }
}
