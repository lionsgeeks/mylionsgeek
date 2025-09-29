<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlacesController extends Controller
{
    public function index()
    {
        $places = Place::latest()->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'place_type' => $p->place_type,
                'state' => (bool) $p->state,
                'image' => $p->image ? asset($p->image) : null,
            ];
        });

        $types = ['cowork', 'studio', 'meeting_room'];

        return Inertia::render('admin/places/index', [
            'places' => $places,
            'types' => $types,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'place_type' => 'required|string|in:cowork,studio,meeting_room',
            'state' => 'required|boolean',
            'image' => 'nullable|image|max:4096',
        ]);

        Place::create([
            'name' => $request->name,
            'place_type' => $request->place_type,
            'state' => (bool) $request->state,
            'image' => $request->hasFile('image')
                ? 'storage/'.$request->file('image')->store('places', 'public')
                : null,
        ]);

        return redirect()->route('admin.places')->with('success', 'Place added');
    }

    public function update(Request $request, Place $place)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'place_type' => 'required|string|in:cowork,studio,meeting_room',
            'state' => 'required|boolean',
            'image' => 'nullable|image|max:4096',
        ]);

        $place->update([
            'name' => $request->name,
            'place_type' => $request->place_type,
            'state' => (string)$request->state === '1' || $request->state === 1 || $request->state === true,
            'image' => $request->hasFile('image')
                ? 'storage/'.$request->file('image')->store('places', 'public')
                : $place->image, // keep old image if not updated
        ]);

        return redirect()->route('admin.places')->with('success', 'Place updated');
    }

    public function destroy(Place $place)
    {
        $place->delete();
        return back()->with('success', 'Place deleted');
    }
}
