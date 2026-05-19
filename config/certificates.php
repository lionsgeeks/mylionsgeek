<?php

return [

    'templates' => [
        'coding' => 'assets/images/certif/codeCertfifcation.pdf',
        'media' => 'assets/images/certif/mediaCertification.pdf',
    ],

    /*
    | Text positions (mm) on landscape A4 — tune in config if layout shifts.
    | Zone: between "fièrement décerné à" and "Pour avoir complété le programme…"
    */
    'positions' => [
        'coding' => [
            'name' => ['x' => 0, 'y' => 118, 'size' => 22, 'style' => 'B'],
            'date' => ['x' => 32, 'y' => 138, 'size' => 12, 'style' => ''],
        ],
        'media' => [
            'name' => ['x' => 0, 'y' => 118, 'size' => 22, 'style' => 'B'],
            'date' => ['x' => 32, 'y' => 138, 'size' => 12, 'style' => ''],
        ],
    ],

];
