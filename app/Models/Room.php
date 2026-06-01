<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = [
        'name',
        'room_type',
        'price',
        'description',
        'photo',
        'capacity',
        'status',
    ];

    /**
     * Get all bookings for this room
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get active booking for this room
     */
    public function activeBooking()
    {
        return $this->hasOne(Booking::class)
            ->where('status', 'disetujui')
            ->latest();
    }
}