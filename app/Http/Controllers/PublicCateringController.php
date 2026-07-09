<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Addon;
use App\Models\Package;
use App\Models\PricingTier;
use App\Models\Quotation;
use App\Models\Setting;
use App\Models\Testimonial;
use App\Models\Gallery;
use App\Models\Contact;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PublicCateringController extends Controller
{
    public function categories()
    {
        $categories = Category::with(['packages' => function ($query) {
            $query->where('is_active', true)->with(['menuItems', 'pricingTiers']);
        }])->get();

        return response()->json($categories);
    }

    public function packages(Request $request)
    {
        $query = Package::where('is_active', true)->with(['category', 'menuItems', 'pricingTiers']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('sort')) {
            if ($request->sort === 'price_asc') {
                $query->orderBy('price_per_pax', 'asc');
            } elseif ($request->sort === 'price_desc') {
                $query->orderBy('price_per_pax', 'desc');
            }
        }

        return response()->json($query->get());
    }

    public function packageDetail($slug)
    {
        $package = Package::where('slug', $slug)
            ->where('is_active', true)
            ->with(['category', 'menuItems', 'pricingTiers'])
            ->firstOrFail();

        return response()->json($package);
    }

    public function addons()
    {
        $addons = Addon::all();
        return response()->json($addons);
    }

    public function estimatePrice(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'required|exists:packages,id',
            'pax' => 'required|integer|min:1',
            'addon_ids' => 'nullable|array',
            'addon_ids.*' => 'exists:addons,id',
        ]);

        $package = Package::findOrFail($validated['package_id']);
        $pax = $validated['pax'];

        // Validate pax constraints
        if ($pax < $package->min_pax) {
            return response()->json([
                'message' => "Jumlah tamu minimum untuk paket ini adalah {$package->min_pax} pax."
            ], 422);
        }
        if ($package->max_pax && $pax > $package->max_pax) {
            return response()->json([
                'message' => "Jumlah tamu maksimum untuk paket ini adalah {$package->max_pax} pax."
            ], 422);
        }

        $packageSubtotal = $package->price_per_pax * $pax;
        $addonSubtotal = 0;
        $addonBreakdown = [];
        $addonIds = $validated['addon_ids'] ?? [];

        if (!empty($addonIds)) {
            $addons = Addon::whereIn('id', $addonIds)->get();
            foreach ($addons as $addon) {
                $price = $addon->price;
                $cost = $addon->pricing_type === 'per_pax' ? $price * $pax : $price;
                $addonSubtotal += $cost;
                $addonBreakdown[] = [
                    'id' => $addon->id,
                    'name' => $addon->name,
                    'pricing_type' => $addon->pricing_type,
                    'price' => $price,
                    'calculated_cost' => $cost
                ];
            }
        }

        $subtotal = $packageSubtotal + $addonSubtotal;

        // Calculate discount
        $discountPercent = 0;
        $packageTier = PricingTier::where('package_id', $package->id)
            ->where('min_pax', '<=', $pax)
            ->orderBy('min_pax', 'desc')
            ->first();

        if ($packageTier) {
            $discountPercent = $packageTier->discount_percent;
        } else {
            $globalTier = PricingTier::whereNull('package_id')
                ->where('min_pax', '<=', $pax)
                ->orderBy('min_pax', 'desc')
                ->first();

            if ($globalTier) {
                $discountPercent = $globalTier->discount_percent;
            }
        }

        $discountAmount = 0;
        if ($discountPercent > 0) {
            $discountAmount = $subtotal * ($discountPercent / 100);
        }

        $totalEstimate = $subtotal - $discountAmount;

        return response()->json([
            'pax' => $pax,
            'package_cost' => $packageSubtotal,
            'addons_cost' => $addonSubtotal,
            'addon_breakdown' => $addonBreakdown,
            'subtotal' => $subtotal,
            'discount_percent' => $discountPercent,
            'discount_amount' => $discountAmount,
            'total_estimate' => $totalEstimate,
        ]);
    }

    public function createQuotation(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'required|exists:packages,id',
            'pax' => 'required|integer|min:1',
            'addon_ids' => 'nullable|array',
            'addon_ids.*' => 'exists:addons,id',
            'event_date' => 'required|date|after_or_equal:today',
            'event_location' => 'nullable|string',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:50',
            'customer_email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
        ]);

        $package = Package::findOrFail($validated['package_id']);
        $pax = $validated['pax'];

        // Validate pax constraints
        if ($pax < $package->min_pax) {
            return response()->json([
                'message' => "Jumlah tamu minimum untuk paket ini adalah {$package->min_pax} pax."
            ], 422);
        }
        if ($package->max_pax && $pax > $package->max_pax) {
            return response()->json([
                'message' => "Jumlah tamu maksimum untuk paket ini adalah {$package->max_pax} pax."
            ], 422);
        }

        // Calculate package price
        $packageSubtotal = $package->price_per_pax * $pax;

        // Calculate addons price & snapshot
        $addonSubtotal = 0;
        $addonSnapshot = [];
        $addonIds = $validated['addon_ids'] ?? [];

        if (!empty($addonIds)) {
            $addons = Addon::whereIn('id', $addonIds)->get();
            foreach ($addons as $addon) {
                $price = $addon->price;
                $cost = $addon->pricing_type === 'per_pax' ? $price * $pax : $price;
                $addonSubtotal += $cost;
                $addonSnapshot[] = [
                    'id' => $addon->id,
                    'name' => $addon->name,
                    'pricing_type' => $addon->pricing_type,
                    'price' => $price,
                    'calculated_cost' => $cost
                ];
            }
        }

        $subtotal = $packageSubtotal + $addonSubtotal;

        // Calculate discount
        $discountPercent = 0;
        $packageTier = PricingTier::where('package_id', $package->id)
            ->where('min_pax', '<=', $pax)
            ->orderBy('min_pax', 'desc')
            ->first();

        if ($packageTier) {
            $discountPercent = $packageTier->discount_percent;
        } else {
            $globalTier = PricingTier::whereNull('package_id')
                ->where('min_pax', '<=', $pax)
                ->orderBy('min_pax', 'desc')
                ->first();

            if ($globalTier) {
                $discountPercent = $globalTier->discount_percent;
            }
        }

        $discountAmount = 0;
        if ($discountPercent > 0) {
            $discountAmount = $subtotal * ($discountPercent / 100);
        }

        $totalEstimate = $subtotal - $discountAmount;

        // Save Quotation (Lead)
        $quotation = Quotation::create([
            'package_id' => $package->id,
            'package_name_snapshot' => $package->name,
            'price_per_pax_snapshot' => $package->price_per_pax,
            'pax' => $pax,
            'addon_ids' => $addonIds,
            'addon_snapshot' => $addonSnapshot,
            'event_date' => $validated['event_date'],
            'event_location' => $validated['event_location'] ?? null,
            'subtotal' => $subtotal,
            'discount' => $discountAmount,
            'total_estimate' => $totalEstimate,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_email' => $validated['customer_email'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'source' => 'web',
            'status' => 'new',
            'assigned_to' => null,
            'lost_reason' => null,
        ]);

        // Generate WA message link
        $waNumber = Setting::getByKey('contact_whatsapp', '6281234567890');
        $waTemplate = Setting::getByKey('whatsapp_template', "Halo Admin Catering, saya ingin mengkonfirmasi simulasi katering saya:\n\n*Nama:* {name}\n*Paket:* {package}\n*Total:* Rp {total_estimate}");

        $addonsText = 'Tidak ada';
        if (!empty($addonSnapshot)) {
            $addonsText = implode(', ', array_map(fn($a) => $a['name'], $addonSnapshot));
        }

        $replacements = [
            '{name}' => $quotation->customer_name,
            '{phone}' => $quotation->customer_phone,
            '{package}' => $quotation->package_name_snapshot,
            '{pax}' => $quotation->pax,
            '{event_date}' => Carbon::parse($quotation->event_date)->format('d-m-Y'),
            '{location}' => $quotation->event_location ?? '-',
            '{addons}' => $addonsText,
            '{total_estimate}' => number_format($quotation->total_estimate, 0, ',', '.')
        ];

        $waMessage = str_replace(array_keys($replacements), array_values($replacements), $waTemplate);
        $waUrl = "https://wa.me/{$waNumber}?text=" . urlencode($waMessage);

        return response()->json([
            'message' => 'Simulasi berhasil disimpan sebagai lead baru.',
            'quotation' => $quotation,
            'whatsapp_url' => $waUrl
        ], 201);
    }

    public function testimonials()
    {
        return response()->json(Testimonial::where('is_published', true)->get());
    }

    public function galleries()
    {
        return response()->json(Gallery::where('is_published', true)->get());
    }

    public function contactSubmit(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'message' => 'required|string',
        ]);

        $contact = Contact::create($validated);

        return response()->json([
            'message' => 'Pesan Anda berhasil terkirim. Admin kami akan segera menghubungi Anda.',
            'contact' => $contact
        ], 201);
    }
}
