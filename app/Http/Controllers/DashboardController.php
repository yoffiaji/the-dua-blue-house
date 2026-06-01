<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display admin dashboard
     */
    public function adminDashboard()
    {
        // Total rooms statistics
        $totalRooms = Room::count();
        $occupiedRooms = Room::where('status', 'Reserved')->count();
        $availableRooms = Room::where('status', 'Available')->count();
        
        // Pending verification count
        $pendingVerification = Booking::where('status', 'menunggu_verifikasi')->count();
        
        // Recent bookings with user and room info
        $recentBookings = Booking::with(['user', 'room'])
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();
        
        // Monthly revenue
        $monthlyRevenue = Payment::where('status', 'success')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');
        
        $paidPayments = Payment::where('status', 'success')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        
        $pendingPayments = Payment::where('status', 'pending')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        
        return view('dashboard', compact(
            'totalRooms',
            'occupiedRooms',
            'availableRooms',
            'pendingVerification',
            'recentBookings',
            'monthlyRevenue',
            'paidPayments',
            'pendingPayments'
        ));
    }
    
    /**
     * Display user dashboard
     */
    public function userDashboard()
    {
        $user = Auth::user();
        
        // Get user's active booking
        $activeBooking = Booking::with(['room', 'payment'])
            ->where('user_id', $user->id)
            ->whereIn('status', ['menunggu_pembayaran', 'menunggu_verifikasi', 'disetujui'])
            ->latest()
            ->first();
        
        return view('dashboard', compact('activeBooking'));
    }
    
    /**
     * Get rooms data for management
     */
    public function getRooms()
    {
        $rooms = Room::orderBy('created_at', 'desc')->get();
        return response()->json($rooms);
    }
    
    /**
     * Get bookings data for management
     */
    public function getBookings()
    {
        $bookings = Booking::with(['user', 'room', 'payment'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($bookings);
    }
    
    /**
     * Get payments pending verification
     */
    public function getPendingPayments()
    {
        $payments = Booking::with(['user', 'room', 'payment'])
            ->where('status', 'menunggu_verifikasi')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($payments);
    }
    
    /**
     * Get all residents (users with approved bookings)
     */
    public function getResidents()
    {
        $residents = Booking::with(['user', 'room'])
            ->where('status', 'disetujui')
            ->get();
        
        return response()->json($residents);
    }
    
    /**
     * Get all users for user management
     */
    public function getUsers()
    {
        $users = User::withCount(['bookings'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($users);
    }
    
    /**
     * Get available rooms for booking (user view)
     */
    public function getAvailableRooms()
    {
        $rooms = Room::where('status', 'Available')
            ->orderBy('price', 'asc')
            ->get();
        
        return response()->json($rooms);
    }
    
    /**
     * Get user's bookings
     */
    public function getMyBookings()
    {
        $bookings = Booking::with(['room', 'payment'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($bookings);
    }
    
    /**
     * Get user's payment history with statistics
     */
    public function getPaymentHistory()
    {
        $userId = Auth::id();
        
        $payments = Payment::whereHas('booking', function($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->with(['booking.room'])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function($payment) {
            return [
                'id' => $payment->id,
                'order_id' => $payment->order_id ?? 'N/A',
                'room_name' => $payment->booking->room->name ?? 'N/A',
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method ?? 'Transfer Bank',
                'status' => $payment->status,
                'midtrans_transaction_id' => $payment->midtrans_transaction_id,
                'created_at' => $payment->created_at,
                'payment_proof' => $payment->payment_proof
            ];
        });
        
        // Calculate statistics
        $stats = [
            'total_transactions' => $payments->count(),
            'total_paid' => $payments->where('status', 'success')->sum('amount'),
            'success_count' => $payments->where('status', 'success')->count(),
            'pending_count' => $payments->where('status', 'pending')->count(),
            'failed_count' => $payments->where('status', 'failed')->count()
        ];
        
        return response()->json([
            'data' => $payments,
            'stats' => $stats
        ]);
    }
    
    /**
     * Get payment detail
     */
    public function getPaymentDetail($id)
    {
        $payment = Payment::with(['booking.room', 'booking.user'])
            ->findOrFail($id);
        
        // Check authorization
        if (Auth::user()->role !== 'admin' && $payment->booking->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $payment->id,
                'order_id' => $payment->order_id ?? 'N/A',
                'booking_id' => $payment->booking_id,
                'user_name' => $payment->booking->user->name,
                'room_name' => $payment->booking->room->name,
                'room_type' => $payment->booking->room->room_type,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method ?? 'Transfer Bank',
                'status' => $payment->status,
                'payment_proof' => $payment->payment_proof,
                'midtrans_transaction_id' => $payment->midtrans_transaction_id,
                'midtrans_response' => $payment->midtrans_response,
                'created_at' => $payment->created_at,
                'updated_at' => $payment->updated_at
            ]
        ]);
    }
    
    /**
     * Filter payment history
     */
    public function filterPaymentHistory(Request $request)
    {
        $query = Payment::whereHas('booking', function($q) {
            $q->where('user_id', Auth::id());
        })->with(['booking.room']);
        
        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        $payments = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function($payment) {
                return [
                    'id' => $payment->id,
                    'order_id' => $payment->order_id ?? 'N/A',
                    'room_name' => $payment->booking->room->name ?? 'N/A',
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method ?? 'Transfer Bank',
                    'status' => $payment->status,
                    'created_at' => $payment->created_at
                ];
            });
        
        return response()->json(['data' => $payments]);
    }
    
    /**
     * Update room status
     */
    public function updateRoomStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Available,Reserved'
        ]);
        
        $room = Room::findOrFail($id);
        $room->status = $request->status;
        $room->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Status kamar berhasil diperbarui'
        ]);
    }
    
    /**
     * Verify payment (approve/reject)
     */
    public function verifyPayment(Request $request, $bookingId)
    {
        $request->validate([
            'action' => 'required|in:approve,reject'
        ]);
        
        DB::beginTransaction();
        try {
            $booking = Booking::with(['payment', 'room'])->findOrFail($bookingId);
            
            if ($request->action === 'approve') {
                // Update booking status
                $booking->status = 'disetujui';
                $booking->save();
                
                // Update payment status
                if ($booking->payment) {
                    $booking->payment->status = 'success';
                    $booking->payment->save();
                }
                
                // Update room status to Reserved
                $booking->room->status = 'Reserved';
                $booking->room->save();
                
                $message = 'Pembayaran berhasil disetujui';
            } else {
                // Reject payment
                $booking->status = 'ditolak';
                $booking->save();
                
                if ($booking->payment) {
                    $booking->payment->status = 'failed';
                    $booking->payment->save();
                }
                
                $message = 'Pembayaran ditolak';
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => $message
            ]);
            
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get dashboard statistics (API)
     */
    public function getStatistics()
    {
        return response()->json([
            'total_rooms' => Room::count(),
            'occupied_rooms' => Room::where('status', 'Reserved')->count(),
            'available_rooms' => Room::where('status', 'Available')->count(),
            'pending_verification' => Booking::where('status', 'menunggu_verifikasi')->count(),
            'monthly_revenue' => Payment::where('status', 'success')
                ->whereMonth('created_at', now()->month)
                ->sum('amount'),
            'paid_payments' => Payment::where('status', 'success')
                ->whereMonth('created_at', now()->month)
                ->count(),
            'pending_payments' => Payment::where('status', 'pending')
                ->whereMonth('created_at', now()->month)
                ->count()
        ]);
    }
}