<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Package;
use App\Models\Addon;
use App\Models\PricingTier;
use App\Models\Quotation;
use App\Models\Setting;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CateringCalculatorTest extends TestCase
{
    use RefreshDatabase;

    protected $package;
    protected $flatAddon;
    protected $paxAddon;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create categories and default settings
        $category = Category::create(['name' => 'Wedding', 'slug' => 'wedding']);
        
        Setting::create(['key' => 'contact_whatsapp', 'value' => '6281234567890']);
        Setting::create(['key' => 'whatsapp_template', 'value' => 'Nama: {name}, Total: {total_estimate}']);

        // 2. Create package: Sakinah, price 50000, min 200
        $this->package = Package::create([
            'category_id' => $category->id,
            'name' => 'Paket Sakinah',
            'slug' => 'paket-sakinah',
            'description' => 'Test package',
            'price_per_pax' => 50000.00,
            'min_pax' => 200,
            'max_pax' => 1000,
            'is_active' => true
        ]);

        // 3. Create addons:
        // Flat addon: 2,000,000
        $this->flatAddon = Addon::create([
            'name' => 'Tenda',
            'pricing_type' => 'flat',
            'price' => 2000000.00
        ]);
        // Per-pax addon: 10,000
        $this->paxAddon = Addon::create([
            'name' => 'Live Cooking',
            'pricing_type' => 'per_pax',
            'price' => 10000.00
        ]);

        // 4. Create pricing tiers (global):
        // pax >= 250 -> 5% discount
        PricingTier::create([
            'package_id' => null,
            'min_pax' => 250,
            'discount_percent' => 5.00
        ]);
    }

    public function test_it_rejects_quotation_below_minimum_pax()
    {
        $response = $this->postJson('/api/quotations', [
            'package_id' => $this->package->id,
            'pax' => 150, // Less than package minimum of 200
            'event_date' => now()->addMonths(1)->toDateString(),
            'customer_name' => 'Test Guest',
            'customer_phone' => '08123456789'
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'message' => 'Jumlah tamu minimum untuk paket ini adalah 200 pax.'
        ]);
    }

    public function test_it_calculates_price_without_discount_for_low_pax()
    {
        // 200 pax (minimum, no discount since threshold is 250)
        // No addons
        $response = $this->postJson('/api/quotations', [
            'package_id' => $this->package->id,
            'pax' => 200,
            'event_date' => now()->addMonths(1)->toDateString(),
            'customer_name' => 'Test Guest',
            'customer_phone' => '08123456789'
        ]);

        $response->assertStatus(201);
        
        $quotation = Quotation::first();
        $this->assertNotNull($quotation);
        
        // Price should be 200 * 50,000 = 10,000,000
        $this->assertEquals(10000000.00, $quotation->subtotal);
        $this->assertEquals(0.00, $quotation->discount);
        $this->assertEquals(10000000.00, $quotation->total_estimate);
    }

    public function test_it_calculates_subtotal_and_applies_discount_and_addons()
    {
        // 300 pax -> triggers 5% discount (pax >= 250)
        // Addons: Tenda (flat 2,000,000) + Live Cooking (per pax: 10,000 * 300 = 3,000,000)
        // Package cost: 300 * 50,000 = 15,000,000
        // Addon cost: 5,000,000
        // Subtotal = 20,000,000
        // Discount = 5% of 20,000,000 = 1,000,000
        // Total = 19,000,000
        $response = $this->postJson('/api/quotations', [
            'package_id' => $this->package->id,
            'pax' => 300,
            'addon_ids' => [$this->flatAddon->id, $this->paxAddon->id],
            'event_date' => now()->addMonths(1)->toDateString(),
            'customer_name' => 'John Doe',
            'customer_phone' => '08123456789',
            'customer_email' => 'john@example.com'
        ]);

        $response->assertStatus(201);
        
        $quotation = Quotation::first();
        $this->assertNotNull($quotation);
        
        $this->assertEquals(20000000.00, $quotation->subtotal);
        $this->assertEquals(1000000.00, $quotation->discount);
        $this->assertEquals(19000000.00, $quotation->total_estimate);
        
        // Assert snapshot structure
        $this->assertEquals('Paket Sakinah', $quotation->package_name_snapshot);
        $this->assertEquals(50000.00, $quotation->price_per_pax_snapshot);
        $this->assertCount(2, $quotation->addon_snapshot);
    }

    public function test_admin_can_preview_pricing_simulation()
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/pricing-tiers/preview', [
            'package_id' => $this->package->id,
            'pax' => 300,
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'pax' => 300,
            'discount_percent' => 5,
            'discount_amount' => 750000.0, // 5% of (300 * 50000) = 750000
            'total_estimate' => 14250000.0
        ]);
    }
}
