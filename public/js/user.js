// public/js/dashboard/user.js
// Fungsi-fungsi khusus untuk User Dashboard

import {
    csrfToken,
    showLoading,
    hideLoading,
    showSuccessModal,
    showErrorModal,
    renderRoomCard
} from './core.js';

// ==================== RENDER AVAILABLE ROOMS ====================
export function renderAvailableRooms(rooms, container) {
    if (!rooms || rooms.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-[500px] px-4">
                <div class="w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <i class="fas fa-door-open text-5xl text-gray-400"></i>
                </div>
                <h3 class="text-2xl font-semibold text-gray-800 mb-2">No Available Rooms</h3>
                <p class="text-gray-500 text-center max-w-md">There are currently no rooms available. Please check back later or contact our support team.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="mb-10">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Available Rooms</h2>
                    <p class="text-gray-600 mt-1">Discover your perfect living space</p>
                </div>
                <div class="flex items-center space-x-2 text-sm text-gray-500">
                    <i class="fas fa-check-circle text-green-500"></i>
                    <span>${rooms.length} room${rooms.length > 1 ? 's' : ''} available</span>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${rooms.map(room => renderRoomCard(room)).join('')}
        </div>
    `;
}

// ==================== RENDER MY BOOKINGS ====================
export function renderMyBookings(bookings, container) {
    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div class="mb-10">
                <h2 class="text-3xl font-bold text-gray-900 tracking-tight mb-2">My Bookings</h2>
                <p class="text-gray-600">Manage your room reservations</p>
            </div>
            <div class="flex flex-col items-center justify-center min-h-[450px] px-4">
                <div class="w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <i class="fas fa-calendar-times text-5xl text-blue-400"></i>
                </div>
                <h3 class="text-2xl font-semibold text-gray-800 mb-2">No Bookings Yet</h3>
                <p class="text-gray-500 text-center max-w-md mb-8">You haven't made any bookings. Start exploring available rooms to find your ideal space.</p>
                <button onclick="showPage('available-rooms')" class="inline-flex items-center px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    <i class="fas fa-search mr-2"></i>
                    Browse Available Rooms
                </button>
            </div>
        `;
        return;
    }

    const statusStyles = {
        'menunggu_pembayaran': { 
            bg: 'bg-amber-50', 
            text: 'text-amber-700', 
            border: 'border-amber-200',
            icon: 'fa-clock',
            badge: 'bg-amber-100 text-amber-800'
        },
        'menunggu_verifikasi': { 
            bg: 'bg-blue-50', 
            text: 'text-blue-700', 
            border: 'border-blue-200',
            icon: 'fa-hourglass-half',
            badge: 'bg-blue-100 text-blue-800'
        },
        'disetujui': { 
            bg: 'bg-emerald-50', 
            text: 'text-emerald-700', 
            border: 'border-emerald-200',
            icon: 'fa-check-circle',
            badge: 'bg-emerald-100 text-emerald-800'
        },
        'ditolak': { 
            bg: 'bg-rose-50', 
            text: 'text-rose-700', 
            border: 'border-rose-200',
            icon: 'fa-times-circle',
            badge: 'bg-rose-100 text-rose-800'
        }
    };

    container.innerHTML = `
        <div class="mb-10">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 tracking-tight">My Bookings</h2>
                    <p class="text-gray-600 mt-1">View and manage your reservations</p>
                </div>
                <div class="text-sm text-gray-500">
                    ${bookings.length} total booking${bookings.length > 1 ? 's' : ''}
                </div>
            </div>
        </div>
        <div class="space-y-6">
            ${bookings.map(booking => {
                const status = statusStyles[booking.status] || statusStyles['menunggu_pembayaran'];
                return `
                    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div class="p-8">
                            <div class="flex items-start justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-semibold text-gray-900 mb-1">${booking.room ? booking.room.name : 'N/A'}</h3>
                                    <p class="text-sm text-gray-500">Booking ID: #${String(booking.id).padStart(4, '0')}</p>
                                </div>
                                <span class="inline-flex items-center px-4 py-2 ${status.badge} rounded-full text-xs font-semibold tracking-wide">
                                    <i class="fas ${status.icon} mr-2"></i>
                                    ${booking.status.replace(/_/g, ' ').toUpperCase()}
                                </span>
                            </div>
                            
                            <div class="grid md:grid-cols-3 gap-6 mb-6">
                                <div class="space-y-1">
                                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</p>
                                    <p class="text-base font-semibold text-gray-900">${booking.room ? booking.room.room_type : 'N/A'}</p>
                                </div>
                                <div class="space-y-1">
                                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Rate</p>
                                    <p class="text-base font-semibold text-gray-900">Rp ${booking.room ? Number(booking.room.price).toLocaleString('id-ID') : '0'}</p>
                                </div>
                                <div class="space-y-1">
                                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Date</p>
                                    <p class="text-base font-semibold text-gray-900">${new Date(booking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                            
                            ${booking.payment ? `
                                <div class="pt-6 border-t border-gray-100">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-medium text-gray-700">Payment Status</span>
                                        <span class="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${booking.payment.status === 'success' ? 'bg-emerald-100 text-emerald-800' : booking.payment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}">
                                            ${booking.payment.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ==================== RENDER PAYMENT HISTORY ====================
function calculateStats(payments) {
    return {
        total_transactions: payments.length,
        total_paid: payments.filter(p => p.status === 'success').reduce((sum, p) => sum + Number(p.amount), 0),
        success_count: payments.filter(p => p.status === 'success').length,
        pending_count: payments.filter(p => p.status === 'pending').length,
    };
}

export function renderPaymentHistory(data, container) {
    const payments = data.data || [];
    const stats = data.stats || calculateStats(payments);

    container.innerHTML = `
        <div class="mb-10">
            <h2 class="text-3xl font-bold text-gray-900 tracking-tight mb-2">Payment History</h2>
            <p class="text-gray-600">Track and manage your transactions</p>
        </div>
        
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div class="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <i class="fas fa-receipt text-xl text-gray-700"></i>
                    </div>
                </div>
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Transactions</p>
                <p class="text-3xl font-bold text-gray-900">${stats.total_transactions || 0}</p>
            </div>
            
            <div class="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <i class="fas fa-wallet text-xl text-emerald-600"></i>
                    </div>
                </div>
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Paid</p>
                <p class="text-2xl font-bold text-emerald-600">Rp ${Number(stats.total_paid || 0).toLocaleString('id-ID')}</p>
            </div>
            
            <div class="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <i class="fas fa-check-circle text-xl text-emerald-600"></i>
                    </div>
                </div>
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Successful</p>
                <p class="text-3xl font-bold text-emerald-600">${stats.success_count || 0}</p>
            </div>
            
            <div class="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <i class="fas fa-clock text-xl text-amber-600"></i>
                    </div>
                </div>
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Pending</p>
                <p class="text-3xl font-bold text-amber-600">${stats.pending_count || 0}</p>
            </div>
        </div>
        
        <!-- Filter Section -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div class="flex flex-col md:flex-row md:items-center gap-4">
                <label class="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter Status:</label>
                <select id="statusFilter" class="form-input flex-1 max-w-xs" onchange="applyPaymentFilter()">
                    <option value="all">All Payments</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                </select>
            </div>
        </div>
        
        <!-- Payment List -->
        <div id="paymentList" class="space-y-4">
            ${payments.length === 0 ? `
                <div class="flex flex-col items-center justify-center min-h-[300px] px-4">
                    <div class="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <i class="fas fa-history text-4xl text-gray-400"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">No Payment History</h3>
                    <p class="text-gray-500 text-center max-w-md">You don't have any payment transactions yet.</p>
                </div>
            ` : payments.map(payment => {
                const statusClass = payment.status === 'success' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : payment.status === 'pending' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-rose-100 text-rose-800';
                
                return `
                    <div class="payment-item bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300" data-status="${payment.status}">
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900 mb-1">Payment #${String(payment.id).padStart(4, '0')}</h3>
                                <p class="text-sm text-gray-600">${payment.booking ? `Booking: ${payment.booking.room ? payment.booking.room.name : 'N/A'}` : 'Payment Details'}</p>
                            </div>
                            <span class="inline-flex items-center px-4 py-2 ${statusClass} rounded-full text-xs font-semibold">
                                ${payment.status.toUpperCase()}
                            </span>
                        </div>
                        
                        <div class="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                            <div class="space-y-1">
                                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</p>
                                <p class="text-base font-semibold text-gray-900">Rp ${Number(payment.amount).toLocaleString('id-ID')}</p>
                            </div>
                            <div class="space-y-1">
                                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</p>
                                <p class="text-base font-semibold text-gray-900">${new Date(payment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div class="space-y-1">
                                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</p>
                                <p class="text-base font-mono text-sm text-gray-700">${payment.snap_token ? payment.snap_token.substring(0, 16) + '...' : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

window.applyPaymentFilter = function () {
    const filter = document.getElementById('statusFilter').value;
    const items = document.querySelectorAll('.payment-item');
    
    items.forEach(item => {
        if (filter === 'all') {
            item.style.display = 'block';
        } else {
            item.style.display = item.dataset.status === filter ? 'block' : 'none';
        }
    });
};

// ==================== RENDER PROFILE ====================
export function renderProfile(profile, container) {
    container.innerHTML = `
        <div class="mb-8">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-2">My Profile</h2>
            <p class="text-lg text-gray-600">Manage your personal information and account settings.</p>
        </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-100">            <div class="md:col-span-2 space-y-6">
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                    <form id="profileForm" class="space-y-4">
                        <div>
                            <label class="form-label">Full Name</label>
                            <input type="text" id="name" class="form-input border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg" value="${profile.name || ''}" required>
                        </div>
                        <div>
                            <label class="form-label">Email</label>
                            <input type="email" id="email" class="form-input border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg" value="${profile.email || ''}" required>
                        </div>
                        <div>
                            <label class="form-label">Phone Number</label>
                            <input type="text" id="phone" class="form-input border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg" value="${profile.phone || ''}" placeholder="+62xxx">
                        </div>
                        <div>
                            <label class="form-label">Address</label>
                            <textarea id="address" class="form-input border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg" rows="3">${profile.address || ''}</textarea>
                        </div>
                        <div>
                            <label class="form-label">Birth Date</label>
                            <input type="date" id="birth_date" class="form-input border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg" value="${profile.birth_date || ''}">
                        </div>
                        <button type="submit" class="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md">
                            <i class="fas fa-save mr-2"></i>Update Profile
                        </button>
                    </form>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                    <form id="passwordForm" class="space-y-4">
                        <div>
                            <label class="form-label">Current Password</label>
                            <input type="password" id="current_password" class="form-input border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg" required>
                        </div>
                        <div>
                            <label class="form-label">New Password</label>
                            <input type="password" id="new_password" class="form-input border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg" required minlength="8">
                        </div>
                        <div>
                            <label class="form-label">Confirm New Password</label>
                            <input type="password" id="new_password_confirmation" class="form-input border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg" required minlength="8">
                        </div>
                        <button type="submit" class="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-md">
                            <i class="fas fa-key mr-2"></i>Change Password
                        </button>
                    </form>
                </div>
            </div>
            <div class="md:col-span-1">
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">KTP Verification</h3>
                    ${profile.ktp_file ? `
                        <div class="mb-4">
                            <img src="/storage/${profile.ktp_file}" alt="KTP" class="w-full rounded border">
                            <div class="mt-2 flex items-center justify-between">
                                <span class="text-sm ${profile.ktp_verified ? 'text-green-600' : 'text-yellow-600'}">
                                    <i class="fas ${profile.ktp_verified ? 'fa-check-circle' : 'fa-clock'} mr-1"></i>
                                    ${profile.ktp_verified ? 'Verified' : 'Pending Verification'}
                                </span>
                                <button onclick="deleteKTP()" class="text-sm text-red-600 hover:text-red-700">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    ` : `
                        <div class="mb-4 text-center py-10 border-2 border-dashed border-gray-300 rounded-xl">
                            <i class="fas fa-id-card text-4xl text-gray-400 mb-2"></i>
                            <p class="text-sm text-gray-600">No KTP uploaded</p>
                        </div>
                    `}
                    <form id="ktpForm">
                        <div class="mb-4">
                            <label class="form-label">Upload KTP</label>
                            <input type="file" id="ktp" accept="image/*,.pdf" class="form-input border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                            <p class="text-xs text-gray-500 mt-1">Max 2MB (JPG, PNG, PDF)</p>
                        </div>
                        <button type="submit" class="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md">
                            <i class="fas fa-upload mr-2"></i>Upload KTP
                        </button>
                    </form>
                </div>
                <div class="bg-gray-50 rounded-xl p-5 mt-6 border border-gray-100">
                    <p class="text-xs text-gray-600 mb-2">Account Created</p>
                    <p class="text-sm font-semibold">${new Date(profile.created_at).toLocaleDateString('id-ID')}</p>
                    <p class="text-xs text-gray-600 mt-3 mb-2">Role</p>
                    <p class="text-sm font-semibold capitalize">${profile.role}</p>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    document.getElementById('profileForm').addEventListener('submit', updateProfile);
    document.getElementById('passwordForm').addEventListener('submit', updatePassword);
    document.getElementById('ktpForm').addEventListener('submit', uploadKTP);
}

// Profile actions
function updateProfile(e) {
    e.preventDefault();
    showLoading();
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        birth_date: document.getElementById('birth_date').value
    };

    fetch('/api/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showSuccessModal('Success', data.message);
        } else {
            showErrorModal('Error', data.message);
        }
    })
    .catch(err => {
        hideLoading();
        showErrorModal('Error', 'Failed to update profile');
    });
}

function updatePassword(e) {
    e.preventDefault();
    showLoading();
    const formData = {
        current_password: document.getElementById('current_password').value,
        new_password: document.getElementById('new_password').value,
        new_password_confirmation: document.getElementById('new_password_confirmation').value
    };

    fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showSuccessModal('Success', data.message);
            document.getElementById('passwordForm').reset();
        } else {
            showErrorModal('Error', data.message);
        }
    })
    .catch(err => {
        hideLoading();
        showErrorModal('Error', 'Failed to update password');
    });
}

function uploadKTP(e) {
    e.preventDefault();
    const fileInput = document.getElementById('ktp');
    if (!fileInput.files[0]) {
        showErrorModal('Error', 'Please select a file');
        return;
    }
    showLoading();
    const formData = new FormData();
    formData.append('ktp', fileInput.files[0]);

    fetch('/api/profile/ktp', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showSuccessModal('Success', data.message);
            setTimeout(() => window.showPage('profile'), 2000);
        } else {
            showErrorModal('Error', data.message);
        }
    })
    .catch(err => {
        hideLoading();
        showErrorModal('Error', 'Failed to upload KTP');
    });
}

window.deleteKTP = function () {
    if (!confirm('Are you sure you want to delete your KTP?')) return;
    showLoading();
    fetch('/api/profile/ktp', {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showSuccessModal('Success', data.message);
            setTimeout(() => window.showPage('profile'), 2000);
        } else {
            showErrorModal('Error', data.message);
        }
    })
    .catch(err => {
        hideLoading();
        showErrorModal('Error', 'Failed to delete KTP');
    });
};


export function renderUserDashboard(data, container) {
    const hasActiveBooking = data && data.id;

    if (!hasActiveBooking) {
        const userNameElement = document.querySelector('.font-medium.text-gray-800') || 
                                document.querySelector('[class*="text-gray-800"]:contains("' + '{{ auth()->user()->name }}' + '")') ||
                                { textContent: 'User' };
        const userName = userNameElement.textContent.trim() || 'User';

        container.innerHTML = `
            <div class="max-w-5xl mx-auto">
                <!-- Hero Section -->
                <div class="text-center mb-16">
                    <div class="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 mb-8">
                        <i class="fas fa-home text-6xl text-gray-400"></i>
                    </div>
                    
                    <h2 class="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        Welcome back, <span class="text-gray-700">${userName}</span>
                    </h2>
                    
                    <p class="text-xl text-gray-600 mb-3">
                        You don't have any active bookings yet
                    </p>
                    
                    <p class="text-gray-500 max-w-2xl mx-auto mb-12">
                        Discover your perfect living space at The Dua Blue House. We offer comfortable rooms with premium facilities, ready for you to move in.
                    </p>
                    
                    <button onclick="window.showPage('available-rooms')" 
                            class="inline-flex items-center px-10 py-4 bg-gray-900 text-white text-base font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                        <i class="fas fa-search mr-3 text-lg"></i>
                        Browse Available Rooms
                    </button>
                </div>
                
                <!-- Features Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300">
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-6">
                            <i class="fas fa-door-open text-3xl text-blue-600"></i>
                        </div>
                        <h4 class="text-lg font-bold text-gray-900 mb-2">Available Rooms</h4>
                        <p class="text-gray-600 text-sm leading-relaxed">Browse through our selection of ready-to-book rooms</p>
                    </div>
                    
                    <div class="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300">
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mb-6">
                            <i class="fas fa-star text-3xl text-amber-600"></i>
                        </div>
                        <h4 class="text-lg font-bold text-gray-900 mb-2">Premium Facilities</h4>
                        <p class="text-gray-600 text-sm leading-relaxed">AC, high-speed WiFi, private bathroom, and more</p>
                    </div>
                    
                    <div class="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300">
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mb-6">
                            <i class="fas fa-shield-alt text-3xl text-emerald-600"></i>
                        </div>
                        <h4 class="text-lg font-bold text-gray-900 mb-2">Secure Payment</h4>
                        <p class="text-gray-600 text-sm leading-relaxed">Encrypted transactions powered by Midtrans</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    const statusStyles = {
        'menunggu_pembayaran': { 
            bg: 'bg-amber-50', 
            border: 'border-amber-200',
            badge: 'bg-amber-100 text-amber-800',
            icon: 'fa-clock'
        },
        'menunggu_verifikasi': { 
            bg: 'bg-blue-50', 
            border: 'border-blue-200',
            badge: 'bg-blue-100 text-blue-800',
            icon: 'fa-hourglass-half'
        },
        'disetujui': { 
            bg: 'bg-emerald-50', 
            border: 'border-emerald-200',
            badge: 'bg-emerald-100 text-emerald-800',
            icon: 'fa-check-circle'
        },
        'ditolak': { 
            bg: 'bg-rose-50', 
            border: 'border-rose-200',
            badge: 'bg-rose-100 text-rose-800',
            icon: 'fa-times-circle'
        }
    };
    const status = statusStyles[data.status] || statusStyles['menunggu_pembayaran'];

    container.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <div class="mb-10">
                <h2 class="text-3xl font-bold text-gray-900 tracking-tight mb-2">Active Booking</h2>
                <p class="text-gray-600">Manage your current reservation</p>
            </div>
            
            <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div class="p-8">
                    <div class="flex items-start justify-between mb-8">
                        <div>
                            <h3 class="text-2xl font-bold text-gray-900 mb-1">Booking Details</h3>
                            <p class="text-sm text-gray-500">ID: #${String(data.id).padStart(4, '0')}</p>
                        </div>
                        <span class="inline-flex items-center px-4 py-2 ${status.badge} rounded-full text-xs font-semibold tracking-wide">
                            <i class="fas ${status.icon} mr-2"></i>
                            ${data.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-8 mb-8">
                        <div class="space-y-1">
                            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Room Name</p>
                            <p class="text-xl font-semibold text-gray-900">${data.room ? data.room.name : 'N/A'}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</p>
                            <p class="text-xl font-semibold text-gray-900">${data.room ? data.room.room_type : 'N/A'}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Rate</p>
                            <p class="text-xl font-semibold text-gray-900">Rp ${data.room ? Number(data.room.price).toLocaleString('id-ID') : '0'}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Date</p>
                            <p class="text-xl font-semibold text-gray-900">${new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                    
                    ${data.payment ? `
                        <div class="pt-8 border-t border-gray-200">
                            <h4 class="text-lg font-bold text-gray-900 mb-4">Payment Information</h4>
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span class="text-sm font-medium text-gray-700">Payment Status</span>
                                <span class="inline-flex items-center px-4 py-2 ${data.payment.status === 'success' ? 'bg-emerald-100 text-emerald-800' : data.payment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'} rounded-full text-xs font-semibold">
                                    ${data.payment.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}