<!-- Navbar -->
    <nav class="bg-white shadow-sm">
        <div class="container mx-auto px-12 py-4">
            <div class="flex items-center justify-between">

                <div class="flex items-center space-x-2 ml-4">
                    <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <i class="fas fa-home text-white text-sm"></i>
                    </div>
                    <span class="text-lg font-semibold text-gray-800">The Dua Blue House</span>
                </div>

                <div class="hidden md:flex items-center space-x-8">
                    <a href="/" class="text-gray-600 hover:text-gray-900">Home</a>
                    <a href="/rooms" class="text-gray-600 hover:text-gray-900">Rooms</a>
                    <a href="#" class="text-gray-600 hover:text-gray-900">About</a>
                    <a href="#" class="text-gray-600 hover:text-gray-900">Contact</a>
                </div>

                <div class="flex items-center space-x-3 mr-4">
                    @guest
                        <a href="/login" class="px-4 py-2 text-gray-600 hover:text-gray-900">Login</a>
                        <a href="/register" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Register</a>
                    @endguest

                    @auth
                        <a href="/dashboard" class="px-4 py-2 text-gray-600 hover:text-gray-900">Dashboard</a>
                        <form method="POST" action="/logout" class="inline">
                            @csrf
                            <button type="submit" class="px-4 py-2 text-gray-600 hover:text-gray-900">Logout</button>
                        </form>
                    @endauth
                </div>

            </div>
        </div>
    </nav>