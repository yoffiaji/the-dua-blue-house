// public/js/dashboard/core.js
// Fungsi-fungsi core / umum yang dipakai di seluruh dashboard

// Ambil CSRF token dan role dari DOM
export const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Deteksi role dari teks di header (Admin Dashboard / User Dashboard)
const roleText = document.querySelector('#userRole')?.textContent.trim() || '';
export const currentRole = roleText.toLowerCase().includes('admin') ? 'admin' : 'user';

// ID kamar yang dipilih untuk booking
let selectedRoomId = null;

// ==================== MODAL HELPER FUNCTIONS ====================
export function showModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function hideModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

export function showLoading() {
    const loading = document.getElementById('loadingModal');
    loading.classList.remove('hidden');
    loading.classList.add('flex');
}

export function hideLoading() {
    const loading = document.getElementById('loadingModal');
    loading.classList.add('hidden');
    loading.classList.remove('flex');
}

export function showSuccessModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full animate-fadeIn">
            <div class="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                <i class="fas fa-check text-green-600 text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-center mb-2">${title}</h3>
            <p class="text-gray-600 text-center mb-6">${message}</p>
            <button onclick="this.closest('.fixed').remove()" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                OK
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

export function showErrorModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full animate-fadeIn">
            <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <i class="fas fa-times text-red-600 text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-center mb-2">${title}</h3>
            <p class="text-gray-600 text-center mb-6">${message}</p>
            <button onclick="this.closest('.fixed').remove()" class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                OK
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Tambahan: Fungsi closeModal global
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
}

// Expose closeModal ke window agar bisa dipanggil dari onclick
window.closeModal = closeModal;

// ==================== BOOKING FLOW (User Only) ====================
export function initBookingFlow() {
    document.addEventListener('click', function (e) {
        // Tombol Book Now
        if (e.target.classList.contains('btn-book')) {
            selectedRoomId = e.target.dataset.room;
            showModal();
        }

        // Cancel booking
        if (e.target.id === 'cancelBooking') {
            hideModal();
        }

        // Confirm booking → create booking → snap token → midtrans
        if (e.target.id === 'confirmBooking') {
            hideModal();
            showLoading();

            fetch("/api/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken
                },
                body: JSON.stringify({ room_id: selectedRoomId })
            })
            .then(res => res.json())
            .then(data => {
                if (!data.success) throw new Error(data.message || 'Gagal membuat booking');
                return fetch("/api/bookings/snap", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken
                    },
                    body: JSON.stringify({ booking_id: data.data.id })
                });
            })
            .then(res => res.json())
            .then(data => {
                hideLoading();
                if (!data.success) throw new Error("Failed to get Snap Token");

                snap.pay(data.snap_token, {
                    onSuccess: () => {
                        showSuccessModal("Payment Success", "Your booking has been confirmed!");
                        setTimeout(() => location.reload(), 2000);
                    },
                    onPending: () => {
                        showSuccessModal("Payment Pending", "Waiting for your payment.");
                        setTimeout(() => location.reload(), 2000);
                    },
                    onError: () => showErrorModal("Payment Failed", "There was an error processing your payment."),
                    onClose: () => console.log('Payment popup closed')
                });
            })
            .catch(err => {
                hideLoading();
                showErrorModal("Error", err.message || "Something went wrong");
            });
        }
    });
}

// ==================== ROOM CARD RENDER (digunakan user & mungkin admin) ====================
export function renderRoomCard(room) {
    const isAvailable = room.status === 'Available';
    return `
        <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition flex flex-col">
            <img src="${room.photo ? '/img/rooms/' + room.photo : '/img/default-room.jpg'}"
                alt="${room.name}"
                class="w-full h-56 object-cover">
            <div class="p-6 flex flex-col grow">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-semibold text-gray-800">${room.name}</h3>
                    <span class="px-2 py-1 ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full text-xs font-medium">
                        ${isAvailable ? 'Available' : 'Reserved'}
                    </span>
                </div>
                <p class="text-gray-600 text-sm mb-6 grow leading-relaxed line-clamp-2">
                    ${room.description || 'No description available'}
                </p>
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <span class="text-2xl font-bold text-blue-600">
                            Rp ${Number(room.price).toLocaleString('id-ID')}
                        </span>
                        <span class="text-gray-500 text-sm">/month</span>
                    </div>
                    ${isAvailable ? `
                        <button class="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition btn-book"
                                data-room="${room.id}">
                            Book Now
                        </button>
                    ` : `
                        <button class="px-4 py-2 bg-gray-300 text-gray-600 rounded text-sm cursor-not-allowed">
                            Not Available
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}