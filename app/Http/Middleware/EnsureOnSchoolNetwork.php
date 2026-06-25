<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnSchoolNetwork
{
    private const STAFF_BYPASS_ROLES = [
        'admin',
        'super_admin',
        'moderateur',
        'coach',
        'studio_responsable',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->isStaff($request->user())) {
            return $next($request);
        }

        $allowedIps = config('attendance.allowed_ips', []);

        if ($allowedIps === []) {
            return response()->json([
                'message' => 'Attendance network is not configured.',
            ], 503);
        }

        if (! $this->ipIsAllowed($request->ip(), $allowedIps)) {
            return response()->json([
                'message' => 'You must be connected to the school WiFi to check in.',
            ], 403);
        }

        return $next($request);
    }

    /**
     * @param  list<string>  $allowedIps
     */
    private function ipIsAllowed(string $clientIp, array $allowedIps): bool
    {
        $clientNormalized = $this->normalizeIp($clientIp);
        $clientPacked = @inet_pton($clientNormalized);

        foreach ($allowedIps as $allowedIp) {
            $allowedNormalized = $this->normalizeIp((string) $allowedIp);
            $allowedPacked = @inet_pton($allowedNormalized);

            if ($clientPacked !== false && $allowedPacked !== false) {
                if ($clientPacked === $allowedPacked) {
                    return true;
                }

                continue;
            }

            if ($clientNormalized === $allowedNormalized) {
                return true;
            }
        }

        return false;
    }

    private function normalizeIp(string $ip): string
    {
        $ip = trim($ip);

        if (stripos($ip, '::ffff:') === 0) {
            $maybeIpv4 = substr($ip, 7);
            if (filter_var($maybeIpv4, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                return $maybeIpv4;
            }
        }

        $packed = @inet_pton($ip);
        if ($packed === false) {
            return $ip;
        }

        if (strlen($packed) === 16 && substr($packed, 0, 12) === "\0\0\0\0\0\0\0\0\0\0\xff\xff") {
            $ipv4 = inet_ntop(substr($packed, 12));

            return $ipv4 !== false ? $ipv4 : $ip;
        }

        $normalized = inet_ntop($packed);

        return $normalized !== false ? $normalized : $ip;
    }

    private function isStaff(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        $roles = $user->role ?? [];
        if (! is_array($roles)) {
            $roles = $roles ? [(string) $roles] : [];
        }
        $lower = array_map('strtolower', array_map('strval', $roles));

        return (bool) array_intersect($lower, self::STAFF_BYPASS_ROLES);
    }
}
