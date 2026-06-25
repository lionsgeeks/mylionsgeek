<?php

use App\Http\Controllers\CertificateShareController;
use Illuminate\Support\Facades\Route;

Route::get('/certificates/share/{token}', [CertificateShareController::class, 'show'])->name('certificates.share');
