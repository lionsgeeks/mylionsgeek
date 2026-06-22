<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\User;
use Illuminate\Http\Request;


class SendClassController extends Controller
{
    public function GetClassesData(Request $request)
    {

        $classes = [];
        $formations = Formation::get()->all();
        foreach ($formations as $formation) {
            $users = User::where("formation_id", $formation->id)->get()->all();
            $coaches = User::where("id", $formation->user_id)
                ->get()->all();

            foreach ($coaches as $coach) {
                $user = [
                    "central_id" => $coach->id ?? null,
                    "name" => $coach->name ?? null,
                    "email" => $coach->email ?? null,
                    "avatar" => $coach->image ?? null,
                    "promo" => $coach->promo ?? null,
                    "field" => $coach->field ?? null,
                    "roles" => $coach->role ?? null,
                    "status" => $coach->status ?? null,
                    

                ];
                $classes[$formation->name]["coaches_ids"][] = $coach->id ?? null;
                $classes[$formation->name]["coaches"][] = $user;
            }

            foreach ($users as $user) {
                $student = [
                    "central_id" => $user->id ?? null,
                    "name" => $user->name ?? null,
                    "email" => $user->email ?? null,
                    "avatar" => $user->image ?? null,
                    "promo" => $user->promo ?? null,
                    "field" => $user->field ?? null,
                    "roles" => $user->role ?? null,
                    "status" => $user->status ?? null,
                    

                ];

                $classes[$formation->name]["users"][] = $student;
            }
            $classes[$formation->name]["central_id"] = $formation->id;
            $classes[$formation->name]["period"] = [
                "start" => $formation->start_time,
                "end" => $formation->end_time,
            ];
            $classes[$formation->name]["type"] = $formation->category;
            $classes[$formation->name]["promo"] = $formation->promo;
            preg_match('/(\d+)$/', trim($formation->name), $matches);
            // dd($matches);
            $classes[$formation->name]["class"] = $matches[1] ?? null;
        }
        return $classes;
    }
}
