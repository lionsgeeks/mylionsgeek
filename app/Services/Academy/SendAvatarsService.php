<?php

namespace App\Services\Academy;

use Illuminate\Support\Facades\Storage;

class SendAvatarsService
{
    // specify the max number of ids 
    private $max = 10;

    public function send(?string $url)
    {
       
        $path = $url ? "img/profile/{$url}" : null;
        if (Storage::disk("public")->exists($path)) {
            $data = base64_encode(Storage::disk("public")->get("img/profile/" . $url));
        } else {
            $data = null;
        }
        return ($data);
    }
}
