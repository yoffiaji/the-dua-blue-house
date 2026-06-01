<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function midtransCallback(Request $request)
    {
        // LOG SEMUA REQUEST DARI MIDTRANS (untuk debugging)
        Log::info('=== MIDTRANS CALLBACK RECEIVED ===', [
            'order_id' => $request->order_id,
            'transaction_status' => $request->transaction_status,
            'transaction_id' => $request->transaction_id,
            'fraud_status' => $request->fraud_status,
            'gross_amount' => $request->gross_amount,
            'payment_type' => $request->payment_type,
            'all_data' => $request->all()
        ]);

        $serverKey = config('midtrans.server_key');
        
        // Validasi signature
        $hashed = hash(
            'sha512',
            $request->order_id .
            $request->status_code .
            $request->gross_amount .
            $serverKey
        );

        if ($hashed !== $request->signature_key) {
            Log::error('Invalid Midtrans Signature', [
                'order_id' => $request->order_id,
                'expected_hash' => substr($hashed, 0, 20) . '...',
                'received_hash' => substr($request->signature_key, 0, 20) . '...',
            ]);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        DB::beginTransaction();
        try {
            // Extract booking ID dari order_id (BOOK-44 → 44)
            $bookingId = str_replace('BOOK-', '', $request->order_id);

            $booking = Booking::with('room')->findOrFail($bookingId);
            $payment = Payment::where('booking_id', $bookingId)->firstOrFail();

            // Simpan transaction ID dari Midtrans
            $payment->midtrans_transaction_id = $request->transaction_id;

            $transactionStatus = $request->transaction_status;
            $fraudStatus = $request->fraud_status ?? 'accept'; // Default ke accept jika null

            Log::info('Processing Transaction', [
                'booking_id' => $bookingId,
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
                'old_booking_status' => $booking->status,
                'old_payment_status' => $payment->status,
            ]);

            // === PROSES BERDASARKAN STATUS ===
            
            // 1. PAYMENT SUCCESS
            if ($transactionStatus === 'settlement' || 
               ($transactionStatus === 'capture' && $fraudStatus === 'accept')) {

                $payment->status = 'success';
                $booking->status = 'disetujui';

                // Update room status
                $booking->room->status = 'Reserved';
                $booking->room->save();

                Log::info('✅ Payment SUCCESS', [
                    'booking_id' => $bookingId,
                    'new_booking_status' => 'disetujui',
                    'new_payment_status' => 'success',
                    'room_status' => 'Reserved'
                ]);

            } 
            // 2. PAYMENT FAILED
            elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {

                $payment->status = 'failed';
                $booking->status = 'ditolak';

                Log::info('❌ Payment FAILED', [
                    'booking_id' => $bookingId,
                    'reason' => $transactionStatus,
                    'new_booking_status' => 'ditolak',
                    'new_payment_status' => 'failed'
                ]);

            } 
            // 3. PAYMENT PENDING
            elseif ($transactionStatus === 'pending') {

                $payment->status = 'pending';
                $booking->status = 'menunggu_pembayaran'; // ← INI YANG KURANG!

                Log::info('⏳ Payment PENDING', [
                    'booking_id' => $bookingId,
                    'new_booking_status' => 'menunggu_pembayaran',
                    'new_payment_status' => 'pending'
                ]);

            }
            // 4. STATUS LAINNYA (challenge, etc)
            else {

                // Untuk status challenge atau lainnya, tetap pending
                $payment->status = 'pending';
                $booking->status = 'menunggu_pembayaran';

                Log::warning('⚠️ Unknown Transaction Status', [
                    'booking_id' => $bookingId,
                    'transaction_status' => $transactionStatus,
                    'set_to' => 'pending'
                ]);

            }

            // Simpan semua response dari Midtrans untuk audit
            $payment->midtrans_response = json_encode($request->all());
            $payment->save();
            $booking->save();

            DB::commit();
            
            Log::info('✅ Callback Processed Successfully', [
                'booking_id' => $bookingId,
                'final_booking_status' => $booking->status,
                'final_payment_status' => $payment->status,
            ]);
            
            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Midtrans Callback Error', [
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'order_id' => $request->order_id ?? 'unknown',
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }
}