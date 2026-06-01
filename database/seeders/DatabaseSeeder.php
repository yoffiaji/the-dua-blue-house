<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
public function run(): void
{
    // Seed users
    User::factory()->create([
        'name' => 'Hardy',
        'email' => 'hardy@gmail.com',
    ]);

    User::create([
        'name' => 'Admin User',
        'email' => 'hitam@gmail.com',
        'password' => bcrypt('hitam12345'),
        'role' => 'admin',
    ]);

    // Seed rooms
    $this->call([
        RoomSeeder::class,
    ]);
}

}
