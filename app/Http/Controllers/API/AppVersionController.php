<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Admin\AppVersionController as AdminAppVersionController;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class AppVersionController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(AdminAppVersionController::mobilePayload());
    }
}
