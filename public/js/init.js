// public/js/dashboard/init.js
// Inisialisasi utama dashboard

import { currentRole, csrfToken, initBookingFlow } from './core.js';
import { 
    renderAvailableRooms,
    renderMyBookings,
    renderPaymentHistory,
    renderProfile,
    renderUserDashboard
} from './user.js';
import { 
    renderAdminDashboard,
    renderRooms,
    renderBookings,
    renderResidents,
    renderUsers
} from './admin.js';

// Fungsi global untuk navigasi (dipanggil dari menu)
window.showPage = function (pageName) {
    // Update active menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('bg-blue-50', 'text-blue-600', 'font-medium');
        item.classList.add('text-gray-600', 'hover:bg-gray-50');
    });
    const activeItem = document.querySelector(`[data-page="${pageName}"]`);
    if (activeItem) {
        activeItem.classList.add('bg-blue-50', 'text-blue-600', 'font-medium');
        activeItem.classList.remove('text-gray-600', 'hover:bg-gray-50');
    }

    const container = document.getElementById('mainContent');
    container.innerHTML = '<div class="flex justify-center items-center py-12"><div class="loader"></div></div>';

    // Routing berdasarkan role
    if (currentRole === 'admin') {
        if (pageName === 'dashboard') {
            renderAdminDashboard(container);
        } else if (pageName === 'rooms') {
            fetch('/api/rooms', { headers: { 'X-CSRF-TOKEN': csrfToken } })
                .then(res => res.json())
                .then(data => renderRooms(data, container));
        } else if (pageName === 'bookings') {
            fetch('/api/bookings', { headers: { 'X-CSRF-TOKEN': csrfToken } })
                .then(res => res.json())
                .then(data => renderBookings(data, container));
        } else if (pageName === 'residents') {
            fetch('/api/residents', { headers: { 'X-CSRF-TOKEN': csrfToken } })
                .then(res => res.json())
                .then(data => renderResidents(data, container));
        } else if (pageName === 'users') {
            fetch('/api/users', { headers: { 'X-CSRF-TOKEN': csrfToken } })
                .then(res => res.json())
                .then(data => renderUsers(data, container));
        }
    } else {
        // User pages
        if (pageName === 'user-dashboard') {
            fetch('/api/my-bookings', { headers: { 'X-CSRF-TOKEN': csrfToken } })
                .then(res => res.json())
                .then(bookings => renderUserDashboard(bookings[0] || null, container));
        } else if (pageName === 'available-rooms') {
            fetch('/api/available-rooms', { headers: { 'X-CSRF-TOKEN': csrfToken } })
                .then(res => res.json())
                .then(rooms => renderAvailableRooms(rooms, container));
        } else if (pageName === 'my-bookings') {
            fetch('/api/my-bookings', { headers: { 'X-CSRF-TOKEN': csrfToken } })
                .then(res => res.json())
                .then(bookings => renderMyBookings(bookings, container));
        } else if (pageName === 'payment-history') {
            fetch('/api/payment-history', { headers: { 'X-CSRF-TOKEN': csrfToken } })
                .then(res => res.json())
                .then(data => renderPaymentHistory(data, container));
        } else if (pageName === 'profile') {
            fetch('/api/profile', { headers: { 'X-CSRF-TOKEN': csrfToken } })
                .then(res => res.json())
                .then(data => renderProfile(data.data, container));
        }
    }
};

// Inisialisasi saat DOM loaded
export function initDashboard() {
    // Setup menu click
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function () {
            const page = this.getAttribute('data-page');
            window.showPage(page);
        });
    });

    // Init booking flow (hanya untuk user)
    if (currentRole !== 'admin') {
        initBookingFlow();
    }

    // Load halaman default
    const defaultPage = currentRole === 'admin' ? 'dashboard' : 'user-dashboard';
    window.showPage(defaultPage);
}