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
            'app_store_url' => (string) AppSetting::get(AdminAppVersionController::APP_STORE_URL_KEY, ''),
            'play_store_url' => (string) AppSetting::get(AdminAppVersionController::PLAY_STORE_URL_KEY, ''),
        ]);
    }
}
