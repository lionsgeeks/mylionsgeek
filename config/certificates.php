<?php

return [

    'templates' => [
        'coding' => 'assets/images/certif/codeCertfifcation.pdf',
        'media' => 'assets/images/certif/mediaCertification.pdf',
        'geeklab_coding' => 'assets/images/certif/geeklabcodingcertification.pdf',
        'geeklab_media' => 'assets/images/certif/geeklabmediacertification.pdf',
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
    |
    | GeekLab: Montserrat, first name then last name on two lines, left-aligned
    | under "Lionsgeek atteste officiellement que :". No date overlay (printed on template).
    */
    'positions' => [
        'coding' => [
            // < 20 letters (trimmed, no spaces): one line, size_more_words, stroke ×0.018. ≥ 20: size_two_words, stroke ×0.005.
            // Optional legacy 'size' is used only as fallback if those keys are missing.
            'name' => ['y_pct' => 50, 'size_two_words' => 75, 'size_more_words' => 75, 'style' => ''],
            'date' => ['y_pct' => 79, 'size' => 10, 'style' => 'B'],
        ],
        'media' => [
            'name' => ['y_pct' => 50, 'size_two_words' => 75, 'size_more_words' => 75, 'style' => ''],
            'date' => ['y_pct' => 79, 'size' => 10, 'style' => 'B'],
        ],
        'geeklab_coding' => [
            'name' => [
                'y_pct' => 36,
                'x_mm' => 28,
                'size' => 42,
                'line_gap_mm' => 2,
                'align' => 'L',
            ],
        ],
        'geeklab_media' => [
            'name' => [
                'y_pct' => 36,
                'x_mm' => 28,
                'size' => 42,
                'line_gap_mm' => 2,
                'align' => 'L',
            ],
        ],
    ],

];
