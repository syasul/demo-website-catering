<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\MenuItem;
use App\Models\Addon;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class AdminCateringController extends Controller
{
    // === CATEGORIES ===
    public function listCategories()
    {
        return response()->json(Category::all());
    }

    // === PACKAGES ===
    public function listPackages()
    {
        $packages = Package::with(['category', 'menuItems'])->get();
        return response()->json($packages);
    }

    public function storePackage(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_per_pax' => 'required|numeric|min:0',
            'min_pax' => 'required|integer|min:1',
            'max_pax' => 'nullable|integer|gt:min_pax',
            'is_active' => 'required|boolean',
            'menu_ids' => 'nullable|array',
            'menu_ids.*' => 'exists:menu_items,id',
            'thumbnail' => 'nullable|string', // Support direct URL string for simplicity in demo, or file upload
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . rand(100, 999);
        
        $package = Package::create($validated);

        if (!empty($validated['menu_ids'])) {
            $package->menuItems()->sync($validated['menu_ids']);
        }

        return response()->json([
            'message' => 'Paket catering berhasil ditambahkan.',
            'package' => $package->load(['category', 'menuItems'])
        ], 201);
    }

    public function updatePackage(Request $request, $id)
    {
        $package = Package::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_per_pax' => 'required|numeric|min:0',
            'min_pax' => 'required|integer|min:1',
            'max_pax' => 'nullable|integer|gt:min_pax',
            'is_active' => 'required|boolean',
            'menu_ids' => 'nullable|array',
            'menu_ids.*' => 'exists:menu_items,id',
            'thumbnail' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . rand(100, 999);

        $package->update($validated);

        if (isset($validated['menu_ids'])) {
            $package->menuItems()->sync($validated['menu_ids']);
        } else {
            $package->menuItems()->detach();
        }

        return response()->json([
            'message' => 'Paket catering berhasil diperbarui.',
            'package' => $package->load(['category', 'menuItems'])
        ]);
    }

    public function destroyPackage($id)
    {
        $package = Package::findOrFail($id);
        $package->delete();

        return response()->json([
            'message' => 'Paket catering berhasil dihapus.'
        ]);
    }

    public function duplicatePackage($id)
    {
        $original = Package::findOrFail($id);
        
        $duplicate = $original->replicate();
        $duplicate->name = $original->name . ' (Salinan)';
        $duplicate->slug = Str::slug($duplicate->name) . '-' . rand(100, 999);
        $duplicate->is_active = false; // Draft by default
        $duplicate->save();

        // Copy pivot menus
        $menuIds = $original->menuItems->pluck('id')->toArray();
        $duplicate->menuItems()->sync($menuIds);

        return response()->json([
            'message' => 'Paket catering berhasil diduplikat sebagai draf.',
            'package' => $duplicate->load(['category', 'menuItems'])
        ], 201);
    }

    // === MENU ITEMS ===
    public function listMenuItems()
    {
        return response()->json(MenuItem::all());
    }

    public function storeMenuItem(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:main_course,snack,dessert,beverage',
        ]);

        $menuItem = MenuItem::create($validated);

        return response()->json([
            'message' => 'Item menu berhasil ditambahkan.',
            'menu_item' => $menuItem
        ], 201);
    }

    public function updateMenuItem(Request $request, $id)
    {
        $menuItem = MenuItem::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:main_course,snack,dessert,beverage',
        ]);

        $menuItem->update($validated);

        return response()->json([
            'message' => 'Item menu berhasil diperbarui.',
            'menu_item' => $menuItem
        ]);
    }

    public function destroyMenuItem($id)
    {
        $menuItem = MenuItem::findOrFail($id);
        $menuItem->delete();

        return response()->json([
            'message' => 'Item menu berhasil dihapus.'
        ]);
    }

    // === ADDONS ===
    public function listAddons()
    {
        return response()->json(Addon::all());
    }

    public function storeAddon(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'pricing_type' => 'required|in:flat,per_pax',
            'price' => 'required|numeric|min:0',
        ]);

        $addon = Addon::create($validated);

        return response()->json([
            'message' => 'Addon berhasil ditambahkan.',
            'addon' => $addon
        ], 201);
    }

    public function updateAddon(Request $request, $id)
    {
        $addon = Addon::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'pricing_type' => 'required|in:flat,per_pax',
            'price' => 'required|numeric|min:0',
        ]);

        $addon->update($validated);

        return response()->json([
            'message' => 'Addon berhasil diperbarui.',
            'addon' => $addon
        ]);
    }

    public function destroyAddon($id)
    {
        $addon = Addon::findOrFail($id);
        $addon->delete();

        return response()->json([
            'message' => 'Addon berhasil dihapus.'
        ]);
    }
}
