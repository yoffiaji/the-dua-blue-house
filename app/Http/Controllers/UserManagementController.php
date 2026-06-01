<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * Get user detail with statistics
     */
    public function getUserDetail($id)
    {
        $user = User::with([
            'bookings' => function($query) {
                $query->orderBy('created_at', 'desc');
            }
        ])->findOrFail($id);
        
        // Calculate statistics
        $activeBookings = Booking::where('user_id', $id)
            ->whereIn('status', ['menunggu_pembayaran', 'menunggu_verifikasi', 'disetujui'])
            ->count();
        
        $totalPayments = Payment::whereHas('booking', function($query) use ($id) {
            $query->where('user_id', $id);
        })
        ->where('status', 'success')
        ->sum('amount');
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'birth_date' => $user->birth_date,
                'role' => $user->role,
                'ktp_file' => $user->ktp_file,
                'ktp_verified' => $user->ktp_verified,
                'created_at' => $user->created_at,
                'bookings_count' => $user->bookings->count(),
                'active_bookings_count' => $activeBookings,
                'total_payments' => $totalPayments,
                'bookings' => $user->bookings
            ]
        ]);
    }
    
    /**
     * Update user data by admin
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($user->id)
            ],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'birth_date' => 'nullable|date|before:today'
        ]);
        
        try {
            $user->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Data user berhasil diperbarui',
                'data' => $user
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data user: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Verify or reject user KTP
     */
    public function verifyKTP(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:approve,reject'
        ]);
        
        $user = User::findOrFail($id);
        
        if (!$user->ktp_file) {
            return response()->json([
                'success' => false,
                'message' => 'User belum mengupload KTP'
            ], 400);
        }
        
        try {
            if ($request->action === 'approve') {
                $user->ktp_verified = true;
                $message = 'KTP berhasil diverifikasi';
            } else {
                $user->ktp_verified = false;
                // Optionally delete KTP file when rejected
                // if ($user->ktp_file && Storage::disk('public')->exists($user->ktp_file)) {
                //     Storage::disk('public')->delete($user->ktp_file);
                // }
                // $user->ktp_file = null;
                $message = 'KTP ditolak';
            }
            
            $user->save();
            
            return response()->json([
                'success' => true,
                'message' => $message
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete user (soft delete or hard delete)
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting user with active bookings
        $hasActiveBooking = Booking::where('user_id', $id)
            ->whereIn('status', ['menunggu_pembayaran', 'menunggu_verifikasi', 'disetujui'])
            ->exists();
        
        if ($hasActiveBooking) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus user yang memiliki booking aktif'
            ], 400);
        }
        
        // Prevent deleting admin users
        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus user admin'
            ], 403);
        }
        
        try {
            // Delete KTP file if exists
            if ($user->ktp_file && \Storage::disk('public')->exists($user->ktp_file)) {
                \Storage::disk('public')->delete($user->ktp_file);
            }
            
            $user->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'User berhasil dihapus'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus user: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Reset user password by admin
     */
    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'new_password' => 'required|string|min:8|confirmed'
        ]);
        
        $user = User::findOrFail($id);
        
        try {
            $user->password = Hash::make($request->new_password);
            $user->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Password user berhasil direset'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mereset password: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get users pending KTP verification
     */
    public function getPendingKTPVerification()
    {
        $users = User::whereNotNull('ktp_file')
            ->where('ktp_verified', false)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $users,
            'count' => $users->count()
        ]);
    }
}