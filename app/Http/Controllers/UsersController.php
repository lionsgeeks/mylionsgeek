<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class UsersController extends Controller
{
    public function index()
    {
        $allUsers = User::orderBy('created_at', 'desc')->get();
        $allFormation = Formation::orderBy('created_at', 'desc')->get();

        return Inertia::render(
            'admin/users/index',
            [
                'users' => $allUsers,
                'trainings' => $allFormation
            ]
        );
    }

    public function show(User $user)
    {
        $allFormation = Formation::orderBy('created_at', 'desc')->get();
        $roles = User::query()->select('role')->distinct()->pluck('role')->filter()->values();

        return Inertia::render('admin/users/[id]', [
            'user' => $user,
            'trainings' => $allFormation,
            'roles' => $roles,
        ]);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('admin.users')->with('success', 'User deleted successfully');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'max:100'],
            'formation_id' => ['nullable', 'integer', 'exists:formations,id'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('users', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'User updated successfully');
    }
}
