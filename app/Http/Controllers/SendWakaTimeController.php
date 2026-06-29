<?php

namespace App\Http\Controllers;

use App\Services\Academy\SendWakaTimeKeyService;
use Illuminate\Http\Request;

class SendWakaTimeController extends Controller
{
    public function __construct(Private SendWakaTimeKeyService $send_waka_time_controller)
    {
    }
    public function send()
    {
        return $this->send_waka_time_controller->getWakaTimeKey();
    }
}
