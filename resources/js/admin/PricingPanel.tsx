import React, { useState, useEffect } from 'react';
import type { User, Package } from '../types';
import { Plus, Edit3, Trash2, X } from 'lucide-react';

export const PricingPanel: React.FC<{ user: User }> = ({ user }) => {
    const [tiers, setTiers] = useState<any[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);

    // Form modal state
    const [showForm, setShowForm] = useState(false);
    const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
    const [form, setForm] = useState({
        package_id: '',
        min_pax: '250',
        discount_percent: '5.00'
    });

    // Preview simulator state
    const [simForm, setSimForm] = useState({
        package_id: '',
        pax: '250'
    });
    const [simResult, setSimResult] = useState<any>(null);
    const [simLoading, setSimLoading] = useState(false);

    useEffect(() => {
        fetchPricingData();
    }, []);

    const fetchPricingData = async () => {
        setLoading(true);
        try {
            const tiersRes = await fetch('/api/admin/pricing-tiers');
            if (tiersRes.ok) setTiers(await tiersRes.json());

            const pkgsRes = await fetch('/api/admin/packages');
            if (pkgsRes.ok) {
                const pkgsData = await pkgsRes.json();
                setPackages(pkgsData);
                if (pkgsData.length > 0) {
                    setSimForm(prev => ({ ...prev, package_id: pkgsData[0].id.toString() }));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = selectedTierId ? 'PUT' : 'POST';
            const url = selectedTierId ? `/api/admin/pricing-tiers/${selectedTierId}` : '/api/admin/pricing-tiers';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    package_id: form.package_id ? Number(form.package_id) : null,
                    min_pax: Number(form.min_pax),
                    discount_percent: Number(form.discount_percent)
                })
            });

            if (res.ok) {
                setShowForm(false);
                setSelectedTierId(null);
                setForm({ package_id: '', min_pax: '250', discount_percent: '5.00' });
                fetchPricingData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteTier = async (id: number) => {
        if (!confirm('Hapus tier diskon ini?')) return;
        try {
            const res = await fetch(`/api/admin/pricing-tiers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchPricingData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSimulation = async (e: React.FormEvent) => {
        e.preventDefault();
        setSimLoading(true);
        try {
            const res = await fetch('/api/admin/pricing-tiers/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    package_id: simForm.package_id ? Number(simForm.package_id) : null,
                    pax: Number(simForm.pax)
                })
            });

            if (res.ok) {
                setSimResult(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSimLoading(false);
        }
    };

    const isReadOnly = user.role === 'admin';

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-xs">
            
            {/* PRICING TIERS LISTING */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="font-utility text-[9px] uppercase tracking-widest text-gold font-bold">Harga & Diskon</span>
                        <h3 className="font-display text-xl font-bold text-forest mt-0.5">Tingkatan Diskon Tamu (Pricing Tiers)</h3>
                        <div className="h-0.5 w-16 bg-gold mt-2"></div>
                    </div>

                    {!isReadOnly && (
                        <button 
                            onClick={() => {
                                setSelectedTierId(null);
                                setForm({ package_id: '', min_pax: '250', discount_percent: '5.00' });
                                setShowForm(true);
                            }}
                            className="bg-forest text-paper hover:bg-gold hover:text-forest px-4 py-2 text-xs font-bold uppercase tracking-wider border border-gold flex items-center gap-2"
                        >
                            <Plus size={14} />
                            Tambah Tier
                        </button>
                    )}
                </div>

                <div className="bg-paper border border-forest/10 shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-forest/5 border-b border-forest/10 text-xs font-utility uppercase tracking-wider text-forest/70">
                                <th className="p-4">Cakupan Paket</th>
                                <th className="p-4">Ambang Batas Tamu</th>
                                <th className="p-4">Persentase Diskon</th>
                                {!isReadOnly && <th className="p-4">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-forest/10 text-xs font-utility">
                            {tiers.map((tier) => (
                                <tr key={tier.id}>
                                    <td className="p-4 font-sans font-bold text-forest">
                                        {tier.package ? tier.package.name : 'Global (Semua Paket)'}
                                    </td>
                                    <td className="p-4">&ge; {tier.min_pax} Pax</td>
                                    <td className="p-4 font-bold text-sage">{tier.discount_percent}%</td>
                                    {!isReadOnly && (
                                        <td className="p-4 flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedTierId(tier.id);
                                                    setForm({
                                                        package_id: tier.package_id ? tier.package_id.toString() : '',
                                                        min_pax: tier.min_pax.toString(),
                                                        discount_percent: tier.discount_percent.toString()
                                                    });
                                                    setShowForm(true);
                                                }}
                                                className="p-1 border border-forest/10 hover:border-gold hover:text-gold"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => deleteTier(tier.id)}
                                                className="p-1 border border-forest/10 hover:border-red-500 hover:text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {tiers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-forest/50 italic font-sans">
                                        Belum ada tingkatan diskon ditentukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SIMULATOR WIDGET */}
            <div className="lg:col-span-4 bg-paper border border-forest p-6 shadow-xl relative self-start">
                <div className="absolute top-2 left-2 right-2 bottom-2 border border-gold/15 pointer-events-none"></div>
                
                <h4 className="font-display font-bold text-base text-forest mb-4 border-b border-forest/10 pb-2">
                    Coba Simulasi Diskon
                </h4>

                <form onSubmit={handleSimulation} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-forest/60">Pilih Paket</label>
                        <select 
                            value={simForm.package_id} 
                            onChange={(e) => setSimForm(prev => ({ ...prev, package_id: e.target.value }))}
                            className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                        >
                            {packages.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-forest/60">Jumlah Tamu (Pax)</label>
                        <input 
                            type="number" 
                            value={simForm.pax}
                            onChange={(e) => setSimForm(prev => ({ ...prev, pax: e.target.value }))}
                            required
                            min={1}
                            className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold font-utility"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={simLoading}
                        className="w-full bg-forest text-paper hover:bg-gold hover:text-forest py-2.5 font-bold uppercase tracking-widest text-[10px] border border-gold shadow-sm transition-colors disabled:opacity-50"
                    >
                        {simLoading ? 'Menghitung...' : 'Simulasikan'}
                    </button>
                </form>

                {simResult && (
                    <div className="mt-6 border-t border-forest/10 pt-4 space-y-3 font-utility text-[11px] bg-forest/5 p-3 border border-forest/10">
                        <div className="flex justify-between">
                            <span className="text-forest/60">Harga Base/Pax:</span>
                            <span className="font-bold">Rp {simResult.price_per_pax.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-forest/60">Tamu:</span>
                            <span className="font-bold">{simResult.pax} pax</span>
                        </div>
                        <div className="flex justify-between border-t border-forest/10/30 pt-2">
                            <span className="text-forest/60">Subtotal:</span>
                            <span className="font-bold">Rp {simResult.subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sage">
                            <span className="font-bold">Diskon ({simResult.discount_percent}%):</span>
                            <span className="font-bold">-Rp {simResult.discount_amount.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between border-t border-double border-forest/40 pt-2 text-xs text-maroon font-bold">
                            <span>TOTAL ESTIMASI:</span>
                            <span>Rp {simResult.total_estimate.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* FORM MODAL: ADD/EDIT PRICING TIER */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-forest/80 flex justify-center items-center p-6 backdrop-blur-sm animate-fade-in">
                    <div className="max-w-md w-full bg-paper border border-gold p-8 shadow-2xl relative">
                        <div className="absolute top-2 left-2 right-2 bottom-2 border border-gold/15 pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-display text-xl font-bold">{selectedTierId ? 'Edit Tier Diskon' : 'Tambah Tier Diskon'}</h3>
                            <button onClick={() => setShowForm(false)} className="p-2 border border-forest/10 hover:border-red-500 hover:text-red-500">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-forest/60">Cakupan Paket Catering *</label>
                                <select 
                                    value={form.package_id} 
                                    onChange={(e) => setForm(prev => ({ ...prev, package_id: e.target.value }))}
                                    className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                >
                                    <option value="">Global (Semua Paket)</option>
                                    {packages.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-forest/60">Ambang Batas Tamu (Min Pax) *</label>
                                    <input 
                                        type="number" 
                                        value={form.min_pax} 
                                        onChange={(e) => setForm(prev => ({ ...prev, min_pax: e.target.value }))}
                                        required
                                        min={1}
                                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold font-utility"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-forest/60">Persentase Diskon (%) *</label>
                                    <input 
                                        type="number" 
                                        value={form.discount_percent} 
                                        onChange={(e) => setForm(prev => ({ ...prev, discount_percent: e.target.value }))}
                                        required
                                        min={0}
                                        max={100}
                                        step="0.01"
                                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold font-utility"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setShowForm(false)}
                                    className="border border-forest text-forest hover:bg-forest/5 px-6 py-2 font-bold uppercase tracking-wider"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-maroon text-paper border border-gold shadow-md hover:bg-maroon/90 px-6 py-2 font-bold uppercase tracking-wider"
                                >
                                    Simpan Tier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
