<?php

namespace App\Http\Controllers;

use App\Models\PricingTier;
use App\Models\Package;
use Illuminate\Http\Request;

class AdminPricingTierController extends Controller
{
    public function index()
    {
        return response()->json(PricingTier::with('package')->orderBy('min_pax', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'nullable|exists:packages,id',
            'min_pax' => 'required|integer|min:1',
            'discount_percent' => 'required|numeric|min:0|max:100',
        ]);

        $tier = PricingTier::create($validated);

        return response()->json([
            'message' => 'Pricing tier berhasil ditambahkan.',
            'pricing_tier' => $tier->load('package')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tier = PricingTier::findOrFail($id);

        $validated = $request->validate([
            'package_id' => 'nullable|exists:packages,id',
            'min_pax' => 'required|integer|min:1',
            'discount_percent' => 'required|numeric|min:0|max:100',
        ]);

        $tier->update($validated);

        return response()->json([
            'message' => 'Pricing tier berhasil diperbarui.',
            'pricing_tier' => $tier->load('package')
        ]);
    }

    public function destroy($id)
    {
        $tier = PricingTier::findOrFail($id);
        $tier->delete();

        return response()->json([
            'message' => 'Pricing tier berhasil dihapus.'
        ]);
    }

    public function preview(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'nullable|exists:packages,id',
            'pax' => 'required|integer|min:1',
        ]);

        $pax = $validated['pax'];
        $packageId = $validated['package_id'];

        $pricePerPax = 0;
        $packageName = 'Custom / Global';
        
        if ($packageId) {
            $package = Package::find($packageId);
            if ($package) {
                $pricePerPax = (float)$package->price_per_pax;
                $packageName = $package->name;
            }
        } else {
            // Fallback default mock price if no package is chosen
            $pricePerPax = 50000;
        }

        $subtotal = $pricePerPax * $pax;

        // Find applicable discount tier
        $discountPercent = 0;
        
        if ($packageId) {
            $packageTier = PricingTier::where('package_id', $packageId)
                ->where('min_pax', '<=', $pax)
                ->orderBy('min_pax', 'desc')
                ->first();
            
            if ($packageTier) {
                $discountPercent = (float)$packageTier->discount_percent;
            }
        }

        // If no package-specific tier matches, look for global tier
        if ($discountPercent == 0) {
            $globalTier = PricingTier::whereNull('package_id')
                ->where('min_pax', '<=', $pax)
                ->orderBy('min_pax', 'desc')
                ->first();
            
            if ($globalTier) {
                $discountPercent = (float)$globalTier->discount_percent;
            }
        }

        $discountAmount = $subtotal * ($discountPercent / 100);
        $total = $subtotal - $discountAmount;

        return response()->json([
            'pax' => $pax,
            'package_name' => $packageName,
            'price_per_pax' => $pricePerPax,
            'subtotal' => $subtotal,
            'discount_percent' => $discountPercent,
            'discount_amount' => $discountAmount,
            'total_estimate' => $total,
        ]);
    }
}
