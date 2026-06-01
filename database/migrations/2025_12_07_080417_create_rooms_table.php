<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->enum('room_type', ['Premium', 'Reguler']);
            $table->decimal('price', 10, 2);

            // Updated field
            $table->text('description');

            // Single photo (UI only uses 1)
            $table->string('photo');

            $table->unsignedTinyInteger('capacity')->default(1);

            // Status rules: Available / Reserved
            $table->enum('status', ['Available', 'Reserved'])->default('Available');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
