<?php

namespace App\Services\Academy;

use App\Models\User;

class SendWakaTimeKeyService
{
    public function getWakaTimeKey()
    {
        $data = [];
        $users = User::WhereNotNull("wakatime_api_key")
            ->get()->all();
        if ($users) {
            foreach ($users as $key => $user) {
                $data[$key]["central_user_id"] = $user->id;
                $data[$key]["wakatime_key"] = $user->wakatime_api_key;
            }
        }
        return $data;
    }
}
