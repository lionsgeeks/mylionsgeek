<?php

return [
    'api_key' => env('FACEPP_API_KEY'),
    'api_secret' => env('FACEPP_API_SECRET'),
    'api_url' => env('FACEPP_API_URL',
        'https://api-us.faceplusplus.com/facepp/v3/compare'),
    // Raw env value. verify() rejects non-numeric and out-of-range thresholds
    // instead of casting them to 0, which would accept every confidence.
    'threshold' => env('FACE_MATCH_THRESHOLD', 80),

    // Seconds. Compare round-trips to api-us (an Alibaba ALB in ap-southeast-1) from Morocco
    // have been measured at 6–15 s for two ~2 MB uploads; 15 s was turning ordinary compares
    // into 503s. TCP connects are bimodal (~0.3 s or hang), so a short connect timeout with a
    // few retries beats one long wait. Retries apply to the connect phase only.
    'connect_timeout' => (int) env('FACEPP_CONNECT_TIMEOUT', 5),
    'connect_attempts' => (int) env('FACEPP_CONNECT_ATTEMPTS', 3),
    'timeout' => (int) env('FACEPP_TIMEOUT', 40),
];
