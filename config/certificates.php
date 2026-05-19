<?php

return [

    'templates' => [
        'coding' => 'assets/images/certif/codeCertfifcation.pdf',
        'media' => 'assets/images/certif/mediaCertification.pdf',
    ],

    /*
    | Text positions (mm) on landscape A4 (297 × 210 mm).
    | Name: large, bold, horizontally centered in the colorful blob area (y ≈ 97 mm).
    | Date: small, centered at the bottom near the Lionsgeek logo (y ≈ 172 mm).
    */
    'positions' => [
        'coding' => [
            'name' => ['x' => 0, 'y' => 97, 'size' => 48, 'style' => 'B', 'center' => true],
            'date' => ['x' => 0, 'y' => 172, 'size' => 12, 'style' => '', 'center' => true],
        ],
        'media' => [
            'name' => ['x' => 0, 'y' => 97, 'size' => 48, 'style' => 'B', 'center' => true],
            'date' => ['x' => 0, 'y' => 172, 'size' => 12, 'style' => '', 'center' => true],
        ],
    ],

];
