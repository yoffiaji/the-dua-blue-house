<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class HomeController extends Controller
{
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
}
