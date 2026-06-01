<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Rooms - The Dua Blue House</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body class="bg-gray-50">

@include('components.navbar')

    <!-- Header -->
    <section class="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16">
        <div class="container mx-auto px-12 text-center">
            <h1 class="text-3xl md:text-4xl font-bold mb-3">Our Rooms</h1>
            <p class="text-base text-blue-50">Browse all available rooms and find your perfect space</p>
        </div>
    </section>

    <!-- Rooms -->
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

    <!-- CTA -->
    <section class="py-16 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center">
        <div class="container mx-auto px-12">
            <h2 class="text-2xl font-bold mb-3">Can't Find What You're Looking For?</h2>
            <p class="text-base text-blue-50 mb-6">Contact us and we'll help you find the perfect room</p>
            <button class="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition">
                Contact Us
            </button>
        </div>
    </section>

    @include('components.footer')   
    @include('components.booking-modal')

<!-- SCRIPT SUDAH DIPINDAH KE booking-modal.blade.php -->

</body>
</html>