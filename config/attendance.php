<?php

return [
    'allowed_ips' => array_values(array_filter(
        array_map('trim', explode(',', (string) env('SCHOOL_ALLOWED_IPS', ''))),
        fn (string $ip) => $ip !== ''
    )),
];
