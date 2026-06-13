<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Proxies the public LionsGeek site (lionsgeek.ma) events endpoints for the
 * mobile app.
 *
 * The mobile device runs on the local network and may not have direct
 * public-internet access, so it calls this server under /api/events-info/*
 * and this controller relays the request to lionsgeek.ma. The upstream bearer
 * key is read server-side from config('services.lionsgeek') and is never
 * shipped to the device.
 *
 * Mirrored upstream routes:
 *   GET  /api/events
 *   GET  /api/events/{event}
 *   PUT  /api/validate-event-invitation
 *   GET  /api/lionsgate/infosessions
 *   GET  /api/session-data
 *   PUT  /api/validate-invitation
 *   GET  /api/profile-data
 *   POST /api/session-photo
 */
class EventsInfoProxyController extends Controller
{
    /** Seconds before giving up on the upstream request. */
    private const TIMEOUT = 15;

    public function events(): JsonResponse
    {
        return $this->forward('GET', 'events');
    }

    public function event(Request $request, string $event): JsonResponse
    {
        return $this->forward('GET', "events/{$event}");
    }

    public function validateEventInvitation(Request $request): JsonResponse
    {
        return $this->forward('PUT', 'validate-event-invitation', [
            'json' => $request->all(),
        ]);
    }

    public function infoSessions(): JsonResponse
    {
        return $this->forward('GET', 'lionsgate/infosessions');
    }

    public function sessionData(Request $request): JsonResponse
    {
        $query = http_build_query($request->query());

        return $this->forward('GET', 'session-data' . ($query ? "?{$query}" : ''));
    }

    public function validateInvitation(Request $request): JsonResponse
    {
        return $this->forward('PUT', 'validate-invitation', [
            'json' => $request->all(),
        ]);
    }

    public function manualChecking(Request $request): JsonResponse
    {
        return $this->forward('PUT', 'manual-checking', [
            'json' => $request->all(),
        ]);
    }

    public function profileData(Request $request): JsonResponse
    {
        $query = http_build_query($request->query());

        return $this->forward('GET', 'profile-data' . ($query ? "?{$query}" : ''));
    }

    public function sessionPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|file',
            'id'    => 'required',
        ]);

        $baseUrl = rtrim((string) config('services.lionsgeek.url'), '/');
        $apiKey  = (string) config('services.lionsgeek.key');

        if ($baseUrl === '' || $apiKey === '') {
            return response()->json(['error' => 'Events proxy is not configured.'], 500);
        }

        $verify = config('services.lionsgeek.verify', true);
        $file   = $request->file('photo');

        try {
            $client = Http::withToken($apiKey)->acceptJson()->timeout(30);
            if ($verify === false) {
                $client = $client->withoutVerifying();
            }

            $response = $client
                ->attach(
                    'photo',
                    fopen($file->getRealPath(), 'r'),
                    $file->getClientOriginalName()
                )
                ->post("{$baseUrl}/api/session-photo", [
                    'id' => $request->input('id'),
                ]);
        } catch (ConnectionException $e) {
            Log::error('LionsGeek session-photo proxy could not reach upstream.', [
                'message' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Could not reach the LionsGeek server.'], 502);
        } catch (Throwable $e) {
            Log::error('LionsGeek session-photo proxy failed unexpectedly.', [
                'message' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Unexpected error while uploading photo.'], 502);
        }

        return response()->json($response->json(), $response->status());
    }

    /**
     * Proxies a participant check-in photo from lionsgeek.ma.
     */
    public function participantPhoto(string $photo): Response
    {
        $baseUrl = rtrim((string) config('services.lionsgeek.url'), '/');

        if ($baseUrl === '') {
            return response('Events proxy is not configured.', 500);
        }

        $filename = basename(urldecode($photo));
        if ($filename === '' || $filename === '.' || $filename === '..') {
            return response('Invalid image path.', 400);
        }

        $verify   = config('services.lionsgeek.verify', true);
        $imageUrl = "{$baseUrl}/storage/images/participants/" . rawurlencode($filename);

        try {
            $client = Http::timeout(self::TIMEOUT);
            if ($verify === false) {
                $client = $client->withoutVerifying();
            }

            $response = $client->get($imageUrl);
        } catch (ConnectionException $e) {
            Log::error('LionsGeek participant image proxy could not reach upstream.', [
                'filename' => $filename,
                'message'  => $e->getMessage(),
            ]);

            return response('Could not reach the image server.', 502);
        } catch (Throwable $e) {
            Log::error('LionsGeek participant image proxy failed unexpectedly.', [
                'filename' => $filename,
                'message'  => $e->getMessage(),
            ]);

            return response('Unexpected error while fetching image.', 502);
        }

        if (! $response->successful()) {
            return response('Image not found.', $response->status());
        }

        return response($response->body(), 200, [
            'Content-Type'  => $response->header('Content-Type') ?? 'image/jpeg',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * Proxies an event cover image from lionsgeek.ma so LAN devices can load it
     * without direct public-internet access. The {cover} segment is the encoded
     * filename (spaces and special chars allowed).
     */
    public function eventCover(string $cover): Response
    {
        $baseUrl = rtrim((string) config('services.lionsgeek.url'), '/');

        if ($baseUrl === '') {
            return response('Events proxy is not configured.', 500);
        }

        $filename = basename(urldecode($cover));
        if ($filename === '' || $filename === '.' || $filename === '..') {
            return response('Invalid image path.', 400);
        }

        $verify = config('services.lionsgeek.verify', true);
        $imageUrl = "{$baseUrl}/storage/images/events/" . rawurlencode($filename);

        try {
            $client = Http::timeout(self::TIMEOUT);
            if ($verify === false) {
                $client = $client->withoutVerifying();
            }

            $response = $client->get($imageUrl);
        } catch (ConnectionException $e) {
            Log::error('LionsGeek image proxy could not reach upstream.', [
                'filename' => $filename,
                'message'  => $e->getMessage(),
            ]);

            return response('Could not reach the image server.', 502);
        } catch (Throwable $e) {
            Log::error('LionsGeek image proxy failed unexpectedly.', [
                'filename' => $filename,
                'message'  => $e->getMessage(),
            ]);

            return response('Unexpected error while fetching image.', 502);
        }

        if (! $response->successful()) {
            return response('Image not found.', $response->status());
        }

        return response($response->body(), 200, [
            'Content-Type'  => $response->header('Content-Type') ?? 'image/jpeg',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * Relays a single request to lionsgeek.ma and passes the upstream JSON body
     * and HTTP status straight back to the caller.
     *
     * @param  string  $method   HTTP verb (GET, PUT, ...).
     * @param  string  $path     Upstream path relative to /api (no leading slash).
     * @param  array<string, mixed>  $options  Guzzle/Http options (e.g. ['json' => [...]]).
     */
    private function forward(string $method, string $path, array $options = []): JsonResponse
    {
        $baseUrl = rtrim((string) config('services.lionsgeek.url'), '/');
        $apiKey  = (string) config('services.lionsgeek.key');

        if ($baseUrl === '' || $apiKey === '') {
            Log::error('LionsGeek proxy is not configured.', [
                'has_url' => $baseUrl !== '',
                'has_key' => $apiKey !== '',
            ]);

            return response()->json([
                'error' => 'Events proxy is not configured on the server. Set LIONSGEEK_MA_API_URL and LIONSGEEK_MA_API_KEY.',
            ], 500);
        }

        // SSL verification stays on by default. It can be disabled via
        // LIONSGEEK_MA_API_VERIFY=false for local dev environments whose PHP
        // cURL has no CA bundle configured (cURL error 60).
        $verify = config('services.lionsgeek.verify', true);

        try {
            $client = Http::withToken($apiKey)
                ->acceptJson()
                ->timeout(self::TIMEOUT);

            if ($verify === false) {
                $client = $client->withoutVerifying();
            }

            $response = $client->send($method, "{$baseUrl}/api/{$path}", $options);
        } catch (ConnectionException $e) {
            Log::error('LionsGeek proxy could not reach upstream.', [
                'path'    => $path,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Could not reach the LionsGeek events server.',
            ], 502);
        } catch (Throwable $e) {
            Log::error('LionsGeek proxy failed unexpectedly.', [
                'path'    => $path,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Unexpected error while contacting the events server.',
            ], 502);
        }

        return response()->json($response->json(), $response->status());
    }
}
