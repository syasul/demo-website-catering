<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->nullable()->constrained('packages')->onDelete('set null');
            $table->string('package_name_snapshot');
            $table->decimal('price_per_pax_snapshot', 12, 2);
            $table->integer('pax');
            $table->json('addon_ids')->nullable();
            $table->json('addon_snapshot')->nullable();
            $table->date('event_date');
            $table->text('event_location')->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount', 12, 2)->default(0.00);
            $table->decimal('total_estimate', 12, 2);
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->text('notes')->nullable();
            $table->string('source')->default('web'); // web, whatsapp, manual
            $table->string('status')->default('new'); // new, contacted, negotiation, deal, lost
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->text('lost_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
