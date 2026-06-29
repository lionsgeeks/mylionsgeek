<?php

namespace App\Http\Controllers;

use App\Services\Academy\SendAvatarsService;
use Illuminate\Http\Request;
use to;

class SendAvatarsController extends Controller
{
    //
    public function __construct(private SendAvatarsService $sendAvatars)
    {
    }
    public function  send (Request $request)
    {
        $to = $request->to ;
        $from = $request->from ;

        if(!$to)
            {
                return response()->json([
                    "error" => '"to" fieal is required',
                ],400);
            }
        if(!$from)
            {
                return response()->json([
                    "error" => '"from" fieal is required',
                ],400);
            }
        
        return $this->sendAvatars->send($from,$to);
    }
}
