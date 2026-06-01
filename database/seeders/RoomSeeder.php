<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [

            [
                'name' => 'Premium A-1201',
                'room_type' => 'Premium',
                'price' => 3000000,
                'description' => 'Kamar premium bernuansa biru Scandinavian dengan AC, WiFi cepat, dan furnitur rapi. Tersedia kamar mandi dalam yang nyaman untuk penggunaan harian.',
                'photo' => 'Premium 1.jpg',
                'capacity' => 1,
            ],

            [
                'name' => 'Premium A-1202',
                'room_type' => 'Premium',
                'price' => 3000000,
                'description' => 'Kamar premium berwarna beige–kayu dengan AC sejuk, WiFi stabil, dan pencahayaan hangat. Dilengkapi kamar mandi dalam untuk kenyamanan maksimal.',
                'photo' => 'Premium 2.jpg',
                'capacity' => 1,
            ],

            [
                'name' => 'Premium A-1203',
                'room_type' => 'Premium',
                'price' => 3000000,
                'description' => 'Kamar premium bergaya white–navy modern dengan AC dingin dan WiFi kencang. Memiliki kamar mandi dalam dan jendela besar yang terang.',
                'photo' => 'Premium 3.jpg',
                'capacity' => 1,
            ],

            [
                'name' => 'Premium A-1204',
                'room_type' => 'Premium',
                'price' => 3000000,
                'description' => 'Kamar premium bertema pink pastel dengan AC, WiFi cepat, dan dekor estetik. Kamar mandi dalam memberikan kenyamanan lebih sepanjang hari.',
                'photo' => 'Premium 4.jpg',
                'capacity' => 1,
            ],

            [
                'name' => 'Premium A-1205',
                'room_type' => 'Premium',
                'price' => 3200000,
                'description' => 'Kamar premium lebih luas bernuansa green calming dengan AC sejuk dan WiFi stabil. Dilengkapi kamar mandi dalam besar dan tata ruang lega.',
                'photo' => 'Premium 5.jpg',
                'capacity' => 1,
            ],

            [
                'name' => 'Premium A-1206',
                'room_type' => 'Premium',
                'price' => 3200000,
                'description' => 'Kamar premium paling luas dengan tema blue–beige luxury, AC dingin, dan WiFi cepat. Area ruang ekstra sangat nyaman.',
                'photo' => 'Premium 6.jpg',
                'capacity' => 1,
            ],

            [
                'name' => 'Reguler B-101',
                'room_type' => 'Reguler',
                'price' => 1500000,
                'description' => 'Kamar minimalis bernuansa biru–kayu terang dengan single bed kecil, AC, dan WiFi stabil. Kamar mandi dalam dan area belajar ringkas.',
                'photo' => 'Reguler 1.jpg',
                'capacity' => 1,
            ],

            [
                'name' => 'Reguler B-102',
                'room_type' => 'Reguler',
                'price' => 1500000,
                'description' => 'Kamar rapi bertema biru navy–kayu dengan single bed kecil, AC sejuk, dan rak dinding modern. Kamar mandi dalam.',
                'photo' => 'Reguler 2.jpg',
                'capacity' => 1,
            ],

            [
                'name' => 'Reguler B-103',
                'room_type' => 'Reguler',
                'price' => 1650000,
                'description' => 'Kamar reguler biru lembut dengan single bed, AC, dan WiFi cepat. Dilengkapi meja belajar minimalis.',
                'photo' => 'Reguler 3.jpg',
                'capacity' => 1,
            ],

            [
                'name' => 'Reguler B-104',
                'room_type' => 'Reguler',
                'price' => 1650000,
                'description' => 'Kamar bernuansa biru pastel–kayu muda dengan single bed dan AC dingin. Pencahayaan natural.',
                'photo' => 'Reguler 4.jpg',
                'capacity' => 1,
            ],

            [
                'name' => 'Reguler B-105',
                'room_type' => 'Reguler',
                'price' => 1650000,
                'description' => 'Kamar terang biru muda–putih dengan single bed dan AC sejuk. Area kerja sederhana namun fungsional.',
                'photo' => 'Reguler 5.jpg',
                'capacity' => 1,
            ],

            [
                'name' => 'Reguler B-106',
                'room_type' => 'Reguler',
                'price' => 1650000,
                'description' => 'Kamar biru gelap–abu modern dengan single bed dan AC nyaman. Sangat cocok untuk privasi.',
                'photo' => 'Reguler 6.jpg',
                'capacity' => 1,
            ],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}
