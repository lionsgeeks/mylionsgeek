<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Face verification (attendance check-in)
    |--------------------------------------------------------------------------
    |
    | Attendance check-in uses Face++ compare against a private reference
    | (FACEPP_* in config/face_verification.php). A staff enrollment is used
    | when one exists. Otherwise the profile photo is copied into that
    | private disk once, and later profile edits are ignored. Missing Face++
    | keys or a missing readable reference fail-close verification (HTTP 503).
    |
    | FACE_VERIFICATION_REQUIRED=false skips Face++ (local/dev without keys).
    | Keep true in production.
    |
    | FACE_VERIFICATION_MIN_SIMILARITY is only used by optional Rekognition
    | enrollment quality checks, not by Face++ check-in.
    |
    */

    'required' => filter_var(env('FACE_VERIFICATION_REQUIRED', true), FILTER_VALIDATE_BOOLEAN),

    'min_similarity' => env('FACE_VERIFICATION_MIN_SIMILARITY', 90),

    'min_face_confidence' => 90.0,

    'min_brightness' => 20.0,

    'min_sharpness' => 20.0,

    'enrollment_disk' => env('FACE_ENROLLMENT_DISK', 'face_enrollments'),

];
