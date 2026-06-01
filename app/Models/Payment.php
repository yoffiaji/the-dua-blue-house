<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'amount',
        'snap_token',
        'status',
        'midtrans_transaction_id',
        'midtrans_response',
    ];

    // ADDED: Relasi ke Booking
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}