<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Dua Blue House</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body class="bg-gray-50">

@include('components.navbar') 

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-blue-500 text-white min-h-[60vh] flex items-center">
        <div class="container mx-auto px-8 py-16">
            <div class="flex flex-col md:flex-row items-center justify-between gap-16">

                <div class="md:w-1/2 ml-16">
                    <h1 class="text-3xl md:text-4xl font-bold mb-3 leading-tight">Your Home Away From Home</h1>
                    <p class="text-sm mb-6 text-blue-50 leading-relaxed">
                        Experience comfort and convenience at The Dua Blue House. Modern rooms, excellent facilities, and a welcoming atmosphere.
                    </p>
                    <div class="flex flex-wrap gap-3">
                        <a href="/rooms" class="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                            View Available Rooms
                        </a>
                        <a href="/rooms" class="px-4 py-2 border-2 border-white text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                            Book Now
                        </a>
                    </div>
                </div>

                <div class="md:w-1/2 mr-12 grid grid-cols-2 gap-4">
                    <div class="bg-blue-500 bg-opacity-40 rounded-xl px-4 py-6 text-center backdrop-blur hover:scale-105 transition">
                        <i class="fas fa-wifi text-2xl mb-2"></i>
                        <p class="font-semibold text-sm">Free WiFi</p>
                        <p class="text-xs text-blue-100">High-speed internet</p>
                    </div>
                    <div class="bg-blue-500 bg-opacity-40 rounded-xl px-4 py-6 text-center backdrop-blur hover:scale-105 transition">
                        <i class="fas fa-shield-alt text-2xl mb-2"></i>
                        <p class="font-semibold text-sm">24/7 Security</p>
                        <p class="text-xs text-blue-100">Safe and secure</p>
                    </div>
                    <div class="bg-blue-500 bg-opacity-40 rounded-xl px-4 py-6 text-center backdrop-blur hover:scale-105 transition">
                        <i class="fas fa-broom text-2xl mb-2"></i>
                        <p class="font-semibold text-sm">Daily Cleaning</p>
                        <p class="text-xs text-blue-100">Housekeeping service</p>
                    </div>
                    <div class="bg-blue-500 bg-opacity-40 rounded-xl px-4 py-6 text-center backdrop-blur hover:scale-105 transition">
                        <i class="fas fa-utensils text-2xl mb-2"></i>
                        <p class="font-semibold text-sm">Kitchen Access</p>
                        <p class="text-xs text-blue-100">Shared facilities</p>
                    </div>
                </div>

            </div>
        </div>
    </section>

    <!-- Available Rooms Section -->
    <section class="py-12">
        <div class="container mx-auto px-12">

            <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                @foreach ($rooms as $room)
                    <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition flex flex-col">

                        <img src="{{ url('img/rooms/' . $room->photo) }}"
                             alt="{{ $room->name }}"
                             class="w-full h-56 object-cover">

                        <div class="p-6 flex flex-col grow">

                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-lg font-semibold text-gray-800">{{ $room->name }}</h3>

                                @if ($room->status === 'Available')
                                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                        Available
                                    </span>
                                @else
                                    <span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                        Reserved
                                    </span>
                                @endif
                            </div>

                            <p class="text-gray-600 text-sm mb-6 grow leading-relaxed">
                                {{ $room->description }}
                            </p>

                            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <span class="text-2xl font-bold text-blue-600">
                                        Rp {{ number_format($room->price, 0, ',', '.') }}
                                    </span>
                                    <span class="text-gray-500 text-sm">/month</span>
                                </div>

                                @if ($room->status === 'Available')
                                    <button 
                                        class="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition btn-book"
                                        data-room="{{ $room->id }}">
                                        Book Now
                                    </button>
                                @else
                                    <button class="px-4 py-2 bg-gray-300 text-gray-600 rounded text-sm cursor-not-allowed">
                                        Not Available
                                    </button>
                                @endif
                            </div>

                        </div>

                    </div>
                @endforeach

            </div>

        </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="py-12 bg-white">
        <div class="container mx-auto px-20">

            <div class="text-center mb-12">
                <h2 class="text-2xl font-bold text-gray-800">Why Choose Us?</h2>
                <p class="text-sm text-gray-600">Experience the best boarding house living</p>
            </div>

            <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                <div class="text-center">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-map-marker-alt text-2xl text-blue-600"></i>
                    </div>
                    <h3 class="text-base font-semibold text-gray-800 mb-2">Great Location</h3>
                    <p class="text-sm text-gray-600">Close to workplaces and campuses</p>
                </div>

                <div class="text-center">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-house-user text-2xl text-blue-600"></i>
                    </div>
                    <h3 class="text-base font-semibold text-gray-800 mb-2">Housekeeping</h3>
                    <p class="text-sm text-gray-600">Regular cleaning included</p>
                </div>

                <div class="text-center">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-parking text-2xl text-blue-600"></i>
                    </div>
                    <h3 class="text-base font-semibold text-gray-800 mb-2">Free Parking</h3>
                    <p class="text-sm text-gray-600">Safe parking for residents</p>
                </div>

                <div class="text-center">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-users text-2xl text-blue-600"></i>
                    </div>
                    <h3 class="text-base font-semibold text-gray-800 mb-2">Community</h3>
                    <p class="text-sm text-gray-600">Friendly, supportive environment</p>
                </div>

            </div>

        </div>
    </section>

    @include('components.footer') 
    @include('components.booking-modal')

<!-- SCRIPT SUDAH DIPINDAH KE booking-modal.blade.php -->

</body>
</html>