<?php

return [

    'templates' => [
        'coding' => 'assets/images/certif/codeCertfifcation.pdf',
        'media'  => 'assets/images/certif/mediaCertification.pdf',
    ],

    /*
    | Text positions on landscape A4 (297 × 210 mm).
    |
    | y_pct  — vertical position as a percentage of page height (preferred).
    |           47% of 210 mm ≈ 98.7 mm, placing the name between
    |           "fièrement décerné à" and "Pour avoir complété…".
    |
    | name   — Great Vibes 65pt, pure black, Cell-centered across full width.
    | date   — Helvetica 12pt, grey, Cell-centered across full width.
    */
    'positions' => [
        'coding' => [
            'name' => ['y_pct' => 47, 'size' => 65, 'style' => ''],
            'date' => ['y_pct' => 82, 'size' => 12, 'style' => ''],
        ],
        'media' => [
            'name' => ['y_pct' => 47, 'size' => 65, 'style' => ''],
            'date' => ['y_pct' => 82, 'size' => 12, 'style' => ''],
        ],
    ],

];
