// public/js/dashboard/admin.js
// Fungsi-fungsi khusus untuk Admin Dashboard

import { csrfToken, showLoading, hideLoading, showSuccessModal, showErrorModal, closeModal } from './core.js';

// ==================== ADMIN DASHBOARD STATISTICS ====================
export function renderAdminDashboard(container) {
    showLoading();
    fetch('/api/dashboard/statistics', {
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        }
    })
    .then(res => res.json())
    .then(stats => {
        hideLoading();
        container.innerHTML = `
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
                <p class="text-gray-600">Monitor your boarding house performance</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-sm p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Total Rooms</p>
                            <p class="text-3xl font-bold text-gray-800">${stats.total_rooms || 0}</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-door-open text-2xl text-blue-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Occupied</p>
                            <p class="text-3xl font-bold text-gray-800">${stats.occupied_rooms || 0}</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-check-circle text-2xl text-green-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Available</p>
                            <p class="text-3xl font-bold text-gray-800">${stats.available_rooms || 0}</p>
                        </div>
                        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-door-closed text-2xl text-yellow-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                            <p class="text-2xl font-bold text-green-600">Rp ${Number(stats.monthly_revenue || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-money-bill-wave text-2xl text-green-600"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .catch(err => {
        hideLoading();
        console.error(err);
        container.innerHTML = '<div class="text-center py-12 text-red-600">Error loading dashboard data</div>';
    });
}

// ==================== MANAJEMEN KAMAR ====================
export function renderRooms(rooms, container) {
    let html = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">Manajemen Kamar</h1>
            <button onclick="window.showAddRoomModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <i class="fas fa-plus mr-2"></i>Tambah Kamar
            </button>
        </div>
    `;

    html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">';

    rooms.forEach(room => {
        const statusClass = room.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        html += `
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <img src="/img/rooms/${room.photo}" class="w-full h-48 object-cover" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                <div class="p-5">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-lg font-semibold text-gray-800">${room.name}</h3>
                        <span class="px-2 py-1 ${statusClass} rounded-full text-xs">${room.status}</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">Tipe: ${room.room_type}</p>
                    <p class="text-sm text-gray-600 mb-2">Kapasitas: ${room.capacity} orang</p>
                    <p class="text-sm text-gray-600 mb-4">${room.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-xl font-bold text-blue-600">Rp ${Number(room.price).toLocaleString('id-ID')}</span>
                        <div class="space-x-2">
                            <button onclick="window.editRoom(${room.id})" class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="window.deleteRoom(${room.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// ==================== MANAJEMEN BOOKING ====================
export function renderBookings(bookings, container) {
    let html = '<h1 class="text-3xl font-bold text-gray-800 mb-6">Manajemen Booking</h1>';

    if (bookings.length === 0) {
        html += `
            <div class="bg-white p-8 rounded-lg shadow text-center">
                <p class="text-gray-600">Belum ada booking.</p>
            </div>
        `;
        container.innerHTML = html;
        return;
    }

    html += '<div class="bg-white rounded-lg shadow-sm overflow-hidden">';
    html += `
        <table class="w-full text-sm">
            <thead class="bg-gray-100">
                <tr>
                    <th class="p-3 text-left">ID</th>
                    <th class="p-3 text-left">User</th>
                    <th class="p-3 text-left">Kamar</th>
                    <th class="p-3 text-left">Status</th>
                    <th class="p-3 text-left">Tanggal</th>
                    <th class="p-3 text-left">Aksi</th>
                </tr>
            </thead>
            <tbody>
    `;

    bookings.forEach(booking => {
        let statusClass = 'bg-yellow-100 text-yellow-800';
        if (booking.status === 'disetujui') statusClass = 'bg-green-100 text-green-800';
        else if (booking.status === 'ditolak') statusClass = 'bg-red-100 text-red-800';
        else if (booking.status === 'menunggu_verifikasi') statusClass = 'bg-blue-100 text-blue-800';

        html += `
            <tr class="border-t hover:bg-gray-50">
                <td class="p-3">#B${String(booking.id).padStart(3, '0')}</td>
                <td class="p-3">
                    <div class="flex items-center space-x-2">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(booking.user.name)}&background=random" class="w-8 h-8 rounded-full">
                        <span>${booking.user.name}</span>
                    </div>
                </td>
                <td class="p-3">${booking.room.name}</td>
                <td class="p-3">
                    <span class="px-2 py-1 rounded-full text-xs ${statusClass}">
                        ${booking.status.replace('_', ' ')}
                    </span>
                </td>
                <td class="p-3">${new Date(booking.created_at).toLocaleDateString('id-ID')}</td>
                <td class="p-3">
                    <button onclick="window.viewBookingDetail(${booking.id})" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">
                        Detail
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ==================== MANAJEMEN PENGHUNI ====================
export function renderResidents(residents, container) {
    let html = '<h1 class="text-3xl font-bold text-gray-800 mb-6">Manajemen Penghuni</h1>';

    if (residents.length === 0) {
        html += `
            <div class="bg-white p-8 rounded-lg shadow text-center">
                <p class="text-gray-600">Belum ada penghuni aktif.</p>
            </div>
        `;
        container.innerHTML = html;
        return;
    }

    html += '<div class="bg-white rounded-lg shadow-sm overflow-hidden">';
    html += `
        <table class="w-full text-sm">
            <thead class="bg-gray-100">
                <tr>
                    <th class="p-3 text-left">Penghuni</th>
                    <th class="p-3 text-left">Kamar</th>
                    <th class="p-3 text-left">Tipe</th>
                    <th class="p-3 text-left">Harga/Bulan</th>
                    <th class="p-3 text-left">Sejak</th>
                    <th class="p-3 text-left">Aksi</th>
                </tr>
            </thead>
            <tbody>
    `;

    residents.forEach(resident => {
        html += `
            <tr class="border-t hover:bg-gray-50">
                <td class="p-3">
                    <div class="flex items-center space-x-2">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(resident.user.name)}&background=random" class="w-10 h-10 rounded-full">
                        <div>
                            <p class="font-medium">${resident.user.name}</p>
                            <p class="text-xs text-gray-500">${resident.user.email}</p>
                        </div>
                    </div>
                </td>
                <td class="p-3">${resident.room.name}</td>
                <td class="p-3">${resident.room.room_type}</td>
                <td class="p-3">Rp ${Number(resident.room.price).toLocaleString('id-ID')}</td>
                <td class="p-3">${new Date(resident.created_at).toLocaleDateString('id-ID')}</td>
                <td class="p-3">
                    <button onclick="window.viewResidentDetail(${resident.id})" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">
                        Detail
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ==================== MANAJEMEN USER ====================
export function renderUsers(users, container) {
    let html = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">Manajemen User</h1>
        </div>
    `;

    html += '<div class="bg-white rounded-lg shadow-sm overflow-hidden">';
    html += `
        <table class="w-full text-sm">
            <thead class="bg-gray-100">
                <tr>
                    <th class="p-3 text-left">Nama</th>
                    <th class="p-3 text-left">Email</th>
                    <th class="p-3 text-left">Role</th>
                    <th class="p-3 text-left">Total Booking</th>
                    <th class="p-3 text-left">Terdaftar</th>
                    <th class="p-3 text-left">Aksi</th>
                </tr>
            </thead>
            <tbody>
    `;

    users.forEach(user => {
        const roleClass = user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
        html += `
            <tr class="border-t hover:bg-gray-50">
                <td class="p-3">
                    <div class="flex items-center space-x-2">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random" class="w-10 h-10 rounded-full">
                        <span class="font-medium">${user.name}</span>
                    </div>
                </td>
                <td class="p-3">${user.email}</td>
                <td class="p-3">
                    <span class="px-2 py-1 rounded-full text-xs ${roleClass}">
                        ${user.role}
                    </span>
                </td>
                <td class="p-3">${user.bookings_count || 0}</td>
                <td class="p-3">${new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                <td class="p-3">
                    <button onclick="window.viewUserDetail(${user.id})" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">
                        Detail
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ==================== MODAL FUNCTIONS ====================
// (Hapus closeModal lokal, karena sekarang dari core.js)

// Add Room Modal (from original code)
window.showAddRoomModal = function () {
    const modalHTML = `
        <div id="addRoomModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">Tambah Kamar Baru</h3>
                    <button onclick="closeModal('addRoomModal')" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="addRoomForm" enctype="multipart/form-data">
                    <div class="space-y-4">
                        <div>
                            <label class="form-label">Nama Kamar</label>
                            <input type="text" name="name" required class="form-input" placeholder="Contoh: Kamar A1">
                        </div>
                        <div>
                            <label class="form-label">Tipe Kamar</label>
                            <select name="room_type" required class="form-input">
                                <option value="">Pilih Tipe</option>
                                <option value="Premium">Premium</option>
                                <option value="Reguler">Reguler</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Harga per Bulan (Rp)</label>
                            <input type="number" name="price" required class="form-input" placeholder="3000000">
                        </div>
                        <div>
                            <label class="form-label">Kapasitas</label>
                            <input type="number" name="capacity" required class="form-input" placeholder="1" min="1">
                        </div>
                        <div>
                            <label class="form-label">Status</label>
                            <select name="status" required class="form-input">
                                <option value="Available">Available</option>
                                <option value="Reserved">Reserved</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Deskripsi</label>
                            <textarea name="description" required class="form-input" rows="3" placeholder="Deskripsi kamar..."></textarea>
                        </div>
                        <div>
                            <label class="form-label">Foto Kamar</label>
                            <input type="file" name="photo" accept="image/*" required class="form-input">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button type="button" onclick="closeModal('addRoomModal')" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Batal
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('addRoomForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        showLoading();
        
        fetch('/api/rooms', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrfToken },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                showSuccessModal('Success', 'Kamar berhasil ditambahkan!');
                closeModal('addRoomModal');
                window.showPage('rooms');
            } else {
                showErrorModal('Error', data.message || 'Gagal menambahkan kamar');
            }
        })
        .catch(err => {
            hideLoading();
            showErrorModal('Error', 'Terjadi kesalahan: ' + err.message);
        });
    });
};

// Edit Room Modal
window.editRoom = function (id) {
    fetch('/api/rooms', { headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' } })
    .then(res => res.json())
    .then(rooms => {
        const room = rooms.find(r => r.id === id);
        if (!room) {
            showErrorModal('Error', 'Kamar tidak ditemukan');
            return;
        }

        const modalHTML = `
            <div id="editRoomModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">Edit Kamar: ${room.name}</h3>
                        <button onclick="closeModal('editRoomModal')" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <form id="editRoomForm" enctype="multipart/form-data">
                        <div class="space-y-4">
                            <div>
                                <label class="form-label">Nama Kamar</label>
                                <input type="text" name="name" value="${room.name}" required class="form-input">
                            </div>
                            <div>
                                <label class="form-label">Tipe Kamar</label>
                                <select name="room_type" required class="form-input">
                                    <option value="Premium" ${room.room_type === 'Premium' ? 'selected' : ''}>Premium</option>
                                    <option value="Reguler" ${room.room_type === 'Reguler' ? 'selected' : ''}>Reguler</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Harga per Bulan (Rp)</label>
                                <input type="number" name="price" value="${room.price}" required class="form-input">
                            </div>
                            <div>
                                <label class="form-label">Kapasitas</label>
                                <input type="number" name="capacity" value="${room.capacity}" required min="1" class="form-input">
                            </div>
                            <div>
                                <label class="form-label">Status</label>
                                <select name="status" required class="form-input">
                                    <option value="Available" ${room.status === 'Available' ? 'selected' : ''}>Available</option>
                                    <option value="Reserved" ${room.status === 'Reserved' ? 'selected' : ''}>Reserved</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Deskripsi</label>
                                <textarea name="description" required class="form-input" rows="3">${room.description}</textarea>
                            </div>
                            <div>
                                <label class="form-label">Foto Kamar (kosongkan jika tidak diganti)</label>
                                <input type="file" name="photo" accept="image/*" class="form-input">
                                ${room.photo ? `<p class="text-xs text-gray-500 mt-1">Foto saat ini: ${room.photo}</p>` : ''}
                            </div>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="closeModal('editRoomModal')" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Batal
                            </button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('editRoomForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            formData.append('_method', 'PUT');
            showLoading();

            fetch(`/api/rooms/${id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                hideLoading();
                if (data.success) {
                    showSuccessModal('Success', 'Kamar berhasil diupdate!');
                    closeModal('editRoomModal');
                    window.showPage('rooms');
                } else {
                    showErrorModal('Error', data.message || 'Gagal update kamar');
                }
            })
            .catch(err => {
                hideLoading();
                showErrorModal('Error', 'Terjadi kesalahan: ' + err.message);
            });
        });
    });
};

// Delete Room
window.deleteRoom = function (id) {
    if (!confirm('Apakah Anda yakin ingin menghapus kamar ini?')) return;
    showLoading();
    fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
    .then(res => res.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showSuccessModal('Success', 'Kamar berhasil dihapus!');
            window.showPage('rooms');
        } else {
            showErrorModal('Error', data.message || 'Gagal menghapus');
        }
    })
    .catch(err => {
        hideLoading();
        showErrorModal('Error', 'Terjadi kesalahan: ' + err.message);
    });
};

// View Booking Detail
window.viewBookingDetail = function (id) {
    fetch('/api/bookings', {
        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' }
    })
    .then(res => res.json())
    .then(bookings => {
        const booking = bookings.find(b => b.id === id);
        if (!booking) {
            showErrorModal('Error', 'Booking tidak ditemukan');
            return;
        }

        const statusClass = {
            'menunggu_pembayaran': 'bg-yellow-100 text-yellow-800',
            'menunggu_verifikasi': 'bg-blue-100 text-blue-800',
            'disetujui': 'bg-green-100 text-green-800',
            'ditolak': 'bg-red-100 text-red-800'
        };

        const modalHTML = `
            <div id="bookingDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">Detail Booking #${booking.id}</h3>
                        <button onclick="closeModal('bookingDetailModal')" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-2">Informasi Pengguna</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div>Nama:</div>
                                <div class="font-medium">${booking.user.name}</div>
                                <div>Email:</div>
                                <div class="font-medium">${booking.user.email}</div>
                                <div>No. HP:</div>
                                <div class="font-medium">${booking.user.phone || '-'}</div>
                            </div>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-2">Informasi Kamar</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div>Kamar:</div>
                                <div class="font-medium">${booking.room.name}</div>
                                <div>Tipe:</div>
                                <div class="font-medium">${booking.room.room_type}</div>
                                <div>Harga:</div>
                                <div class="font-medium">Rp ${Number(booking.room.price).toLocaleString('id-ID')}</div>
                            </div>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-2">Status Booking</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div>Status:</div>
                                <div>
                                    <span class="px-2 py-1 rounded-full text-xs ${statusClass[booking.status] || 'bg-gray-100 text-gray-800'}">
                                        ${booking.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div>Tanggal Booking:</div>
                                <div class="font-medium">${new Date(booking.created_at).toLocaleString('id-ID')}</div>
                            </div>
                        </div>
                        ${booking.payment ? `
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-2">Informasi Pembayaran</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div>Status Payment:</div>
                                <div class="font-medium">${booking.payment.status}</div>
                                <div>Jumlah:</div>
                                <div class="font-medium">Rp ${Number(booking.payment.amount).toLocaleString('id-ID')}</div>
                                ${booking.payment.midtrans_transaction_id ? `
                                <div>Transaction ID:</div>
                                <div class="font-medium text-xs">${booking.payment.midtrans_transaction_id}</div>
                                ` : ''}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="flex justify-end mt-6">
                        <button onclick="closeModal('bookingDetailModal')" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    });
};

// View Resident Detail
window.viewResidentDetail = function (bookingId) {
    fetch('/api/residents', {
        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' }
    })
    .then(res => res.json())
    .then(residents => {
        const resident = residents.find(r => r.id === bookingId);
        if (!resident) {
            showErrorModal('Error', 'Data penghuni tidak ditemukan');
            return;
        }

        const modalHTML = `
            <div id="residentDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">Detail Penghuni</h3>
                        <button onclick="closeModal('residentDetailModal')" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div class="flex items-center space-x-4 mb-4">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(resident.user.name)}&background=random&size=100" class="w-20 h-20 rounded-full">
                            <div>
                                <h4 class="text-xl font-semibold">${resident.user.name}</h4>
                                <p class="text-gray-600">${resident.user.email}</p>
                            </div>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-2">Informasi Pribadi</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div>No. HP:</div>
                                <div class="font-medium">${resident.user.phone || '-'}</div>
                                <div>Alamat:</div>
                                <div class="font-medium">${resident.user.address || '-'}</div>
                                <div>Tanggal Lahir:</div>
                                <div class="font-medium">${resident.user.birth_date ? new Date(resident.user.birth_date).toLocaleDateString('id-ID') : '-'}</div>
                            </div>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-2">Informasi Kamar</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div>Kamar:</div>
                                <div class="font-medium">${resident.room.name}</div>
                                <div>Tipe:</div>
                                <div class="font-medium">${resident.room.room_type}</div>
                                <div>Harga/Bulan:</div>
                                <div class="font-medium">Rp ${Number(resident.room.price).toLocaleString('id-ID')}</div>
                                <div>Menghuni Sejak:</div>
                                <div class="font-medium">${new Date(resident.created_at).toLocaleDateString('id-ID')}</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end mt-6">
                        <button onclick="closeModal('residentDetailModal')" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    });
};

// View User Detail (with edit, verify KTP, delete)
window.viewUserDetail = function (userId) {
    fetch(`/api/users/${userId}`, {
        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' }
    })
    .then(res => res.json())
    .then(response => {
        if (!response.success) {
            showErrorModal('Error', 'Gagal memuat data user');
            return;
        }

        const user = response.data;

        const modalHTML = `
            <div id="userDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h2 class="text-2xl font-bold text-gray-800">Detail User</h2>
                            <button onclick="closeModal('userDetailModal')" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                    </div>
                    <div class="p-6 space-y-6">
                        <div class="flex items-center space-x-4 mb-4">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=100" class="w-20 h-20 rounded-full">
                            <div>
                                <h4 class="text-xl font-semibold">${user.name}</h4>
                                <p class="text-gray-600">${user.email}</p>
                            </div>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-2">Informasi Pribadi</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div>No. HP:</div>
                                <div class="font-medium">${user.phone || '-'}</div>
                                <div>Alamat:</div>
                                <div class="font-medium">${user.address || '-'}</div>
                                <div>Tanggal Lahir:</div>
                                <div class="font-medium">${user.birth_date ? new Date(user.birth_date).toLocaleDateString('id-ID') : '-'}</div>
                                <div>Role:</div>
                                <div class="font-medium capitalize">${user.role}</div>
                                <div>Terdaftar:</div>
                                <div class="font-medium">${new Date(user.created_at).toLocaleDateString('id-ID')}</div>
                            </div>
                            <div class="mt-4 flex justify-end">
                                <button onclick="window.editUserInfo(${user.id})" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                    Edit Informasi
                                </button>
                            </div>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-2">Verifikasi KTP</h4>
                            ${user.ktp_file ? `
                                <div class="mb-4">
                                    <img src="/storage/${user.ktp_file}" alt="KTP" class="w-full rounded border mb-2">
                                    <span class="text-sm ${user.ktp_verified ? 'text-green-600' : 'text-yellow-600'}">
                                        <i class="fas ${user.ktp_verified ? 'fa-check-circle' : 'fa-clock'} mr-1"></i>
                                        ${user.ktp_verified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                                    </span>
                                </div>
                                <div class="flex space-x-2">
                                    <button onclick="window.verifyUserKTP(${user.id}, 'approve')" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                        Acc KTP
                                    </button>
                                    <button onclick="window.verifyUserKTP(${user.id}, 'reject')" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                        Tolak KTP
                                    </button>
                                </div>
                            ` : '<p class="text-sm text-gray-600">Belum upload KTP</p>'}
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-2">Riwayat Booking</h4>
                            ${user.bookings && user.bookings.length > 0 ? `
                                <ul class="space-y-2">
                                    ${user.bookings.map(booking => `
                                        <li class="bg-white p-2 rounded shadow-sm">
                                            Booking #${booking.id} - Status: ${booking.status}
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : '<p class="text-sm text-gray-600">Tidak ada riwayat booking</p>'}
                        </div>
                        <div class="flex justify-between mt-6">
                            <button onclick="window.resetUserPassword(${user.id})" class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                                Reset Password
                            </button>
                            <button onclick="window.deleteUser(${user.id})" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Hapus User
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    })
    .catch(err => {
        showErrorModal('Error', 'Terjadi kesalahan: ' + err.message);
    });
};

// Edit User Info Modal
window.editUserInfo = function (userId) {
    closeModal('userDetailModal'); // Tutup detail dulu
    fetch(`/api/users/${userId}`, {
        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' }
    })
    .then(res => res.json())
    .then(response => {
        if (!response.success) {
            showErrorModal('Error', 'Gagal memuat data user');
            return;
        }

        const user = response.data;

        const modalHTML = `
            <div id="editUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">Edit Data User</h3>
                        <button onclick="closeModal('editUserModal')" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <form id="editUserForm">
                        <div class="space-y-4">
                            <div>
                                <label class="form-label">Nama</label>
                                <input type="text" name="name" value="${user.name}" required class="form-input">
                            </div>
                            <div>
                                <label class="form-label">Email</label>
                                <input type="email" name="email" value="${user.email}" required class="form-input">
                            </div>
                            <div>
                                <label class="form-label">Telepon</label>
                                <input type="text" name="phone" value="${user.phone || ''}" class="form-input">
                            </div>
                            <div>
                                <label class="form-label">Alamat</label>
                                <textarea name="address" class="form-input" rows="3">${user.address || ''}</textarea>
                            </div>
                            <div>
                                <label class="form-label">Tanggal Lahir</label>
                                <input type="date" name="birth_date" value="${user.birth_date || ''}" class="form-input">
                            </div>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="closeModal('editUserModal')" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Batal
                            </button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('editUserForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            showLoading();

            fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(result => {
                hideLoading();
                if (result.success) {
                    showSuccessModal('Success', 'Data user berhasil diperbarui!');
                    closeModal('editUserModal');
                    window.viewUserDetail(userId); // Refresh detail modal
                } else {
                    showErrorModal('Error', result.message || 'Gagal memperbarui data');
                }
            })
            .catch(err => {
                hideLoading();
                showErrorModal('Error', 'Terjadi kesalahan: ' + err.message);
            });
        });
    });
};

// Verify User KTP
window.verifyUserKTP = function (userId, action) {
    if (!confirm(`Apakah Anda yakin ingin ${action === 'approve' ? 'acc' : 'tolak'} KTP ini?`)) return;
    showLoading();

    fetch(`/api/users/${userId}/verify-ktp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        },
        body: JSON.stringify({ action })
    })
    .then(res => res.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showSuccessModal('Success', data.message);
            closeModal('userDetailModal');
            window.viewUserDetail(userId); // Refresh
        } else {
            showErrorModal('Error', data.message || 'Gagal verifikasi');
        }
    })
    .catch(err => {
        hideLoading();
        showErrorModal('Error', 'Terjadi kesalahan: ' + err.message);
    });
};

// Reset User Password
window.resetUserPassword = function (userId) {
    const modalHTML = `
        <div id="resetPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">Reset Password</h3>
                    <button onclick="closeModal('resetPasswordModal')" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="resetPasswordForm">
                    <div class="space-y-4">
                        <div>
                            <label class="form-label">Password Baru</label>
                            <input type="password" name="new_password" required minlength="8" class="form-input">
                        </div>
                        <div>
                            <label class="form-label">Konfirmasi Password</label>
                            <input type="password" name="new_password_confirmation" required minlength="8" class="form-input">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button type="button" onclick="closeModal('resetPasswordModal')" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Batal
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('resetPasswordForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        if (data.new_password !== data.new_password_confirmation) {
            showErrorModal('Error', 'Password tidak cocok');
            return;
        }
        showLoading();

        fetch(`/api/users/${userId}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(result => {
            hideLoading();
            if (result.success) {
                showSuccessModal('Success', result.message);
                closeModal('resetPasswordModal');
            } else {
                showErrorModal('Error', result.message || 'Gagal reset password');
            }
        })
        .catch(err => {
            hideLoading();
            showErrorModal('Error', 'Terjadi kesalahan: ' + err.message);
        });
    });
};

// Delete User
window.deleteUser = function (userId) {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    showLoading();

    fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    })
    .then(res => res.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showSuccessModal('Success', 'User berhasil dihapus!');
            closeModal('userDetailModal');
            window.showPage('users');
        } else {
            showErrorModal('Error', data.message || 'Gagal menghapus user');
        }
    })
    .catch(err => {
        hideLoading();
        showErrorModal('Error', 'Terjadi kesalahan: ' + err.message);
    });
};