<?php

namespace App\Services\Academy;

use App\Models\UserSocialLink;

class SendSocialsService
{
    public function getSocials()
    {
        $socials = UserSocialLink::get()->all();
        $info = [];
        if(!$socials)
            {
                return null;
            }
        
        foreach($socials as $key => $social)
            {
                $info[$key]["central_social_id"] = $social->id;
                $info[$key]["central_user_id"] = $social->user_id;
                $info[$key]["title"] = $social->title;
                $info[$key]["url"] = $social->url;
            }
        return $info;
    }
}