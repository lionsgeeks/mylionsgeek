<?php

namespace App\Services\Academy;

use App\Models\User;
use Illuminate\Support\Facades\Storage;

class SendAvatarsService
{
    // specify the max number of ids 
    private $max = 10;

    public function send(int $from, int $to)
    {
        // making sure that the max number that can be requested is $this->max
        // if $to > $from we return emty array
        $to = $to  - $from  <= $this->max ? $to : $from + $this->max;
        $users  = User::whereBetween("id", [$from, $to])->get();
        $data = [];
        foreach ($users as $key => $user) {
            // making sure the photo exist
            $data[$key]["user_central_id"] = $user->id;
            $path = $user->image ? "img/profile/{$user->image}" : null;

            if ($path) {
                Storage::disk("public")->exists($path);
                // sending user_id and his photo
                $data[$key]["base_64_avatar"] = base64_encode(Storage::disk("public")->get("img/profile/" . $user->image));
            } else {
                $data[$key]["base_64_avatar"] = null;
            }
        }
        return ($data);
    }
}
