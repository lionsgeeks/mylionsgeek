<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/two-factor-authentication',
        '/api/two-factor-authentication',
        'api/two-factor-confirm',
        '/api/two-factor-confirm',
        'api/two-factor-verify',
        '/api/two-factor-verify',
        'api/two-factor-recovery-codes',
        '/api/two-factor-recovery-codes',
        'api/two-factor-qr-code',
        '/api/two-factor-qr-code',
        'api/two-factor-*',
        '/api/two-factor-*',
    ];
}
