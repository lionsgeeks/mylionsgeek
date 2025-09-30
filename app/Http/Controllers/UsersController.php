<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Mail\CompleteUserProfile;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

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
    //! edit sunction
    public function show(User $user)
    {
        if (Schema::hasTable('accesses')) {
            $user->load(['access']);
        }
        $allFormation = Formation::orderBy('created_at', 'desc')->get();

        // Placeholder related datasets for UI sections; replace with real relations when available
        $projects = [];
        $posts = [];
        $certificates = [];
        $cv = null;
        $notes = [];

        return Inertia::render('admin/users/[id]', [
            'user' => $user,
            'trainings' => $allFormation,
            'projects' => $projects,
            'posts' => $posts,
            'certificates' => $certificates,
            'cv' => $cv,
            'notes' => $notes,
        ]);
    }
    public function update(Request $request, User $user)
    {

        // dd($request->all());
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'role' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:100',
            'formation_id' => 'nullable|integer|exists:formations,id',
            'phone' => 'nullable|string|max:15',
            'cin' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('users', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'User updated successfully');
    }
    public function updateAccountStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'account_state' => 'required|integer|in:0,1'
        ]);

        $user->update([
            'account_state' => $validated['account_state'],
        ]);
        // dd($user->account_state , $request->account_state);

        return redirect()->back()->with('success', 'User account status updated successfully');
    }

    //! store function
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'nullable|string|confirmed', // expects password_confirmation
            'phone' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg', // Or 'nullable|string' if not a file
            'status' => 'nullable|string', // adjust allowed values as needed
            'cin' => 'nullable|string', // National ID, if applicable
            'formation_id' => 'required|exists:formations,id', // Assumes foreign key to formations table
            'access_studio' => 'required|integer|in:0,1', // Assumes foreign key to formations table
            'access_cowork' => 'required|integer|in:0,1', // Assumes foreign key to formations table
            'role' => 'required|string', // Assumes foreign key to formations table
            'entreprise' => 'nullable|string', // Assumes foreign key to formations table
        ]);
        // dd($request->all());
        $existing = User::query()->where('email', $validated['email'])->first();
        if ($existing) {
            return Inertia::render('admin/users/partials/Header', [
                'message' => 'this email already exist'
            ]);
        }
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('users', 'public');
            $validated['image'] = '/storage/' . $path;
        }
        $plainPassword = Str::random(12);
        User::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($plainPassword),
            'phone' => $validated['phone'] ?? null,  // Use null if 'phone' is not present
            'image' => $validated['image'] ?? null,  // Handle image field similarly if not uploaded
            'status' => $validated['status'] ?? null,
            'cin' => $validated['cin'] ?? null,
            'formation_id' => $validated['formation_id'],
            'account_state' => $validated['account_state'] ?? 'active', // Add a default value if needed
            'access_studio' => $validated['access_studio'],
            'access_cowork' => $validated['access_cowork'],
            'role' => $validated['role'],
            'entreprise' => $validated['entreprise'] ?? null,
            'remember_token' => null,
            'email_verified_at' => null,
        ]);
        // Mail::to($user->email)->queue(new CompleteUserProfile($user, $plainPassword));
        // dd($user);

        return redirect()->back()->with('success', 'User updated successfully');
    }
}
