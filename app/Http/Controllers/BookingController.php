<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Midtrans\Snap;
use Midtrans\Config;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id'
        ]);
        
        DB::beginTransaction();
        try {
            // Check if room is available
            $room = Room::findOrFail($validated['room_id']);
            
            if ($room->status !== 'Available') {
                return response()->json([
                    'success' => false,
                    'message' => 'Kamar tidak tersedia untuk booking'
                ], 400);
            }
            
            // Check if user already has active booking
            $existingBooking = Booking::where('user_id', Auth::id())
                ->whereIn('status', ['menunggu_pembayaran', 'menunggu_verifikasi', 'disetujui'])
                ->exists();
            
            if ($existingBooking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah memiliki booking aktif'
                ], 400);
            }
            
            // Create booking
            $booking = Booking::create([
                'user_id' => Auth::id(),
                'room_id' => $validated['room_id'],
                'status' => 'menunggu_pembayaran'
            ]);
            
            // Create payment record
            Payment::create([
                'booking_id' => $booking->id,
                'amount' => $room->price,
                'status' => 'pending'
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil dibuat. Silakan lakukan pembayaran.',
                'data' => $booking->load(['room', 'payment'])
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * CREATE MIDTRANS SNAP PAYMENT
     * (INI YANG TADI KAMU CARI)
     */
public function createSnapPayment(Request $request)
{
    $request->validate([
        'booking_id' => 'required|exists:bookings,id'
    ]);

    $booking = Booking::with('room')
        ->where('id', $request->booking_id)
        ->where('user_id', Auth::id())
        ->firstOrFail();

    // MIDTRANS CONFIG (SANDBOX)
    Config::$serverKey = config('midtrans.server_key');
    Config::$isProduction = false;
    Config::$isSanitized = true;
    Config::$is3ds = true;

    // 🔥 FIX PALING PENTING ADA DI SINI
    $grossAmount = number_format($booking->room->price, 2, '.', '');

    $params = [
        'transaction_details' => [
            'order_id' => 'BOOK-' . $booking->id,
            'gross_amount' => $grossAmount, // "3000000.00"
        ],
        'customer_details' => [
            'first_name' => Auth::user()->name,
            'email' => Auth::user()->email,
        ],
    ];

    // LOG DEBUG (AMAN, BOLEH HAPUS SETELAH BERHASIL)
    \Log::info('MIDTRANS SNAP CREATE', [
        'order_id' => 'BOOK-' . $booking->id,
        'gross_amount_sent' => $grossAmount,
    ]);

    $snapToken = Snap::getSnapToken($params);

    return response()->json([
        'success' => true,
        'snap_token' => $snapToken
    ]);
}
    
    /**
     * Cancel booking
     */
    public function cancel($id)
    {
        $booking = Booking::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();
        
        // Can only cancel if pending or waiting for payment
        if (!in_array($booking->status, ['pending', 'menunggu_pembayaran'])) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak dapat dibatalkan'
            ], 400);
        }
        
        DB::beginTransaction();
        try {
            $booking->status = 'ditolak';
            $booking->save();
            
            // Update payment status if exists
            if ($booking->payment) {
                $booking->payment->status = 'failed';
                $booking->payment->save();
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil dibatalkan'
            ]);
            
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}
