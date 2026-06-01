<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'birth_date',
        'ktp_file',
        'ktp_verified',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birth_date' => 'date',
            'ktp_verified' => 'boolean',
        ];
    }
    
    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
    
    /**
     * Check if user is regular user
     */
    public function isUser(): bool
    {
        return $this->role === 'user';
    }
    
    /**
     * Get user's bookings
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
    
    /**
     * Get user's active booking
     */
    public function activeBooking()
    {
        return $this->hasOne(Booking::class)
            ->whereIn('status', ['menunggu_pembayaran', 'menunggu_verifikasi', 'disetujui'])
            ->latest();
    }
    
    /**
     * Get KTP URL
     */
    public function getKtpUrlAttribute()
    {
        return $this->ktp_file ? asset('storage/' . $this->ktp_file) : null;
    }
}