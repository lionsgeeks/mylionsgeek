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
                    "name" => $coach->name ?? "",
                    "email" => $coach->email ?? "",
                    "avatar" => $coach->avatar ?? "",
                    "promo" => $coach->promo ?? "",
                    "field" => $coach->field ?? "",
                    "roles" => $coach->role ?? [],
                    "status" => $coach->status ?? "",
                    "formation_id" => $coach->formation_id ?? null

                ];

                $classes[$formation->name]["coaches"][] = $user;
            }

            foreach ($users as $user) {
                $student = [
                    "central_id" => $user->id , null,
                    "name" => $user->name ?? "",
                    "email" => $user->email ?? "",
                    "avatar" => $user->image ?? "",
                    "promo" => $user->promo ?? "",
                    "field" => $user->field ?? "",
                    "roles" => $user->role ?? [],
                    "status" => $user->status ?? "",
                    "formation_id" => $user->formation_id ?? null

                ];
                $classes[$formation->name]["users"][] = $student;
            }
        }
        return $classes;
    }
}
