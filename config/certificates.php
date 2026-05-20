<?php

return [

    'templates' => [
        'coding' => 'assets/images/certif/codeCertfifcation.pdf',
        'media' => 'assets/images/certif/mediaCertification.pdf',
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
            // 'size_two_words' — 0–2 words, or "X el …" on one line. 'size_more_words' — other 3+ words on two lines.
            // Optional legacy 'size' is used only as fallback if those keys are missing.
            'name' => ['y_pct' => 50, 'size_two_words' => 65, 'size_more_words' => 40, 'style' => ''],
            'date' => ['y_pct' => 79, 'size' => 10, 'style' => 'B'],
        ],
        'media' => [
            'name' => ['y_pct' => 50, 'size_two_words' => 65, 'size_more_words' => 40, 'style' => ''],
            'date' => ['y_pct' => 79, 'size' => 10, 'style' => 'B'],
        ],

    ],

];
