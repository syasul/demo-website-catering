import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Phone, Sparkles, ChevronLeft, Users, Tag } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { AnimatedBlob } from '../components/AnimatedBlob';
import { getPackageThumbnail } from './Home';
import type { Package, Addon } from '../types';

// ── Animated number
const AnimNum: React.FC<{ value: number }> = ({ value }) => {
    const [display, setDisplay] = useState(value);
    useEffect(() => {
        let frame: number;
        const start = display;
        const end = value;
        if (start === end) return;
        const duration = 400;
        const startTime = performance.now();
        const animate = (now: number) => {
            const p = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(start + (end - start) * ease));
            if (p < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [value]);
    return <>{display.toLocaleString('id-ID')}</>;
};

const typeLabels: Record<string, string> = {
    main_course: 'Hidangan Utama',
    snack:       'Snack & Ringan',
    dessert:     'Dessert / Gubukan',
    beverage:    'Minuman',
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

export const PackageDetails: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [pkg, setPkg] = useState<Package | null>(null);
    const [addons, setAddons] = useState<Addon[]>([]);
    const [loading, setLoading] = useState(true);

    // Calculator state
    const [pax, setPax] = useState(250);
    const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
    const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', event_date: '', event_location: '', notes: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState<any>(null);
    const [waUrl, setWaUrl] = useState('');

    // Pricing
    const [price, setPrice] = useState({ packageCost: 0, addonsCost: 0, addonBreakdown: [] as any[], subtotal: 0, discountPct: 0, discountAmt: 0, total: 0 });

    useEffect(() => {
        (async () => {
            try {
                const [pkgRes, addonRes] = await Promise.all([
                    fetch(`/api/packages/${slug}`),
                    fetch('/api/addons'),
                ]);
                if (pkgRes.ok) {
                    const d: Package = await pkgRes.json();
                    setPkg(d);
                    setPax(d.min_pax);
                }
                if (addonRes.ok) setAddons(await addonRes.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [slug]);

    // Recalculate whenever pax or addons change
    useEffect(() => {
        if (!pkg) return;
        const packageCost = Number(pkg.price_per_pax) * pax;
        let addonsCost = 0;
        const addonBreakdown: any[] = [];
        selectedAddons.forEach(id => {
            const a = addons.find(x => x.id === id);
            if (!a) return;
            const cost = a.pricing_type === 'per_pax' ? Number(a.price) * pax : Number(a.price);
            addonsCost += cost;
            addonBreakdown.push({ name: a.name, pricing_type: a.pricing_type, price: Number(a.price), cost });
        });
        const subtotal = packageCost + addonsCost;

        let discountPct = 0;
        const tiers = (pkg.pricing_tiers ?? []).filter((t: any) => Number(t.min_pax) <= pax).sort((a: any, b: any) => b.min_pax - a.min_pax);
        if (tiers[0]) {
            discountPct = Number(tiers[0].discount_percent);
        } else {
            if (pax >= 500) discountPct = 10;
            else if (pax >= 250) discountPct = 5;
        }

        const discountAmt = subtotal * (discountPct / 100);
        setPrice({ packageCost, addonsCost, addonBreakdown, subtotal, discountPct, discountAmt, total: subtotal - discountAmt });
    }, [pkg, pax, selectedAddons, addons]);

    const toggleAddon = useCallback((id: number) => {
        setSelectedAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }, []);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.customer_name.trim()) e.customer_name = 'Nama wajib diisi';
        if (!form.customer_phone.trim()) e.customer_phone = 'No. WhatsApp wajib diisi';
        if (!form.event_date) e.event_date = 'Tanggal acara wajib diisi';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !pkg) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/quotations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ package_id: pkg.id, pax, addon_ids: selectedAddons, ...form }),
            });
            const data = await res.json();
            if (res.ok) {
                setSubmitted(data.quotation);
                setWaUrl(data.whatsapp_url ?? '');
            } else {
                alert(data.message || 'Terjadi kesalahan.');
            }
        } catch {
            alert('Gagal menghubungi server.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-6">
                <div className="skeleton h-64 rounded-2xl w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="skeleton h-80 rounded-2xl" />
                    <div className="skeleton h-80 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!pkg) {
        return (
            <div className="text-center py-32 text-white/40">Paket tidak ditemukan.</div>
        );
    }

    const groupedMenu = pkg.menu_items.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, {} as Record<string, typeof pkg.menu_items>);

    return (
        <div className="relative pb-24">
            <AnimatedBlob color="#AD8A4E" size={450} x="60%" y="5%" delay={0} opacity={0.12} />
            <AnimatedBlob color="#6E2A2A" size={350} x="-5%" y="40%" delay={3} opacity={0.1} />

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-10 relative z-10">

                {/* Back nav */}
                <Link to="/paket" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/80 text-sm transition-colors">
                    <ChevronLeft size={16} /> Kembali ke Katalog
                </Link>

                {/* ── Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <GlassCard className="overflow-hidden grid grid-cols-1 md:grid-cols-12">
                        <div className="md:col-span-5 h-60 md:h-auto relative overflow-hidden">
                            <img
                                src={getPackageThumbnail(pkg.slug)}
                                alt={pkg.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0" style={{ background: 'rgba(13,27,16,0.5)' }} />
                            <div className="absolute top-4 left-4">
                                <span className="text-[9px] px-2.5 py-1 rounded-full font-utility uppercase tracking-widest border border-gold/40 text-gold glass-card">
                                    {(pkg as any).category?.name}
                                </span>
                            </div>
                        </div>
                        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center">
                            <span className="text-[10px] uppercase tracking-widest text-gold/70 font-utility mb-2">Paket Catering</span>
                            <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">{pkg.name}</h1>
                            <div className="h-px w-16 bg-gold/50 mb-4" />
                            <p className="text-white/55 text-sm leading-relaxed mb-6">{pkg.description}</p>
                            <div className="grid grid-cols-3 gap-4 text-sm font-utility">
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase mb-1">Harga/Pax</p>
                                    <p className="text-gold font-bold">Rp {Number(pkg.price_per_pax).toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase mb-1">Min. Order</p>
                                    <p className="text-white font-semibold">{pkg.min_pax} pax</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase mb-1">Kapasitas</p>
                                    <p className="text-white font-semibold">{pkg.max_pax || '∞'} pax</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* ── Menu Groups */}
                <div className="space-y-5">
                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-5 bg-gold rounded-full inline-block" />
                        Sajian Lengkap Paket
                    </h2>
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {Object.entries(groupedMenu).map(([type, items]) => (
                            <motion.div key={type} variants={fadeUp}>
                                <GlassCard className="p-5 h-full">
                                    <p className="text-[10px] uppercase tracking-widest text-gold/70 font-utility mb-3">{typeLabels[type] || type}</p>
                                    <ul className="space-y-1.5">
                                        {items.map(item => (
                                            <li key={item.id} className="flex items-center gap-2 text-xs text-white/60">
                                                <Check size={11} className="text-gold/70 shrink-0" />
                                                {item.name}
                                            </li>
                                        ))}
                                    </ul>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* ── CALCULATOR SECTION */}
                <div className="space-y-5 pt-4">
                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-5 bg-gold rounded-full inline-block" />
                        Rincian Estimasi Biaya
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* Form side */}
                        <div className="lg:col-span-7 space-y-5">

                            {/* Step 1 — Pax Slider */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                <GlassCard className="p-6 md:p-8 space-y-5">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-gold" />
                                        <h3 className="font-semibold text-white text-sm">Jumlah Tamu Undangan</h3>
                                    </div>

                                    <div className="glass-card rounded-xl px-6 py-4 text-center">
                                        <p className="text-[10px] text-white/30 uppercase font-utility mb-1">Guest Count</p>
                                        <motion.p
                                            className="text-4xl font-bold font-display"
                                        >
                                            {pax} <span className="text-lg font-normal text-white/40">pax</span>
                                        </motion.p>
                                    </div>

                                    <input
                                        type="range"
                                        min={pkg.min_pax}
                                        max={pkg.max_pax || 2000}
                                        step={25}
                                        value={pax}
                                        onChange={e => setPax(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-[10px] text-white/25 font-utility">
                                        <span>Min {pkg.min_pax} pax</span>
                                        <span>Max {pkg.max_pax || 2000} pax</span>
                                    </div>
                                </GlassCard>
                            </motion.div>

                            {/* Step 2 — Addons */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <GlassCard className="p-6 md:p-8 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Tag size={16} className="text-gold" />
                                        <h3 className="font-semibold text-white text-sm">Tambahan Add-on <span className="text-white/30 font-normal">(opsional)</span></h3>
                                    </div>
                                    <div className="space-y-2">
                                        {addons.map(addon => {
                                            const selected = selectedAddons.includes(addon.id);
                                            return (
                                                <motion.label
                                                    key={addon.id}
                                                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                                                        selected
                                                            ? 'border-gold/40 bg-gold/8'
                                                            : 'border-white/8 glass-card hover:border-white/15'
                                                    }`}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selected}
                                                            onChange={() => toggleAddon(addon.id)}
                                                            className="glass-checkbox"
                                                        />
                                                        <div>
                                                            <p className="text-sm text-white font-medium">{addon.name}</p>
                                                            <p className="text-[10px] text-white/35 font-utility uppercase">
                                                                {addon.pricing_type === 'per_pax' ? 'Per Pax' : 'Flat'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-gold font-utility">
                                                        Rp {Number(addon.price).toLocaleString('id-ID')}
                                                        {addon.pricing_type === 'per_pax' && <span className="text-xs font-normal text-white/35">/pax</span>}
                                                    </span>
                                                </motion.label>
                                            );
                                        })}
                                    </div>
                                </GlassCard>
                            </motion.div>

                            {/* Step 3 — Customer Form */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <GlassCard className="p-6 md:p-8 space-y-4">
                                    <h3 className="font-semibold text-white text-sm">Informasi Pemesan</h3>

                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                                { name: 'customer_name', label: 'Nama Lengkap *', type: 'text', placeholder: 'Nama Anda' },
                                                { name: 'customer_phone', label: 'No. WhatsApp *', type: 'text', placeholder: '0812xxx' },
                                            ].map(f => (
                                                <div key={f.name} className="space-y-1">
                                                    <label className="text-[10px] uppercase text-white/40 font-utility tracking-wider">{f.label}</label>
                                                    <input
                                                        type={f.type}
                                                        name={f.name}
                                                        value={(form as any)[f.name]}
                                                        onChange={e => {
                                                            setForm(p => ({ ...p, [f.name]: e.target.value }));
                                                            if (errors[f.name]) setErrors(p => { const c = { ...p }; delete c[f.name]; return c; });
                                                        }}
                                                        placeholder={f.placeholder}
                                                        className={`glass-input w-full px-3 py-2.5 rounded-xl text-sm ${errors[f.name] ? 'border-red-500/60' : ''}`}
                                                    />
                                                    {errors[f.name] && <p className="text-[10px] text-red-400">{errors[f.name]}</p>}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase text-white/40 font-utility tracking-wider">Tanggal Acara *</label>
                                                <input
                                                    type="date"
                                                    name="event_date"
                                                    value={form.event_date}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={e => {
                                                        setForm(p => ({ ...p, event_date: e.target.value }));
                                                        if (errors.event_date) setErrors(p => { const c = { ...p }; delete c.event_date; return c; });
                                                    }}
                                                    className={`glass-input w-full px-3 py-2.5 rounded-xl text-sm ${errors.event_date ? 'border-red-500/60' : ''}`}
                                                />
                                                {errors.event_date && <p className="text-[10px] text-red-400">{errors.event_date}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase text-white/40 font-utility tracking-wider">Email (opsional)</label>
                                                <input
                                                    type="email"
                                                    name="customer_email"
                                                    value={form.customer_email}
                                                    onChange={e => setForm(p => ({ ...p, customer_email: e.target.value }))}
                                                    placeholder="email@contoh.com"
                                                    className="glass-input w-full px-3 py-2.5 rounded-xl text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-white/40 font-utility tracking-wider">Lokasi Acara</label>
                                            <input
                                                type="text"
                                                name="event_location"
                                                value={form.event_location}
                                                onChange={e => setForm(p => ({ ...p, event_location: e.target.value }))}
                                                placeholder="Nama Gedung / Alamat"
                                                className="glass-input w-full px-3 py-2.5 rounded-xl text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-white/40 font-utility tracking-wider">Catatan Tambahan</label>
                                            <textarea
                                                name="notes"
                                                value={form.notes}
                                                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                                rows={3}
                                                placeholder="Request khusus, menu tambahan, dll..."
                                                className="glass-input w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                                            />
                                        </div>

                                        <GlassButton
                                            variant="primary"
                                            size="lg"
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full mt-2"
                                        >
                                            {submitting ? 'Memproses...' : 'Kirim Permintaan Penawaran'}
                                        </GlassButton>
                                    </form>
                                </GlassCard>
                            </motion.div>
                        </div>

                        {/* Receipt panel (sticky) */}
                        <div className="lg:col-span-5 lg:sticky lg:top-28">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <GlassCard variant="gold" className="p-6 md:p-8" glow>
                                    {/* Receipt header */}
                                    <div className="text-center pb-5 border-b border-white/10">
                                        <p className="font-display text-lg font-bold text-white tracking-widest uppercase">Nota Estimasi</p>
                                        <p className="text-[10px] text-white/35 font-utility mt-0.5">Garden Ledger Catering Co.</p>
                                    </div>

                                    {/* Items */}
                                    <div className="py-5 space-y-4 text-sm font-utility">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <p className="font-semibold text-white/80 text-xs">{pkg.name}</p>
                                                <p className="text-[10px] text-white/35 mt-0.5">
                                                    {pax} pax × Rp {Number(pkg.price_per_pax).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <p className="text-white/70 text-xs shrink-0">Rp {price.packageCost.toLocaleString('id-ID')}</p>
                                        </div>

                                        {price.addonBreakdown.map((item, i) => (
                                            <div key={i} className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="text-white/60 text-xs">{item.name}</p>
                                                    {item.pricing_type === 'per_pax' && (
                                                        <p className="text-[10px] text-white/30 mt-0.5">
                                                            {pax} pax × Rp {item.price.toLocaleString('id-ID')}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-white/60 text-xs shrink-0">Rp {item.cost.toLocaleString('id-ID')}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Totals */}
                                    <div className="border-t border-dashed border-white/15 pt-4 space-y-2.5 text-xs font-utility">
                                        <div className="flex justify-between text-white/50">
                                            <span>Subtotal</span>
                                            <span>Rp {price.subtotal.toLocaleString('id-ID')}</span>
                                        </div>
                                        <AnimatePresence>
                                            {price.discountPct > 0 && (
                                                <motion.div
                                                    key="discount"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="flex justify-between text-emerald-400 font-semibold"
                                                >
                                                    <span>Diskon {price.discountPct}% (volume)</span>
                                                    <span>-Rp {price.discountAmt.toLocaleString('id-ID')}</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Grand total */}
                                    <div className="mt-5 pt-4 border-t-2 border-gold/30 flex justify-between items-baseline">
                                        <span className="font-display font-bold text-white text-sm">TOTAL ESTIMASI</span>
                                        <motion.p
                                            className="text-xl font-bold font-utility text-gold"
                                        >
                                            Rp <AnimNum value={price.total} />
                                        </motion.p>
                                    </div>

                                    {/* Disclaimer */}
                                    <p className="text-[10px] text-white/20 mt-4 text-center leading-relaxed font-utility">
                                        * Estimasi bisa berubah sesuai negosiasi final dengan admin.
                                    </p>

                                    {/* Draft stamp */}
                                    <div className="flex justify-end mt-2">
                                        <div className="border-2 border-dashed border-gold/25 rounded-full px-4 py-2 text-[9px] font-utility uppercase tracking-widest text-gold/30 rotate-[-12deg]">
                                            ESTIMASI DRAFT
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Success Modal */}
            <AnimatePresence>
                {submitted && (
                    <motion.div
                        key="success-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
                        style={{ background: 'rgba(0,0,0,0.7)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="max-w-md w-full"
                        >
                            <GlassCard variant="gold" className="p-8 md:p-10 text-center" glow>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                                    className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6"
                                >
                                    <Check size={28} className="text-emerald-400" />
                                </motion.div>

                                <h2 className="font-display text-2xl font-bold text-white mb-2">Rincian Disimpan!</h2>
                                <p className="text-white/50 text-sm mb-6">
                                    Lead ID <span className="text-gold font-utility font-bold">#{submitted.id}</span> telah tercatat. Tim kami akan segera menghubungi Anda.
                                </p>

                                <div className="glass-card rounded-xl p-4 text-left space-y-1.5 text-xs font-utility text-white/50 mb-7">
                                    <div><span className="text-white/30">Nama:</span> {submitted.customer_name}</div>
                                    <div><span className="text-white/30">Paket:</span> {submitted.package_name_snapshot} · {submitted.pax} pax</div>
                                    <div><span className="text-white/30">Tanggal:</span> {submitted.event_date}</div>
                                    <div><span className="text-white/30">Total:</span> <span className="text-gold">Rp {Number(submitted.total_estimate).toLocaleString('id-ID')}</span></div>
                                </div>

                                <div className="space-y-3">
                                    {waUrl && (
                                        <a href={waUrl} target="_blank" rel="noreferrer">
                                            <GlassButton variant="primary" size="lg" className="w-full">
                                                <Phone size={16} />
                                                Chat WhatsApp Admin
                                            </GlassButton>
                                        </a>
                                    )}
                                    <GlassButton
                                        variant="glass"
                                        size="md"
                                        className="w-full"
                                        onClick={() => {
                                            setSubmitted(null);
                                            setSelectedAddons([]);
                                            setForm({ customer_name: '', customer_phone: '', customer_email: '', event_date: '', event_location: '', notes: '' });
                                        }}
                                    >
                                        Tutup & Atur Ulang
                                    </GlassButton>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
