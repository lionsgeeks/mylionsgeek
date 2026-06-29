<?php

namespace App\Http\Controllers;

use App\Services\Academy\SendAvatarsService;
use Illuminate\Http\Request;

class SendAvatarsController extends Controller
{
    //
    public function __construct(private SendAvatarsService $sendAvatars) {}
    public function  send(Request $request)
    {
        $url = $request->url;
        // $from = $request->from ;

        if (!$url) {
            return response()->json([
                "error" => '"url" fieal is required',
            ], 400);
        }
        $avatar = $this->sendAvatars->send($url);
        if (!$avatar) {
            return response()->json([
                "error" => "avatar not found"
            ], 404);
        }
        return $avatar;
    }
}
