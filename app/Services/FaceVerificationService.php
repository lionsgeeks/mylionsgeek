<?php

namespace App\Services;

use App\Exceptions\FaceVerificationException;
use App\Models\FaceEnrollment;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Throwable;

class FaceVerificationService
{
    private const STAFF_BYPASS_ROLES = [
        'admin',
        'super_admin',
        'moderateur',
        'coach',
        'studio_responsable',
    ];

    public function shouldBypass(User $user): bool
    {
        $roles = is_array($user->role)
            ? $user->role
            : [$user->role];

        return (bool) array_intersect($roles, self::STAFF_BYPASS_ROLES);
    }

    /**
     * Compare a live check-in photo against the staff enrollment via Face++.
     *
     * The reference is the private enrollment file. Profile photo edits are ignored.
     * Live photo bytes are processed in memory only — never written to disk.
     *
     * @return array{passed: bool, confidence: float, method: string}
     *
     * @throws FaceVerificationException
     */
    public function verify(User $student, UploadedFile $livePhoto): array
    {
        $threshold = $this->matchThreshold();
        if ($threshold === null) {
            throw new FaceVerificationException('Face verification service is currently unavailable.');
        }

        $enrollment = FaceEnrollment::query()->where('user_id', $student->id)->first();
        if ($enrollment === null) {
            $enrollment = $this->lockProfileReference($student);
        }
        $disk = $this->enrollmentDisk($enrollment);
        $referenceBytes = $disk === null ? null : $this->readEnrollmentBytes($enrollment, $disk);
        if (! is_string($referenceBytes) || $referenceBytes === '') {
            throw new FaceVerificationException('No staff enrollment on file for this student.');
        }

        $liveBytes = $livePhoto->get();
        $liveFilename = $livePhoto->getClientOriginalName() ?: 'live.jpg';
        $referenceFilename = 'reference.jpg';

        try {
            $response = Http::connectTimeout((int) config('face_verification.connect_timeout', 5))
                ->timeout((int) config('face_verification.timeout', 40))
                ->retry(
                    max(1, (int) config('face_verification.connect_attempts', 3)),
                    300,
                    fn (\Throwable $e): bool => $e instanceof ConnectionException && $this->isConnectPhaseFailure($e),
                    throw: false, // non-2xx responses are handled below, not thrown
                )
                ->attach('image_file1', $referenceBytes, $referenceFilename)
                ->attach('image_file2', $liveBytes, $liveFilename)
                ->post(config('face_verification.api_url'), [
                    'api_key' => config('face_verification.api_key'),
                    'api_secret' => config('face_verification.api_secret'),
                ]);
        } catch (ConnectionException $e) {
            throw new FaceVerificationException(
                'Face verification service is currently unavailable.',
                0,
                $e,
            );
        }

        if ($response->status() !== 200) {
            $errorMessage = $response->json('error_message');
            throw new FaceVerificationException(
                is_string($errorMessage) && $errorMessage !== ''
                    ? $errorMessage
                    : 'Face verification service is currently unavailable.',
            );
        }

        $confidenceRaw = $response->json('confidence');
        $confidence = is_numeric($confidenceRaw) ? (float) $confidenceRaw : null;

        return [
            'passed' => $confidence !== null && $confidence >= $threshold,
            'confidence' => $confidence ?? 0.0,
            'method' => 'face-match',
        ];
    }

    /**
     * Face++ scores are 0–100. A missing, non-numeric, zero, negative, or
     * above-100 threshold must not be compared, because a cast of 0 accepts
     * every confidence including a missing score.
     */
    private function matchThreshold(): ?float
    {
        $raw = config('face_verification.threshold', 80);

        if (! is_numeric($raw)) {
            return null;
        }

        $value = (float) $raw;

        if ($value <= 0.0 || $value > 100.0) {
            return null;
        }

        return $value;
    }

    /**
     * True when cURL failed before any request bytes were acknowledged (DNS, TCP connect,
     * TLS). Read-phase timeouts after the upload are not retried — that would double the wait.
     */
    private function isConnectPhaseFailure(ConnectionException $e): bool
    {
        $message = $e->getMessage();

        foreach (['Connection timed out', 'Failed to connect', 'Could not resolve host', 'Connection refused', 'SSL connect error'] as $marker) {
            if (str_contains($message, $marker)) {
                return true;
            }
        }

        return false;
    }

    private function lockProfileReference(User $student): ?FaceEnrollment
    {
        $disk = config('face.enrollment_disk', 'face_enrollments');
        $bytes = is_string($disk) && $disk !== '' && $disk !== 'public'
            ? $this->readProfileBasenameBytes($student)
            : null;
        if (! is_string($bytes) || $bytes === '' || ! is_string($disk) || $disk === '' || $disk === 'public') {
            return null;
        }

        $path = $student->id.'/profile-lock.jpg';

        try {
            if (! Storage::disk($disk)->put($path, $bytes)) {
                return null;
            }
        } catch (Throwable) {
            return null;
        }

        try {
            return FaceEnrollment::query()->create([
                'user_id' => $student->id,
                'disk' => $disk,
                'path' => $path,
                'enrolled_by' => null,
                'enrolled_at' => now(),
            ]);
        } catch (Throwable) {
            return FaceEnrollment::query()->where('user_id', $student->id)->first();
        }
    }

    private function readProfileBasenameBytes(User $student): ?string
    {
        $image = str_replace('\\', '/', trim((string) $student->image));
        if ($image === '' || str_contains($image, '..')) {
            return null;
        }

        $basename = basename($image);
        if ($basename === '' || $basename === '.' || $basename === '..') {
            return null;
        }

        try {
            $bytes = Storage::disk('public')->get('img/profile/'.$basename);
        } catch (Throwable) {
            return null;
        }

        return is_string($bytes) && $bytes !== '' ? $bytes : null;
    }

    private function enrollmentDisk(?FaceEnrollment $enrollment): ?string
    {
        $allowed = config('face.enrollment_disk', 'face_enrollments');
        if (! is_string($allowed) || $allowed === '' || $allowed === 'public') {
            return null;
        }

        if ($enrollment === null || $enrollment->disk !== $allowed) {
            return null;
        }

        return $allowed;
    }

    private function readEnrollmentBytes(FaceEnrollment $enrollment, string $disk): ?string
    {
        $path = str_replace('\\', '/', (string) $enrollment->path);
        if ($path === '' || str_starts_with($path, '/') || str_contains($path, '..') || str_contains($path, "\0")) {
            return null;
        }

        try {
            $bytes = Storage::disk($disk)->get($path);
        } catch (Throwable) {
            return null;
        }

        return is_string($bytes) && $bytes !== '' ? $bytes : null;
    }
}
