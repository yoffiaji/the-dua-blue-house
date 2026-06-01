<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/rooms', [RoomController::class, 'showAllRooms'])->name('rooms');

// Authentication routes
Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::get('/register', [AuthController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [AuthController::class, 'register']);

// Authentication required routes
Route::middleware(['auth'])->group(function () {
    
    // Dashboard routes (role-based)
    Route::get('/dashboard', function() {
        if (auth()->user()->role === 'admin') {
            return app(DashboardController::class)->adminDashboard();
        }
        return app(DashboardController::class)->userDashboard();
    })->name('dashboard');
    
    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        // Statistics
        Route::get('/api/dashboard/statistics', [DashboardController::class, 'getStatistics']);
        
        // Room Management
        Route::get('/api/rooms', [DashboardController::class, 'getRooms']);
        Route::post('/api/rooms', [RoomController::class, 'store']);
        Route::put('/api/rooms/{id}', [RoomController::class, 'update']);
        Route::delete('/api/rooms/{id}', [RoomController::class, 'destroy']);
        Route::put('/api/rooms/{id}/status', [DashboardController::class, 'updateRoomStatus']);
        
        // Booking Management
        Route::get('/api/bookings', [DashboardController::class, 'getBookings']);
        
        // Payment Verification
        Route::get('/api/payments/pending', [DashboardController::class, 'getPendingPayments']);
        Route::post('/api/payments/{bookingId}/verify', [DashboardController::class, 'verifyPayment']);
        
        // Residents Management
        Route::get('/api/residents', [DashboardController::class, 'getResidents']);
        
        // User Management (NEW)
        Route::get('/api/users', [DashboardController::class, 'getUsers']);
        Route::get('/api/users/{id}', [UserManagementController::class, 'getUserDetail']);
        Route::put('/api/users/{id}', [UserManagementController::class, 'updateUser']);
        Route::delete('/api/users/{id}', [UserManagementController::class, 'deleteUser']);
        Route::post('/api/users/{id}/verify-ktp', [UserManagementController::class, 'verifyKTP']);
        Route::post('/api/users/{id}/reset-password', [UserManagementController::class, 'resetPassword']);
        Route::get('/api/users/pending-ktp', [UserManagementController::class, 'getPendingKTPVerification']);
    });
    
    // User routes
    Route::middleware(['role:user'])->group(function () {
        // Available Rooms
        Route::get('/api/available-rooms', [DashboardController::class, 'getAvailableRooms']);
        
        // Booking
        Route::get('/api/my-bookings', [DashboardController::class, 'getMyBookings']);
        Route::post('/api/bookings', [BookingController::class, 'store']);
        Route::post('/api/bookings/snap', [BookingController::class, 'createSnapPayment']);
        
        // Profile Management
        Route::get('/api/profile', [ProfileController::class, 'getProfile']);
        Route::put('/api/profile', [ProfileController::class, 'updateProfile']);
        Route::put('/api/profile/password', [ProfileController::class, 'updatePassword']);
        Route::post('/api/profile/ktp', [ProfileController::class, 'uploadKTP']);
        Route::delete('/api/profile/ktp', [ProfileController::class, 'deleteKTP']);
        
        // Payment History (IMPROVED - NEW)
        Route::get('/api/payment-history', [DashboardController::class, 'getPaymentHistory']);
        Route::get('/api/payment-history/filter', [DashboardController::class, 'filterPaymentHistory']);
        Route::get('/api/payments/{id}', [DashboardController::class, 'getPaymentDetail']);
    });
    
    // Shared routes (both admin and user can access)
    Route::get('/api/profile', [ProfileController::class, 'getProfile']);
    Route::put('/api/profile', [ProfileController::class, 'updateProfile']);
    Route::put('/api/profile/password', [ProfileController::class, 'updatePassword']);
    Route::post('/api/profile/ktp', [ProfileController::class, 'uploadKTP']);
    Route::delete('/api/profile/ktp', [ProfileController::class, 'deleteKTP']);
});