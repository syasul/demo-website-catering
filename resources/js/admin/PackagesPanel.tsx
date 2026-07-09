import React, { useState, useEffect } from 'react';
import type { User, Package, MenuItem, Addon, Category } from '../types';
import { Plus, Edit3, Copy, Trash2, X } from 'lucide-react';

export const PackagesPanel: React.FC<{ user: User }> = ({ user }) => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [addons, setAddons] = useState<Addon[]>([]);
    const [loading, setLoading] = useState(true);

    // Active sub tab: packages, menus, addons
    const [subTab, setSubTab] = useState<'packages' | 'menus' | 'addons'>('packages');

    // Packages states
    const [showPackageForm, setShowPackageForm] = useState(false);
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pkgForm, setPkgForm] = useState({
        category_id: '',
        name: '',
        description: '',
        price_per_pax: '',
        min_pax: '250',
        max_pax: '',
        is_active: true,
        menu_ids: [] as number[],
        thumbnail: ''
    });

    // Menus states
    const [showMenuForm, setShowMenuForm] = useState(false);
    const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
    const [menuForm, setMenuForm] = useState({
        name: '',
        type: 'main_course' as any
    });

    // Addons states
    const [showAddonForm, setShowAddonForm] = useState(false);
    const [selectedAddonId, setSelectedAddonId] = useState<number | null>(null);
    const [addonForm, setAddonForm] = useState({
        name: '',
        pricing_type: 'flat' as any,
        price: ''
    });

    useEffect(() => {
        fetchCateringData();
    }, []);

    const fetchCateringData = async () => {
        setLoading(true);
        try {
            const pkgRes = await fetch('/api/admin/packages');
            if (pkgRes.ok) setPackages(await pkgRes.json());

            const menuRes = await fetch('/api/admin/menu-items');
            if (menuRes.ok) setMenus(await menuRes.json());

            const addonRes = await fetch('/api/admin/addons');
            if (addonRes.ok) setAddons(await addonRes.json());

            const catRes = await fetch('/api/admin/categories');
            if (catRes.ok) setCategories(await catRes.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // PACKAGE SUBMIT
    const handlePackageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = selectedPackageId ? 'PUT' : 'POST';
            const url = selectedPackageId ? `/api/admin/packages/${selectedPackageId}` : '/api/admin/packages';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(pkgForm)
            });

            if (res.ok) {
                setShowPackageForm(false);
                setSelectedPackageId(null);
                setPkgForm({
                    category_id: '',
                    name: '',
                    description: '',
                    price_per_pax: '',
                    min_pax: '250',
                    max_pax: '',
                    is_active: true,
                    menu_ids: [],
                    thumbnail: ''
                });
                fetchCateringData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const duplicatePackage = async (id: number) => {
        if (!confirm('Duplikat paket ini?')) return;
        try {
            const res = await fetch(`/api/admin/packages/${id}/duplicate`, { method: 'POST' });
            if (res.ok) {
                fetchCateringData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deletePackage = async (id: number) => {
        if (!confirm('Hapus paket ini?')) return;
        try {
            const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCateringData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // MENU SUBMIT
    const handleMenuSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = selectedMenuId ? 'PUT' : 'POST';
            const url = selectedMenuId ? `/api/admin/menu-items/${selectedMenuId}` : '/api/admin/menu-items';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(menuForm)
            });

            if (res.ok) {
                setShowMenuForm(false);
                setSelectedMenuId(null);
                setMenuForm({ name: '', type: 'main_course' });
                fetchCateringData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteMenuItem = async (id: number) => {
        if (!confirm('Hapus menu ini?')) return;
        try {
            const res = await fetch(`/api/admin/menu-items/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCateringData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // ADDON SUBMIT
    const handleAddonSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = selectedAddonId ? 'PUT' : 'POST';
            const url = selectedAddonId ? `/api/admin/addons/${selectedAddonId}` : '/api/admin/addons';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(addonForm)
            });

            if (res.ok) {
                setShowAddonForm(false);
                setSelectedAddonId(null);
                setAddonForm({ name: '', pricing_type: 'flat', price: '' });
                fetchCateringData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteAddon = async (id: number) => {
        if (!confirm('Hapus addon ini?')) return;
        try {
            const res = await fetch(`/api/admin/addons/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCateringData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const isReadOnly = user.role === 'finance';

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Sub-Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-forest/5 border border-forest/10 p-0.5">
                    <button 
                        onClick={() => setSubTab('packages')} 
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${subTab === 'packages' ? 'bg-forest text-paper' : 'text-forest/60'}`}
                    >
                        Catering Packages
                    </button>
                    <button 
                        onClick={() => setSubTab('menus')} 
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${subTab === 'menus' ? 'bg-forest text-paper' : 'text-forest/60'}`}
                    >
                        Menu Items
                    </button>
                    <button 
                        onClick={() => setSubTab('addons')} 
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${subTab === 'addons' ? 'bg-forest text-paper' : 'text-forest/60'}`}
                    >
                        Add-ons
                    </button>
                </div>

                {!isReadOnly && (
                    <div className="flex gap-2">
                        {subTab === 'packages' && (
                            <button 
                                onClick={() => {
                                    setSelectedPackageId(null);
                                    setPkgForm({
                                        category_id: categories[0]?.id.toString() || '',
                                        name: '',
                                        description: '',
                                        price_per_pax: '',
                                        min_pax: '250',
                                        max_pax: '',
                                        is_active: true,
                                        menu_ids: [],
                                        thumbnail: ''
                                    });
                                    setShowPackageForm(true);
                                }}
                                className="bg-forest text-paper hover:bg-gold hover:text-forest px-4 py-2.5 text-xs font-bold uppercase tracking-wider border border-gold flex items-center gap-2"
                            >
                                <Plus size={14} />
                                Tambah Paket
                            </button>
                        )}
                        {subTab === 'menus' && (
                            <button 
                                onClick={() => {
                                    setSelectedMenuId(null);
                                    setMenuForm({ name: '', type: 'main_course' });
                                    setShowMenuForm(true);
                                }}
                                className="bg-forest text-paper hover:bg-gold hover:text-forest px-4 py-2.5 text-xs font-bold uppercase tracking-wider border border-gold flex items-center gap-2"
                            >
                                <Plus size={14} />
                                Tambah Item Menu
                            </button>
                        )}
                        {subTab === 'addons' && (
                            <button 
                                onClick={() => {
                                    setSelectedAddonId(null);
                                    setAddonForm({ name: '', pricing_type: 'flat', price: '' });
                                    setShowAddonForm(true);
                                }}
                                className="bg-forest text-paper hover:bg-gold hover:text-forest px-4 py-2.5 text-xs font-bold uppercase tracking-wider border border-gold flex items-center gap-2"
                            >
                                <Plus size={14} />
                                Tambah Add-on
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* SECTION 1: PACKAGES TABLE */}
            {subTab === 'packages' && (
                <div className="bg-paper border border-forest/10 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-forest/5 border-b border-forest/10 text-xs font-utility uppercase tracking-wider">
                                <th className="p-4">Nama Paket</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4">Harga / Pax</th>
                                <th className="p-4">Min/Max Pax</th>
                                <th className="p-4">Status</th>
                                {!isReadOnly && <th className="p-4">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-forest/10 text-xs">
                            {packages.map(pkg => (
                                <tr key={pkg.id}>
                                    <td className="p-4 font-bold">{pkg.name}</td>
                                    <td className="p-4">{(pkg as any).category?.name}</td>
                                    <td className="p-4 font-utility font-bold text-gold">Rp {Number(pkg.price_per_pax).toLocaleString('id-ID')}</td>
                                    <td className="p-4 font-utility">{pkg.min_pax} - {pkg.max_pax || '∞'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${pkg.is_active ? 'bg-sage/10 border-sage text-sage' : 'bg-gray-100 text-gray-400'}`}>
                                            {pkg.is_active ? 'Aktif' : 'Draft'}
                                        </span>
                                    </td>
                                    {!isReadOnly && (
                                        <td className="p-4 flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedPackageId(pkg.id);
                                                    setPkgForm({
                                                        category_id: pkg.category_id.toString(),
                                                        name: pkg.name,
                                                        description: (pkg as any).description || '',
                                                        price_per_pax: pkg.price_per_pax.toString(),
                                                        min_pax: pkg.min_pax.toString(),
                                                        max_pax: pkg.max_pax ? pkg.max_pax.toString() : '',
                                                        is_active: pkg.is_active,
                                                        menu_ids: (pkg as any).menu_items.map((m: any) => m.id),
                                                        thumbnail: (pkg as any).thumbnail || ''
                                                    });
                                                    setShowPackageForm(true);
                                                }}
                                                className="p-1 border border-forest/10 hover:border-gold hover:text-gold"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => duplicatePackage(pkg.id)}
                                                title="Duplikat Paket"
                                                className="p-1 border border-forest/10 hover:border-forest hover:bg-forest/5"
                                            >
                                                <Copy size={14} />
                                            </button>
                                            <button 
                                                onClick={() => deletePackage(pkg.id)}
                                                className="p-1 border border-forest/10 hover:border-red-500 hover:text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* SECTION 2: MENUS TABLE */}
            {subTab === 'menus' && (
                <div className="bg-paper border border-forest/10 shadow-sm max-w-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-forest/5 border-b border-forest/10 text-xs font-utility uppercase tracking-wider">
                                <th className="p-4">Nama Menu</th>
                                <th className="p-4">Jenis Menu</th>
                                {!isReadOnly && <th className="p-4">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-forest/10 text-xs">
                            {menus.map(item => (
                                <tr key={item.id}>
                                    <td className="p-4 font-bold">{item.name}</td>
                                    <td className="p-4 uppercase font-utility text-[10px] text-forest/60">
                                        {item.type.replace('_', ' ')}
                                    </td>
                                    {!isReadOnly && (
                                        <td className="p-4 flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedMenuId(item.id);
                                                    setMenuForm({ name: item.name, type: item.type });
                                                    setShowMenuForm(true);
                                                }}
                                                className="p-1 border border-forest/10 hover:border-gold hover:text-gold"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => deleteMenuItem(item.id)}
                                                className="p-1 border border-forest/10 hover:border-red-500 hover:text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* SECTION 3: ADDONS TABLE */}
            {subTab === 'addons' && (
                <div className="bg-paper border border-forest/10 shadow-sm max-w-3xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-forest/5 border-b border-forest/10 text-xs font-utility uppercase tracking-wider">
                                <th className="p-4">Nama Add-on</th>
                                <th className="p-4">Skema Harga</th>
                                <th className="p-4">Biaya</th>
                                {!isReadOnly && <th className="p-4">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-forest/10 text-xs">
                            {addons.map(ad => (
                                <tr key={ad.id}>
                                    <td className="p-4 font-bold">{ad.name}</td>
                                    <td className="p-4 uppercase font-utility text-[10px] text-forest/60">{ad.pricing_type}</td>
                                    <td className="p-4 font-utility font-bold text-gold">Rp {Number(ad.price).toLocaleString('id-ID')}</td>
                                    {!isReadOnly && (
                                        <td className="p-4 flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedAddonId(ad.id);
                                                    setAddonForm({ name: ad.name, pricing_type: ad.pricing_type, price: ad.price.toString() });
                                                    setShowAddonForm(true);
                                                }}
                                                className="p-1 border border-forest/10 hover:border-gold hover:text-gold"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => deleteAddon(ad.id)}
                                                className="p-1 border border-forest/10 hover:border-red-500 hover:text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* POPUP FORM: PACKAGE */}
            {showPackageForm && (
                <div className="fixed inset-0 z-50 bg-forest/80 flex justify-center items-center p-6 backdrop-blur-sm animate-fade-in">
                    <div className="max-w-2xl w-full bg-paper border border-gold p-8 shadow-2xl overflow-y-auto max-h-[90vh] relative">
                        <div className="absolute top-2 left-2 right-2 bottom-2 border border-gold/15 pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-display text-xl font-bold">{selectedPackageId ? 'Edit Paket Catering' : 'Tambah Paket Baru'}</h3>
                            <button onClick={() => setShowPackageForm(false)} className="p-2 border border-forest/10 hover:border-red-500 hover:text-red-500">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handlePackageSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-forest/60">Nama Paket *</label>
                                    <input 
                                        type="text" 
                                        value={pkgForm.name} 
                                        onChange={(e) => setPkgForm(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-forest/60">Kategori Acara *</label>
                                    <select 
                                        value={pkgForm.category_id} 
                                        onChange={(e) => setPkgForm(prev => ({ ...prev, category_id: e.target.value }))}
                                        required
                                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-forest/60">Harga per Pax (Rp) *</label>
                                    <input 
                                        type="number" 
                                        value={pkgForm.price_per_pax} 
                                        onChange={(e) => setPkgForm(prev => ({ ...prev, price_per_pax: e.target.value }))}
                                        required
                                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-forest/60">Min Pax *</label>
                                    <input 
                                        type="number" 
                                        value={pkgForm.min_pax} 
                                        onChange={(e) => setPkgForm(prev => ({ ...prev, min_pax: e.target.value }))}
                                        required
                                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-forest/60">Max Pax (Opsional)</label>
                                    <input 
                                        type="number" 
                                        value={pkgForm.max_pax} 
                                        onChange={(e) => setPkgForm(prev => ({ ...prev, max_pax: e.target.value }))}
                                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-forest/60">Deskripsi Paket</label>
                                <textarea 
                                    value={pkgForm.description} 
                                    onChange={(e) => setPkgForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                />
                            </div>

                            {/* Menu Item checkboxes */}
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-forest/60">Tautkan Sajian Menu</label>
                                <div className="border border-forest/10 p-3 max-h-48 overflow-y-auto grid grid-cols-2 gap-2 bg-forest/5">
                                    {menus.map(menu => {
                                        const isChecked = pkgForm.menu_ids.includes(menu.id);
                                        return (
                                            <label key={menu.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-forest/5">
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setPkgForm(prev => ({ ...prev, menu_ids: [...prev.menu_ids, menu.id] }));
                                                        } else {
                                                            setPkgForm(prev => ({ ...prev, menu_ids: prev.menu_ids.filter(id => id !== menu.id) }));
                                                        }
                                                    }}
                                                    className="accent-gold"
                                                />
                                                <span>{menu.name} <span className="text-[8px] text-forest/40 uppercase">({menu.type.replace('_', ' ')})</span></span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <label className="flex items-center gap-2 cursor-pointer font-bold text-[9px] uppercase text-forest/60">
                                    <input 
                                        type="checkbox" 
                                        checked={pkgForm.is_active} 
                                        onChange={(e) => setPkgForm(prev => ({ ...prev, is_active: e.target.checked }))}
                                        className="accent-gold"
                                    />
                                    Publish (Aktif)
                                </label>
                                
                                <div className="flex gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPackageForm(false)}
                                        className="border border-forest text-forest hover:bg-forest/5 px-6 py-2 font-bold uppercase tracking-wider"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit"
                                        className="bg-maroon text-paper border border-gold shadow-md hover:bg-maroon/90 px-6 py-2 font-bold uppercase tracking-wider"
                                    >
                                        Simpan Paket
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* POPUP FORM: MENU ITEM */}
            {showMenuForm && (
                <div className="fixed inset-0 z-50 bg-forest/80 flex justify-center items-center p-6 backdrop-blur-sm animate-fade-in">
                    <div className="max-w-md w-full bg-paper border border-gold p-8 shadow-2xl relative">
                        <div className="absolute top-2 left-2 right-2 bottom-2 border border-gold/15 pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-display text-xl font-bold">{selectedMenuId ? 'Edit Item Menu' : 'Tambah Menu Baru'}</h3>
                            <button onClick={() => setShowMenuForm(false)} className="p-2 border border-forest/10 hover:border-red-500 hover:text-red-500">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleMenuSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-forest/60">Nama Hidangan *</label>
                                <input 
                                    type="text" 
                                    value={menuForm.name} 
                                    onChange={(e) => setMenuForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    placeholder="Contoh: Kambing Guling Pondokan"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-forest/60">Tipe / Kategori Menu *</label>
                                <select 
                                    value={menuForm.type} 
                                    onChange={(e) => setMenuForm(prev => ({ ...prev, type: e.target.value as any }))}
                                    required
                                    className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                >
                                    <option value="main_course">Main Course (Prasmanan)</option>
                                    <option value="snack">Snack / Jajanan</option>
                                    <option value="dessert">Dessert / Pencuci Mulut</option>
                                    <option value="beverage">Beverage / Minuman</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setShowMenuForm(false)}
                                    className="border border-forest text-forest hover:bg-forest/5 px-6 py-2 font-bold uppercase tracking-wider"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-maroon text-paper border border-gold shadow-md hover:bg-maroon/90 px-6 py-2 font-bold uppercase tracking-wider"
                                >
                                    Simpan Menu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* POPUP FORM: ADDON */}
            {showAddonForm && (
                <div className="fixed inset-0 z-50 bg-forest/80 flex justify-center items-center p-6 backdrop-blur-sm animate-fade-in">
                    <div className="max-w-md w-full bg-paper border border-gold p-8 shadow-2xl relative">
                        <div className="absolute top-2 left-2 right-2 bottom-2 border border-gold/15 pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-display text-xl font-bold">{selectedAddonId ? 'Edit Add-on' : 'Tambah Add-on Baru'}</h3>
                            <button onClick={() => setShowAddonForm(false)} className="p-2 border border-forest/10 hover:border-red-500 hover:text-red-500">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleAddonSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-forest/60">Nama Add-on *</label>
                                <input 
                                    type="text" 
                                    value={addonForm.name} 
                                    onChange={(e) => setAddonForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    placeholder="Contoh: VIP Buffet Stall Setup"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-forest/60">Skema Harga *</label>
                                    <select 
                                        value={addonForm.pricing_type} 
                                        onChange={(e) => setAddonForm(prev => ({ ...prev, pricing_type: e.target.value as any }))}
                                        required
                                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    >
                                        <option value="flat">Harga Flat (Sekali Bayar)</option>
                                        <option value="per_pax">Per Pax (Dikalikan Tamu)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-forest/60">Biaya (Rp) *</label>
                                    <input 
                                        type="number" 
                                        value={addonForm.price} 
                                        onChange={(e) => setAddonForm(prev => ({ ...prev, price: e.target.value }))}
                                        required
                                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddonForm(false)}
                                    className="border border-forest text-forest hover:bg-forest/5 px-6 py-2 font-bold uppercase tracking-wider"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-maroon text-paper border border-gold shadow-md hover:bg-maroon/90 px-6 py-2 font-bold uppercase tracking-wider"
                                >
                                    Simpan Add-on
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
