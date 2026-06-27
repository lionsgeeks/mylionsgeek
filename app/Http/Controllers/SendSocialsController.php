<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\Academy\SendSocialsService;

class SendSocialsController extends Controller
{
    public function __construct(Private SendSocialsService $send_socials_service)
    {
    }
    public function send()
    {
        return $this->send_socials_service->getSocials();
    }
}