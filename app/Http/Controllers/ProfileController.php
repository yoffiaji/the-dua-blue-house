<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Get user profile data
     */
    public function getProfile()
    {
        $user = Auth::user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'birth_date' => $user->birth_date,
                'ktp_file' => $user->ktp_file,
                'ktp_verified' => $user->ktp_verified,
                'role' => $user->role,
                'created_at' => $user->created_at
            ]
        ]);
    }
    
    /**
     * Update basic profile info
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'birth_date' => 'nullable|date|before:today'
        ]);
        
        try {
            $user->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Profil berhasil diperbarui',
                'data' => $user
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui profil: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update password
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'current_password.required' => 'Password lama harus diisi',
            'new_password.required' => 'Password baru harus diisi',
            'new_password.confirmed' => 'Konfirmasi password tidak cocok',
            'new_password.min' => 'Password minimal 8 karakter'
        ]);
        
        // Check if current password is correct
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password lama tidak sesuai'
            ], 422);
        }
        
        try {
            $user->password = Hash::make($validated['new_password']);
            $user->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Password berhasil diubah'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah password: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Upload KTP file
     */
    public function uploadKTP(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'ktp' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048' // Max 2MB
        ], [
            'ktp.required' => 'File KTP harus diupload',
            'ktp.mimes' => 'File harus berformat JPG, JPEG, PNG, atau PDF',
            'ktp.max' => 'Ukuran file maksimal 2MB'
        ]);
        
        try {
            // Delete old KTP if exists
            if ($user->ktp_file && Storage::disk('public')->exists($user->ktp_file)) {
                Storage::disk('public')->delete($user->ktp_file);
            }
            
            // Store new KTP
            $ktpPath = $request->file('ktp')->store('ktp', 'public');
            
            $user->ktp_file = $ktpPath;
            $user->ktp_verified = false; // Reset verification status
            $user->save();
            
            return response()->json([
                'success' => true,
                'message' => 'KTP berhasil diupload. Menunggu verifikasi admin.',
                'data' => [
                    'ktp_file' => $ktpPath,
                    'ktp_url' => Storage::url($ktpPath)
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupload KTP: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete KTP file
     */
    public function deleteKTP()
    {
        $user = Auth::user();
        
        if (!$user->ktp_file) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada KTP yang diupload'
            ], 404);
        }
        
        try {
            // Delete file from storage
            if (Storage::disk('public')->exists($user->ktp_file)) {
                Storage::disk('public')->delete($user->ktp_file);
            }
            
            $user->ktp_file = null;
            $user->ktp_verified = false;
            $user->save();
            
            return response()->json([
                'success' => true,
                'message' => 'KTP berhasil dihapus'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus KTP: ' . $e->getMessage()
            ], 500);
        }
    }
}