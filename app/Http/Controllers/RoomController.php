<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomController extends Controller
{
    /**
     * Display the home page with available rooms
     */
    public function index()
    {
        // Ambil kamar Available terlebih dahulu
        $availableRooms = Room::where('status', 'Available')->take(6)->get();

        // Jika available < 6 → ambil reserved untuk melengkapi 6
        if ($availableRooms->count() < 6) {
            $remaining = 6 - $availableRooms->count();

            $reservedRooms = Room::where('status', 'Reserved')
                ->take($remaining)
                ->get();

            $rooms = $availableRooms->concat($reservedRooms);
        } else {
            $rooms = $availableRooms;
        }

        return view('home', compact('rooms'));
    }
    
    /**
     * Display all rooms page
     */
    public function showAllRooms()
    {
        $rooms = Room::all();
        return view('rooms', compact('rooms'));
    }
    
    /**
     * Store a new room
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'room_type' => 'required|in:Premium,Reguler',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:Available,Reserved'
        ]);
        
        // Handle photo upload
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('rooms', 'public');
            $validated['photo'] = $path;
        }
        
        $room = Room::create($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil ditambahkan',
            'data' => $room
        ], 201);
    }
    
    /**
     * Update room data
     */
    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'room_type' => 'sometimes|required|in:Premium,Reguler',
            'price' => 'sometimes|required|numeric|min:0',
            'description' => 'sometimes|required|string',
            'photo' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
            'capacity' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|in:Available,Reserved'
        ]);
        
        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo
            if ($room->photo) {
                Storage::disk('public')->delete($room->photo);
            }
            
            $path = $request->file('photo')->store('rooms', 'public');
            $validated['photo'] = $path;
        }
        
        $room->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil diperbarui',
            'data' => $room
        ]);
    }
    
    /**
     * Delete room
     */
    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        
        // Check if room has active bookings
        if ($room->status === 'Reserved') {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus kamar yang sedang terisi'
            ], 400);
        }
        
        // Delete photo
        if ($room->photo) {
            Storage::disk('public')->delete($room->photo);
        }
        
        $room->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil dihapus'
        ]);
    }
}