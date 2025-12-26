<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;


class SearchController extends Controller
{
    public function index(Request $request)
    {
        // Check authentication
        $checkResult = $this->checkRequestedUser();
        if ($checkResult) {
            return $checkResult;
        }


        $query = $request->get('q', '');
        $type = $request->get('type', 'all'); // all, students, hashtags
        $filter = $request->get('filter', ''); // role filter: student, admin, coach

        $results = [];

        // Search students/users
        if ($type === 'all' || $type === 'students') {
            $userQuery = User::where(function ($q) {
                $q->where('account_state', 0)->orWhereNull('account_state');
            });

            // Filter by role if provided
            if ($filter && in_array($filter, ['student', 'admin', 'coach'])) {
                $userQuery->whereJsonContains('role', $filter);
            }

            // Search by name or email
            if ($query) {
                $userQuery->where(function ($q) use ($query) {
                    $q->where('name', 'like', '%' . $query . '%')
                        ->orWhere('email', 'like', '%' . $query . '%')
                        ->orWhere('promo', 'like', '%' . $query . '%')
                        ->orWhere('field', 'like', '%' . $query . '%');
                });
            }

            $users = $userQuery->limit(50)->get()->map(function ($u) {
                // Handle roles
                $roles = [];
                if (isset($u->role)) {
                    $roles = is_array($u->role) ? $u->role : (is_string($u->role) ? json_decode($u->role, true) ?? [$u->role] : [$u->role]);
                }

                return [
                    'id' => $u->id,
                    'type' => 'user',
                    'name' => $u->name,
                    'email' => $u->email,
                    'avatar' => $u->image ? url('storage/' . $u->image) : null,
                    'image' => $u->image ?? null,
                    'promo' => $u->promo,
                    'field' => $u->field,
                    'roles' => $roles,
                    'status' => $u->status,
                ];
            });

            $results = array_merge($results, $users->toArray());
        }

        // Search hashtags (placeholder - can be expanded later)
        if ($type === 'all' || $type === 'hashtags') {
            // For now, return empty hashtag results
        }

        return response()->json([
            'results' => $results,
            'count' => count($results),
            'query' => $query,
            'type' => $type,
            'filter' => $filter,
        ]);
    }
}
