<!-- BOOKING MODAL -->
<div id="bookingModal"
     class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50 transition-opacity">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Confirm Booking</h2>
        <p class="text-gray-600 text-sm mb-4">Are you sure you want to book this room?</p>

        <div class="flex justify-end space-x-3 mt-6">
            <button id="cancelBooking"
                    class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
                Cancel
            </button>

            <button id="confirmBooking"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Yes, Book Now
            </button>
        </div>
    </div>
</div>

<!-- LOADING MODAL -->
<div id="loadingModal"
     class="fixed inset-0 bg-black bg-opacity-40 hidden items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg px-6 py-4 flex flex-col items-center animate-fadeIn">
        <div class="loader mb-3 border-4 border-blue-300 border-t-blue-600 rounded-full w-10 h-10 animate-spin"></div>
        <p class="text-gray-700 text-sm">Processing your booking...</p>
    </div>
</div>

<!-- MIDTRANS SNAP -->
<script src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="{{ config('midtrans.client_key') }}"></script>

<script>
let selectedRoomId = null;

function showModal() {
    bookingModal.classList.remove('hidden');
    bookingModal.classList.add('flex');
}

function hideModal() {
    bookingModal.classList.add('hidden');
    bookingModal.classList.remove('flex');
}

function showLoading() {
    loadingModal.classList.remove('hidden');
    loadingModal.classList.add('flex');
}

function hideLoading() {
    loadingModal.classList.add('hidden');
    loadingModal.classList.remove('flex');
}

document.addEventListener('click', function (e) {

    // OPEN MODAL
    if (e.target.classList.contains('btn-book')) {
        selectedRoomId = e.target.dataset.room;
        showModal();
    }

    // CANCEL
    if (e.target.id === 'cancelBooking') {
        hideModal();
    }

    // CONFIRM BOOKING
    if (e.target.id === 'confirmBooking') {
        hideModal();
        showLoading();

        // 1️⃣ CREATE BOOKING
        fetch("/api/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": "{{ csrf_token() }}"
            },
            body: JSON.stringify({ room_id: selectedRoomId })
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            // 2️⃣ CREATE SNAP TOKEN
            return fetch("/api/bookings/snap", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": "{{ csrf_token() }}"
                },
                body: JSON.stringify({
                    booking_id: data.data.id
                })
            });
        })
        .then(res => res.json())
        .then(data => {
            hideLoading();

            if (!data.success) {
                throw new Error("Failed to get Snap Token");
            }

            // 3️⃣ OPEN MIDTRANS SNAP
            snap.pay(data.snap_token, {
                onSuccess: function () {
                    alert("Payment success");
                    location.reload();
                },
                onPending: function () {
                    alert("Waiting for payment");
                    location.reload();
                },
                onError: function () {
                    alert("Payment failed");
                },
                onClose: function () {
                    alert("Payment popup closed");
                }
            });
        })
        .catch(err => {
            hideLoading();
            console.error(err);
            alert(err.message || "Something went wrong");
        });
    }
});
</script>
