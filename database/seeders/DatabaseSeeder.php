<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Package;
use App\Models\MenuItem;
use App\Models\Addon;
use App\Models\PricingTier;
use App\Models\Quotation;
use App\Models\QuotationActivity;
use App\Models\Testimonial;
use App\Models\Gallery;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Users
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@catering.com',
            'password' => Hash::make('password'),
            'phone' => '081234567890',
            'is_active' => true,
        ]);

        $admin = User::create([
            'name' => 'Admin Operasional',
            'email' => 'admin@catering.com',
            'password' => Hash::make('password'),
            'phone' => '081234567891',
            'is_active' => true,
        ]);

        $finance = User::create([
            'name' => 'Finance Staff',
            'email' => 'finance@catering.com',
            'password' => Hash::make('password'),
            'phone' => '081234567892',
            'is_active' => true,
        ]);

        // 2. Create Categories
        $weddingCat = Category::create(['name' => 'Wedding Services', 'slug' => 'wedding-services']);
        $khitananCat = Category::create(['name' => 'Khitanan (Circumcision)', 'slug' => 'khitanan']);
        $corporateCat = Category::create(['name' => 'Corporate Gathering', 'slug' => 'corporate-gathering']);
        $birthdayCat = Category::create(['name' => 'Birthday Party', 'slug' => 'birthday-party']);

        // 3. Create Menu Items
        $menus = [
            // Main Course
            ['name' => 'Nasi Putih Premium', 'type' => 'main_course'],
            ['name' => 'Nasi Goreng Spesial Oriental', 'type' => 'main_course'],
            ['name' => 'Ayam Bakar Taliwang', 'type' => 'main_course'],
            ['name' => 'Ayam Kuluyuk Asam Manis', 'type' => 'main_course'],
            ['name' => 'Daging Sapi Lada Hitam', 'type' => 'main_course'],
            ['name' => 'Daging Semur Betawi', 'type' => 'main_course'],
            ['name' => 'Kakap Fillet Asam Manis', 'type' => 'main_course'],
            ['name' => 'Sop Kimlo Hangat', 'type' => 'main_course'],
            ['name' => 'Capcay Bakso & Ayam', 'type' => 'main_course'],
            ['name' => 'Sambal Goreng Ati Kentang', 'type' => 'main_course'],
            // Snacks
            ['name' => 'Risoles Mayonaise', 'type' => 'snack'],
            ['name' => 'Pastel Ayam Sayur', 'type' => 'snack'],
            ['name' => 'Siomay Bandung Premium', 'type' => 'snack'],
            ['name' => 'Sosis Solo Kukus', 'type' => 'snack'],
            // Desserts
            ['name' => 'Puding Coklat Saus Vla', 'type' => 'dessert'],
            ['name' => 'Es Doger Tradisional', 'type' => 'dessert'],
            ['name' => 'Aneka Potongan Buah Segar', 'type' => 'dessert'],
            ['name' => 'Ice Cream Cup Vanilla/Chocolate', 'type' => 'dessert'],
            // Beverages
            ['name' => 'Es Teh Manis Selasih', 'type' => 'beverage'],
            ['name' => 'Infused Water Lemon & Mint', 'type' => 'beverage'],
            ['name' => 'Orange Juice Fresh', 'type' => 'beverage'],
        ];

        $menuModels = [];
        foreach ($menus as $m) {
            $menuModels[] = MenuItem::create($m);
        }

        // 4. Create Packages
        $pSakinah = Package::create([
            'category_id' => $weddingCat->id,
            'name' => 'Paket Sakinah (Wedding Standard)',
            'slug' => 'paket-sakinah',
            'description' => 'Paket wedding lengkap dengan hidangan prasmanan lezat untuk budget bersahabat.',
            'price_per_pax' => 55000.00,
            'min_pax' => 250,
            'max_pax' => 1000,
            'thumbnail' => null,
            'is_active' => true,
        ]);

        $pMawaddah = Package::create([
            'category_id' => $weddingCat->id,
            'name' => 'Paket Mawaddah (Wedding Premium)',
            'slug' => 'paket-mawaddah',
            'description' => 'Pilihan populer dengan variasi menu daging sapi premium dan aneka pondokan dessert.',
            'price_per_pax' => 75000.00,
            'min_pax' => 250,
            'max_pax' => 1500,
            'thumbnail' => null,
            'is_active' => true,
        ]);

        $pRahmah = Package::create([
            'category_id' => $weddingCat->id,
            'name' => 'Paket Rahmah (Wedding Gold)',
            'slug' => 'paket-rahmah',
            'description' => 'Paket prasmanan termewah dengan menu masakan nusantara dan barat terbaik.',
            'price_per_pax' => 95000.00,
            'min_pax' => 200,
            'max_pax' => 2000,
            'thumbnail' => null,
            'is_active' => true,
        ]);

        $pKhitanan = Package::create([
            'category_id' => $khitananCat->id,
            'name' => 'Paket Syukuran Khitanan',
            'slug' => 'paket-khitanan',
            'description' => 'Sajian prasmanan praktis dan bersahaja untuk acara keluarga khitanan putra Anda.',
            'price_per_pax' => 45000.00,
            'min_pax' => 100,
            'max_pax' => 500,
            'thumbnail' => null,
            'is_active' => true,
        ]);

        $pGathering = Package::create([
            'category_id' => $corporateCat->id,
            'name' => 'Paket Corporate Gathering',
            'slug' => 'paket-gathering',
            'description' => 'Pilihan makan siang/malam prasmanan profesional untuk meeting kantor atau gathering korporat.',
            'price_per_pax' => 65000.00,
            'min_pax' => 150,
            'max_pax' => 1000,
            'thumbnail' => null,
            'is_active' => true,
        ]);

        // Link Menus to Packages
        // Sakinah menus
        $pSakinah->menuItems()->attach([
            $menuModels[0]->id, // Nasi Putih
            $menuModels[1]->id, // Nasi Goreng
            $menuModels[3]->id, // Ayam Kuluyuk
            $menuModels[6]->id, // Kakap Fillet
            $menuModels[7]->id, // Sop Kimlo
            $menuModels[10]->id, // Risoles
            $menuModels[14]->id, // Puding
            $menuModels[18]->id, // Es Teh
            $menuModels[19]->id, // Infused Water
        ]);

        // Mawaddah menus
        $pMawaddah->menuItems()->attach([
            $menuModels[0]->id, // Nasi Putih
            $menuModels[1]->id, // Nasi Goreng
            $menuModels[2]->id, // Ayam Taliwang
            $menuModels[4]->id, // Daging Lada Hitam
            $menuModels[6]->id, // Kakap Fillet
            $menuModels[7]->id, // Sop Kimlo
            $menuModels[10]->id, // Risoles
            $menuModels[12]->id, // Siomay
            $menuModels[14]->id, // Puding
            $menuModels[15]->id, // Es Doger
            $menuModels[18]->id, // Es Teh
            $menuModels[19]->id, // Infused Water
            $menuModels[20]->id, // Orange Juice
        ]);

        // Rahmah menus
        $pRahmah->menuItems()->attach([
            $menuModels[0]->id, // Nasi Putih
            $menuModels[1]->id, // Nasi Goreng
            $menuModels[2]->id, // Ayam Taliwang
            $menuModels[4]->id, // Daging Lada Hitam
            $menuModels[6]->id, // Kakap Fillet
            $menuModels[7]->id, // Sop Kimlo
            $menuModels[8]->id, // Capcay
            $menuModels[9]->id, // Sambal Goreng Ati
            $menuModels[10]->id, // Risoles
            $menuModels[11]->id, // Pastel
            $menuModels[12]->id, // Siomay
            $menuModels[14]->id, // Puding
            $menuModels[15]->id, // Es Doger
            $menuModels[16]->id, // Buah Potong
            $menuModels[17]->id, // Ice Cream
            $menuModels[18]->id, // Es Teh
            $menuModels[19]->id, // Infused Water
            $menuModels[20]->id, // Orange Juice
        ]);

        // 5. Create Add-ons
        $addons = [
            ['name' => 'Tenda Dekorasi Pelaminan Premium', 'pricing_type' => 'flat', 'price' => 5000000.00],
            ['name' => 'Sound System & MC Profesional', 'pricing_type' => 'flat', 'price' => 2500000.00],
            ['name' => 'Live Cooking Kambing Guling (pax)', 'pricing_type' => 'per_pax', 'price' => 35000.00],
            ['name' => 'Dessert Table & Chocolate Fountain', 'pricing_type' => 'flat', 'price' => 3000000.00],
            ['name' => 'Rias & Busana Pengantin (Sepasang)', 'pricing_type' => 'flat', 'price' => 8000000.00],
            ['name' => 'Pramusaji / Waiter Tambahan (1 Orang)', 'pricing_type' => 'flat', 'price' => 350000.00],
        ];

        $addonModels = [];
        foreach ($addons as $ad) {
            $addonModels[] = Addon::create($ad);
        }

        // 6. Create Pricing Tiers
        // Global Tiers (discount_percent)
        PricingTier::create(['package_id' => null, 'min_pax' => 250, 'discount_percent' => 5.00]);
        PricingTier::create(['package_id' => null, 'min_pax' => 500, 'discount_percent' => 10.00]);

        // Package-specific Tier overrides (for pSakinah)
        PricingTier::create(['package_id' => $pSakinah->id, 'min_pax' => 800, 'discount_percent' => 12.00]);

        // 7. Create Testimonials
        Testimonial::create([
            'customer_name' => 'Budi & Ani',
            'event_type' => 'Wedding Reception',
            'rating' => 5,
            'content' => 'Pelayanan luar biasa! Makanan dari Paket Mawaddah enak semua, tamu puji rasa sapinya yang lembut dan es dogernya segar sekali. Dekorasi tenda juga rapi.',
            'photo' => null,
            'is_published' => true,
        ]);

        Testimonial::create([
            'customer_name' => 'Ibu Rita (BCA)',
            'event_type' => 'Corporate Anniversary Gathering',
            'rating' => 4,
            'content' => 'Katering tepat waktu, porsi pas tidak kurang sama sekali. Tim pramusaji sigap dan bersih selama menjaga buffet. Rekomendasi buat acara kantor.',
            'photo' => null,
            'is_published' => true,
        ]);

        Testimonial::create([
            'customer_name' => 'Pak Joko',
            'event_type' => 'Syukuran Khitanan',
            'rating' => 5,
            'content' => 'Paket khitanan sangat praktis dan terjangkau untuk katering rumahan. Menu ayam kuluyuk disukai anak-anak.',
            'photo' => null,
            'is_published' => true,
        ]);

        // 8. Create Galleries
        Gallery::create([
            'title' => 'Dekorasi Rustic Gold Pernikahan Budi & Ani',
            'category_id' => $weddingCat->id,
            'image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600',
            'event_date' => Carbon::now()->subMonths(2),
            'is_published' => true,
        ]);

        Gallery::create([
            'title' => 'Buffet Area Corporate Gathering Astra',
            'category_id' => $corporateCat->id,
            'image' => 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600',
            'event_date' => Carbon::now()->subMonths(1),
            'is_published' => true,
        ]);

        Gallery::create([
            'title' => 'Tenda Khitanan Nuansa Putih Hijau',
            'category_id' => $khitananCat->id,
            'image' => 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=600',
            'event_date' => Carbon::now()->subDays(15),
            'is_published' => true,
        ]);

        // 9. Create Quotations (Leads)
        $now = Carbon::now();

        // Lead 1: New Lead
        $lead1 = Quotation::create([
            'package_id' => $pSakinah->id,
            'package_name_snapshot' => $pSakinah->name,
            'price_per_pax_snapshot' => $pSakinah->price_per_pax,
            'pax' => 300,
            'addon_ids' => [$addonModels[0]->id, $addonModels[1]->id], // Tenda, Sound
            'addon_snapshot' => [
                ['name' => $addonModels[0]->name, 'pricing_type' => $addonModels[0]->pricing_type, 'price' => $addonModels[0]->price],
                ['name' => $addonModels[1]->name, 'pricing_type' => $addonModels[1]->pricing_type, 'price' => $addonModels[1]->price],
            ],
            'event_date' => $now->copy()->addMonths(3)->toDateString(),
            'event_location' => 'Gedung Serbaguna Masjid Agung, Jakarta',
            'subtotal' => (55000.00 * 300) + 5000000.00 + 2500000.00, // 16.5M + 7.5M = 24M
            'discount' => 24000000.00 * 0.05, // 5% discount (pax >= 250) -> 1.2M
            'total_estimate' => 22800000.00,
            'customer_name' => 'Siti Rahmawati',
            'customer_phone' => '087812345678',
            'customer_email' => 'siti.rahma@gmail.com',
            'notes' => 'Tolong tanyakan apakah dekorasi tenda bisa request warna ungu pastel.',
            'source' => 'web',
            'status' => 'new',
            'assigned_to' => null,
            'lost_reason' => null,
            'created_at' => $now->copy()->subHours(2),
        ]);

        // Lead 2: Contacted Lead (Assigned to Admin)
        $lead2 = Quotation::create([
            'package_id' => $pMawaddah->id,
            'package_name_snapshot' => $pMawaddah->name,
            'price_per_pax_snapshot' => $pMawaddah->price_per_pax,
            'pax' => 400,
            'addon_ids' => [$addonModels[2]->id, $addonModels[3]->id], // Kambing Guling, Dessert table
            'addon_snapshot' => [
                ['name' => $addonModels[2]->name, 'pricing_type' => $addonModels[2]->pricing_type, 'price' => $addonModels[2]->price], // 35k * 400 = 14M
                ['name' => $addonModels[3]->name, 'pricing_type' => $addonModels[3]->pricing_type, 'price' => $addonModels[3]->price], // 3M
            ],
            'event_date' => $now->copy()->addMonths(4)->toDateString(),
            'event_location' => 'Aula Kompas Gramedia, Jakarta',
            'subtotal' => (75000.00 * 400) + (35000.00 * 400) + 3000000.00, // 30M + 14M + 3M = 47M
            'discount' => 47000000.00 * 0.05, // 5% -> 2.35M
            'total_estimate' => 44650000.00,
            'customer_name' => 'Ahmad Fauzi',
            'customer_phone' => '082198765432',
            'customer_email' => 'fauzi.ahmad@yahoo.com',
            'notes' => 'Rencana resepsi pernikahan malam hari.',
            'source' => 'web',
            'status' => 'contacted',
            'assigned_to' => $admin->id,
            'lost_reason' => null,
            'created_at' => $now->copy()->subDays(3),
        ]);

        QuotationActivity::create([
            'quotation_id' => $lead2->id,
            'user_id' => $admin->id,
            'note' => 'Melakukan follow-up pertama via WhatsApp. Customer meminta rincian menu yang include dalam Paket Mawaddah.',
            'activity_type' => 'wa',
            'created_at' => $now->copy()->subDays(2)->addHours(4),
        ]);

        QuotationActivity::create([
            'quotation_id' => $lead2->id,
            'user_id' => $admin->id,
            'note' => 'Menghubungi via telepon. Konfirmasi tanggal acara aman belum ter-booking.',
            'activity_type' => 'call',
            'created_at' => $now->copy()->subDays(2)->addHours(5),
        ]);

        // Lead 3: Negotiation Lead
        $lead3 = Quotation::create([
            'package_id' => $pRahmah->id,
            'package_name_snapshot' => $pRahmah->name,
            'price_per_pax_snapshot' => $pRahmah->price_per_pax,
            'pax' => 600,
            'addon_ids' => [$addonModels[0]->id, $addonModels[4]->id], // Tenda, Rias Busana
            'addon_snapshot' => [
                ['name' => $addonModels[0]->name, 'pricing_type' => $addonModels[0]->pricing_type, 'price' => $addonModels[0]->price], // 5M
                ['name' => $addonModels[4]->name, 'pricing_type' => $addonModels[4]->pricing_type, 'price' => $addonModels[4]->price], // 8M
            ],
            'event_date' => $now->copy()->addMonths(2)->toDateString(),
            'event_location' => 'Balai Kartini, Jakarta',
            'subtotal' => (95000.00 * 600) + 5000000.00 + 8000000.00, // 57M + 13M = 70M
            'discount' => 70000000.00 * 0.10, // 10% discount (pax >= 500) -> 7M
            'total_estimate' => 63000000.00,
            'customer_name' => 'Rina Wijayanti',
            'customer_phone' => '081399887766',
            'customer_email' => 'rina.w@outlook.com',
            'notes' => 'Meminta nego diskon tambahan karena ambil paket rias busana juga.',
            'source' => 'whatsapp',
            'status' => 'negotiation',
            'assigned_to' => $admin->id,
            'lost_reason' => null,
            'created_at' => $now->copy()->subDays(5),
        ]);

        QuotationActivity::create([
            'quotation_id' => $lead3->id,
            'user_id' => $admin->id,
            'note' => 'Chat WhatsApp: Customer menanyakan kelengkapan busana adat Jawa Tengah.',
            'activity_type' => 'wa',
            'created_at' => $now->copy()->subDays(4),
        ]);

        QuotationActivity::create([
            'quotation_id' => $lead3->id,
            'user_id' => $admin->id,
            'note' => 'Bertemu di kantor catering untuk food testing ayam taliwang dan sup kimlo. Customer suka dan lanjut bernegosiasi harga.',
            'activity_type' => 'meeting',
            'created_at' => $now->copy()->subDays(3),
        ]);

        // Lead 4: Deal Lead
        $lead4 = Quotation::create([
            'package_id' => $pGathering->id,
            'package_name_snapshot' => $pGathering->name,
            'price_per_pax_snapshot' => $pGathering->price_per_pax,
            'pax' => 200,
            'addon_ids' => [$addonModels[1]->id], // Sound System
            'addon_snapshot' => [
                ['name' => $addonModels[1]->name, 'pricing_type' => $addonModels[1]->pricing_type, 'price' => $addonModels[1]->price], // 2.5M
            ],
            'event_date' => $now->copy()->addMonths(1)->toDateString(),
            'event_location' => 'Kantor Pusat Gojek Lt 6, Pasar Raya Blok M',
            'subtotal' => (65000.00 * 200) + 2500000.00, // 13M + 2.5M = 15.5M
            'discount' => 0.00, // pax 200 < 250, no discount
            'total_estimate' => 15500000.00,
            'customer_name' => 'Hendra Setiawan (HRD)',
            'customer_phone' => '081223344556',
            'customer_email' => 'hendra.setiawan@gojek.com',
            'notes' => 'Acara internal syukuran kuartalan kantor.',
            'source' => 'manual',
            'status' => 'deal',
            'assigned_to' => $admin->id,
            'lost_reason' => null,
            'created_at' => $now->copy()->subDays(10),
        ]);

        QuotationActivity::create([
            'quotation_id' => $lead4->id,
            'user_id' => $admin->id,
            'note' => 'Penawaran dikirim via email beserta purchase order template.',
            'activity_type' => 'email',
            'created_at' => $now->copy()->subDays(9),
        ]);

        QuotationActivity::create([
            'quotation_id' => $lead4->id,
            'user_id' => $admin->id,
            'note' => 'Status diubah ke Deal. Customer telah mengirimkan DP 50% sebesar Rp 7.750.000 via transfer bank.',
            'activity_type' => 'status_change',
            'created_at' => $now->copy()->subDays(8),
        ]);

        // Lead 5: Lost Lead
        $lead5 = Quotation::create([
            'package_id' => $pMawaddah->id,
            'package_name_snapshot' => $pMawaddah->name,
            'price_per_pax_snapshot' => $pMawaddah->price_per_pax,
            'pax' => 200,
            'addon_ids' => [$addonModels[0]->id], // Tenda
            'addon_snapshot' => [
                ['name' => $addonModels[0]->name, 'pricing_type' => $addonModels[0]->pricing_type, 'price' => $addonModels[0]->price], // 5M
            ],
            'event_date' => $now->copy()->addMonths(5)->toDateString(),
            'event_location' => 'Rumah Kediaman Pamulang',
            'subtotal' => (75000.00 * 200) + 5000000.00, // 15M + 5M = 20M
            'discount' => 0.00,
            'total_estimate' => 20000000.00,
            'customer_name' => 'Dewi Lestari',
            'customer_phone' => '085611223344',
            'customer_email' => 'dewi.lestari@gmail.com',
            'notes' => 'Acara arisan keluarga besar.',
            'source' => 'web',
            'status' => 'lost',
            'assigned_to' => $admin->id,
            'lost_reason' => 'Harga terlalu tinggi',
            'created_at' => $now->copy()->subDays(12),
        ]);

        QuotationActivity::create([
            'quotation_id' => $lead5->id,
            'user_id' => $admin->id,
            'note' => 'Menghubungi customer via WA. Customer merasa budget 20 juta terlalu mahal untuk katering arisan keluarga dan memilih vendor lain yang lebih ekonomis.',
            'activity_type' => 'status_change',
            'created_at' => $now->copy()->subDays(10),
        ]);

        // Generate more historical leads to make charts look great (especially Reports)
        // Let's seed 15 more leads spread over the last 3 months
        $months = [3, 2, 1, 0];
        $statuses = ['deal', 'lost', 'negotiation', 'contacted', 'new'];
        $lostReasons = ['Harga terlalu tinggi', 'Sudah pakai vendor lain', 'Batal acara', 'Kurang cocok menu'];
        $names = ['Siska', 'Aditya', 'Rian', 'Denny', 'Melati', 'Wulan', 'Dimas', 'Indra', 'Fitri', 'Bambang', 'Lilis', 'Yusuf', 'Novi', 'Fajar', 'Toni'];

        foreach ($names as $index => $name) {
            $monthOffset = $months[$index % count($months)];
            $status = $statuses[$index % count($statuses)];
            $assigned = ($status === 'new') ? null : $admin->id;
            $lostReason = ($status === 'lost') ? $lostReasons[$index % count($lostReasons)] : null;
            $pkg = ($index % 2 === 0) ? $pMawaddah : $pSakinah;
            $pax = 150 + ($index * 25);
            $sub = $pkg->price_per_pax * $pax;
            $disc = ($pax >= 250) ? $sub * 0.05 : 0;
            $total = $sub - $disc;

            Quotation::create([
                'package_id' => $pkg->id,
                'package_name_snapshot' => $pkg->name,
                'price_per_pax_snapshot' => $pkg->price_per_pax,
                'pax' => $pax,
                'addon_ids' => [],
                'addon_snapshot' => [],
                'event_date' => $now->copy()->subMonths($monthOffset)->addDays($index)->toDateString(),
                'event_location' => 'Kota Jakarta',
                'subtotal' => $sub,
                'discount' => $disc,
                'total_estimate' => $total,
                'customer_name' => $name,
                'customer_phone' => '0898000011' . sprintf('%02d', $index),
                'customer_email' => strtolower($name) . '@example.com',
                'notes' => 'Acara katering seeded.',
                'source' => ($index % 3 === 0) ? 'whatsapp' : (($index % 3 === 1) ? 'web' : 'manual'),
                'status' => $status,
                'assigned_to' => $assigned,
                'lost_reason' => $lostReason,
                'created_at' => $now->copy()->subMonths($monthOffset)->subDays(10 - $index),
            ]);
        }

        // 10. Create Default Settings
        \App\Models\Setting::create(['key' => 'contact_whatsapp', 'value' => '6281234567890']);
        \App\Models\Setting::create(['key' => 'contact_email', 'value' => 'info@dewandarucatering.com']);
        \App\Models\Setting::create(['key' => 'contact_address', 'value' => 'Jl. Kebun Raya No. 10, Bogor, Jawa Barat']);
        \App\Models\Setting::create(['key' => 'whatsapp_template', 'value' => "Halo Admin Dewandaru Catering, saya ingin mengkonfirmasi simulasi estimasi biaya catering saya:\n\n*Nama:* {name}\n*No HP:* {phone}\n*Paket:* {package} ({pax} pax)\n*Tanggal Acara:* {event_date}\n*Lokasi:* {location}\n*Add-ons:* {addons}\n*Estimasi Total:* Rp {total_estimate}\n\nMohon dibantu untuk kelanjutan pemesanan."]);
        \App\Models\Setting::create(['key' => 'notification_emails', 'value' => 'admin@catering.com,finance@catering.com']);
    }
}
