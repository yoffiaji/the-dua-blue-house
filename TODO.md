# TODO List for Room Data Standardization and Midtrans Payment Migration

## 1. Room Data Standardization
- [x] Update rooms table migration: add room_type (enum: 'Premium', 'Reguler'), change status to enum('Available', 'Reserved')
- [x] Update Room model: add fillables, relationships (hasMany Bookings), methods to check availability
- [x] Update Booking model: add fillables, relationships (belongsTo User, belongsTo Room)
- [x] Create RoomController to fetch and display rooms
- [x] Update routes/web.php to use RoomController for /rooms
- [x] Modify resources/views/rooms.blade.php to loop through rooms from DB (keep UI intact)
- [x] Create RoomSeeder to populate DB with data from rooms.blade.php (map 'Almost Full' to 'Available')
- [x] Ensure room availability logic: status == 'Available' and no active booking (capacity 1)

## 2. Payment System Migration to Midtrans
- [x] Install Midtrans SDK via Composer
- [x] Add Midtrans config to config/services.php using env vars (MID_CLIENT_KEY, MID_SERVER_KEY)
- [x] Update payments table migration: add snap_token, midtrans_transaction_id, remove payment_proof
- [x] Create PaymentController for generating Snap token, payment page, webhook
- [x] Update routes for payment endpoints (/book/{room}, /payment/process, /payment/webhook)
- [x] Implement webhook handler to update payment/booking status (settlement -> Reserved, etc.)
- [x] Log payment events to database
- [x] Disable old payment proof upload logic

## 3. Remove Old Payment Flow
- [x] Remove payment_proof related code from controllers/views
- [x] Ensure booking process uses Midtrans only

## 4. Sandbox-Only Operation
- [x] Ensure Midtrans uses sandbox mode
- [ ] Test endpoints, webhook, error handling via Midtrans Dashboard

## Followup Steps
- [ ] Run migrations and seeders
- [ ] Set Midtrans env vars
- [ ] Test room display and booking flow
- [ ] Validate Midtrans integration in sandbox
