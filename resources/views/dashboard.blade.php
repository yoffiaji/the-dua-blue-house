    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>The Dua Blue House - Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        
        <!-- Midtrans Snap -->
        <script src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key="{{ config('midtrans.client_key') }}"></script>
        
        <style>
            /* Custom Styles for Fixed Sidebar Layout */
            .sidebar-fixed {
                position: fixed;
                top: 72px;
                left: 0;
                width: 280px;
                height: calc(100vh - 72px);
                overflow-y: auto;
                background-color: white;
                border-right: 1px solid #e5e7eb;
                z-index: 40;
            }
            
            .main-content-fixed {
                margin-left: 280px;
                width: calc(100% - 280px);
                min-height: calc(100vh - 72px);
                padding: 2rem;
                box-sizing: border-box;
            }

            .sidebar-fixed::-webkit-scrollbar {
                width: 6px;
            }
            
            .sidebar-fixed::-webkit-scrollbar-track {
                background: #f1f1f1;
            }
            
            .sidebar-fixed::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 3px;
            }
            
            .sidebar-fixed::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }
            
            .menu-item {
                transition: all 0.2s ease;
            }
            
            .menu-item:hover {
                transform: translateX(2px);
            }
            
            .card-hover {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .card-hover:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            
            @media (max-width: 1024px) {
                .sidebar-fixed {
                    width: 240px;
                }
                .main-content-fixed {
                    margin-left: 240px;
                }
            }
            
            @media (max-width: 768px) {
                .sidebar-fixed {
                    transform: translateX(-100%);
                    transition: transform 0.3s ease;
                }
                
                .sidebar-fixed.mobile-open {
                    transform: translateX(0);
                }
                
                .main-content-fixed {
                    margin-left: 0;
                }
            }
            
            .page-content {
                animation: fadeIn 0.3s ease-in;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .animate-fadeIn {
                animation: fadeInScale 0.2s ease-out;
            }
            
            .line-clamp-2 {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .empty-state {
                min-height: 400px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .loader {
                border: 4px solid #e5e7eb;
                border-top-color: #3b82f6;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .form-input {
                width: 100%;
                padding: 0.5rem 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.5rem;
                font-size: 0.875rem;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .form-label {
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                color: #374151;
                margin-bottom: 0.5rem;
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Top Navigation -->
        <nav class="bg-white shadow-sm fixed w-full top-0 z-50">
            <div class="container w-full px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                            <i class="fas fa-home text-white"></i>
                        </div>
                        <div>
                            <span class="text-lg font-semibold text-gray-800">The Dua Blue House</span>
                            <p class="text-xs text-gray-500" id="userRole">
                                {{ auth()->user()->role === 'admin' ? 'Admin Dashboard' : 'User Dashboard' }}
                            </p>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-3">
                            <img src="https://ui-avatars.com/api/?name={{ urlencode(auth()->user()->name) }}&background=3b82f6&color=fff" class="w-10 h-10 rounded-full">
                            <div>
                                <p class="text-sm font-medium text-gray-800">{{ auth()->user()->name }}</p>
                                <form action="{{ route('logout') }}" method="POST" class="inline">
                                    @csrf
                                    <button type="submit" class="text-xs text-gray-500 hover:text-red-600">Logout</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <div class="flex pt-16">
            <!-- Sidebar -->
            <aside class="sidebar-fixed">
                @if(auth()->user()->role === 'admin')
                <!-- Admin Menu -->
                <div class="p-6 space-y-2">
                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium" data-page="dashboard">
                        <i class="fas fa-th-large mr-2"></i>
                        <span>Dashboard</span>
                    </button>
                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50" data-page="rooms">
                        <i class="fas fa-door-open mr-2"></i>
                        <span>Manajemen Kamar</span>
                    </button>
                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50" data-page="bookings">
                        <i class="fas fa-calendar-check mr-2"></i>
                        <span>Manajemen Booking</span>
                    </button>
                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50" data-page="residents">
                        <i class="fas fa-users mr-2"></i>
                        <span>Manajemen Penghuni</span>
                    </button>
                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50" data-page="users">
                        <i class="fas fa-user-friends mr-2"></i>
                        <span>Manajemen User</span>
                    </button>
                </div>
                @else
                <!-- User Menu -->
                <div class="p-6 space-y-2">
                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium" data-page="user-dashboard">
                        <i class="fas fa-th-large mr-2"></i>
                        <span>Dashboard</span>
                    </button>
                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50" data-page="available-rooms">
                        <i class="fas fa-door-open mr-2"></i>
                        <span>Cari Kamar</span>
                    </button>
                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50" data-page="my-bookings">
                        <i class="fas fa-calendar-check mr-2"></i>
                        <span>Booking Saya</span>
                    </button>
                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50" data-page="payment-history">
                        <i class="fas fa-history mr-2"></i>
                        <span>Riwayat Pembayaran</span>
                    </button>
                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50" data-page="profile">
                        <i class="fas fa-user-circle mr-2"></i>
                        <span>Profile</span>
                    </button>
                </div>
                @endif
            </aside>

            <!-- Main Content -->
            <main class="main-content-fixed">
                <div id="mainContent" class="page-content">
                    <!-- Content will be dynamically loaded here -->
                </div>
            </main>
        </div>

        <!-- Booking Modal -->
        <div id="bookingModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50 transition-opacity">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
                <h2 class="text-xl font-semibold text-gray-800 mb-2">Confirm Booking</h2>
                <p class="text-gray-600 text-sm mb-4">Are you sure you want to book this room?</p>

                <div class="flex justify-end space-x-3 mt-6">
                    <button id="cancelBooking" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
                        Cancel
                    </button>
                    <button id="confirmBooking" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                        Yes, Book Now
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading Modal -->
        <div id="loadingModal" class="fixed inset-0 bg-black bg-opacity-40 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-lg px-6 py-4 flex flex-col items-center animate-fadeIn">
                <div class="loader mb-3"></div>
                <p class="text-gray-700 text-sm">Processing...</p>
            </div>
        </div>

<script type="module" src="//elsie-autecologic-heidy.ngrok-free.dev/js/main.js"></script>
    </body>
    </html> 