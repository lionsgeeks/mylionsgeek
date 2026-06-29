<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Admin\AppVersionController as AdminAppVersionController;
use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\JsonResponse;

class AppVersionController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'version' => (string) AppSetting::get(AdminAppVersionController::VERSION_KEY, ''),
            'update_url' => (string) AppSetting::get(AdminAppVersionController::UPDATE_URL_KEY, ''),
        ]);
    }
}
