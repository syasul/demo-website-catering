import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, X, Calendar, Phone, MapPin, Users, Tag, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { AnimatedBlob } from '../components/AnimatedBlob';
import type { Category, Addon, Package } from '../types';

// --- COUNT UP ANIMATION HELPERS ---
const CountUp: React.FC<{ value: number }> = ({ value }) => {
    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        let start = displayVal;
        const end = value;
        if (start === end) return;

        const duration = 400; 
        const range = end - start;
        let current = start;
        const increment = end > start ? Math.ceil(range / 12) : Math.floor(range / 12);
        const stepTime = Math.abs(Math.floor(duration / 12));
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                setDisplayVal(end);
                clearInterval(timer);
            } else {
                setDisplayVal(current);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{displayVal.toLocaleString('id-ID')}</span>;
};

export const Calculator: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [addons, setAddons] = useState<Addon[]>([]);
    const [loading, setLoading] = useState(true);

    // Wizard states
    const [step, setStep] = useState(1);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [paxCount, setPaxCount] = useState(250);
    const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
    const [customerData, setCustomerData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        event_date: '',
        event_location: '',
        notes: ''
    });

    // Pricing calculation output
    const [pricing, setPricing] = useState({
        subtotal: 0,
        discountPercent: 0,
        discountAmount: 0,
        total: 0,
        packageCost: 0,
        addonsCost: 0,
        addonBreakdown: [] as any[]
    });

    // Form errors
    const [errors, setErrors] = useState<any>({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [whatsappUrl, setWhatsappUrl] = useState('');
    const [submittedQuotation, setSubmittedQuotation] = useState<any>(null);

    // Auto select package if navigated with state (e.g. from Detail page)
    const historyState = (window.history.state as any)?.usr;
    const autoSelectId = historyState?.autoSelectPackageId;

    useEffect(() => {
        const fetchCalcData = async () => {
            try {
                const catRes = await fetch('/api/categories');
                const catData = await catRes.json();
                setCategories(catData);

                const addonRes = await fetch('/api/addons');
                const addonData = await addonRes.json();
                setAddons(addonData);

                if (autoSelectId && catData.length > 0) {
                    const allPackages = catData.flatMap((c: Category) => c.packages);
                    const matched = allPackages.find((p: Package) => p.id === autoSelectId);
                    if (matched) {
                        setSelectedPackage(matched);
                        setPaxCount(matched.min_pax);
                        setStep(2); // directly skip to pax input
                    }
                }
            } catch (err) {
                console.error("Error loading data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCalcData();
    }, [autoSelectId]);

    // Set default package when categories load if not auto-selected
    useEffect(() => {
        if (categories.length > 0 && categories[0].packages.length > 0 && !selectedPackage && !autoSelectId) {
            const defaultPkg = categories[0].packages[0];
            setSelectedPackage(defaultPkg);
            setPaxCount(defaultPkg.min_pax);
        }
    }, [categories, autoSelectId]);

    // Recalculate price dynamically whenever inputs change
    useEffect(() => {
        if (!selectedPackage) return;

        // Calculate package base
        const packageCost = selectedPackage.price_per_pax * paxCount;

        // Calculate addons
        let addonsCost = 0;
        const addonBreakdown: any[] = [];

        selectedAddons.forEach((addonId) => {
            const addon = addons.find(a => a.id === addonId);
            if (addon) {
                const cost = addon.pricing_type === 'per_pax' ? addon.price * paxCount : addon.price;
                addonsCost += cost;
                addonBreakdown.push({
                    name: addon.name,
                    pricing_type: addon.pricing_type,
                    price: addon.price,
                    cost: cost
                });
            }
        });

        const subtotal = packageCost + addonsCost;

        // Determine discount percent
        let discountPercent = 0;
        const packageTier = selectedPackage.pricing_tiers;
        if (packageTier && packageTier.length > 0) {
            const activeTiers = [...packageTier]
                .filter(t => paxCount >= t.min_pax)
                .sort((a, b) => b.min_pax - a.min_pax);
            if (activeTiers.length > 0) {
                discountPercent = Number(activeTiers[0].discount_percent);
            }
        } else {
            // Default volume discounts fallback
            if (paxCount >= 500) discountPercent = 10;
            else if (paxCount >= 250) discountPercent = 5;
        }

        const discountAmount = Math.round(subtotal * (discountPercent / 100));
        const total = subtotal - discountAmount;

        setPricing({
            subtotal,
            discountPercent,
            discountAmount,
            total,
            packageCost,
            addonsCost,
            addonBreakdown
        });
    }, [selectedPackage, paxCount, selectedAddons, addons]);

    const handlePackageSelect = (pkg: Package) => {
        setSelectedPackage(pkg);
        // adjust pax count to respect package's min boundary
        if (paxCount < pkg.min_pax) {
            setPaxCount(pkg.min_pax);
        } else if (pkg.max_pax && paxCount > pkg.max_pax) {
            setPaxCount(pkg.max_pax);
        }
    };

    const handleAddonToggle = (addonId: number) => {
        setSelectedAddons(prev => 
            prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
        );
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev: any) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const validateForm = () => {
        const errs: any = {};
        if (!customerData.customer_name.trim()) errs.customer_name = 'Nama lengkap wajib diisi';
        if (!customerData.customer_phone.trim()) {
            errs.customer_phone = 'Nomor WhatsApp wajib diisi';
        } else if (!/^[0-9+-\s]{8,15}$/.test(customerData.customer_phone.trim())) {
            errs.customer_phone = 'Format nomor WhatsApp tidak valid';
        }
        if (!customerData.event_date) errs.event_date = 'Tanggal acara wajib dipilih';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!selectedPackage) return;

        setSubmitLoading(true);
        try {
            const response = await fetch('/api/quotations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    package_id: selectedPackage.id,
                    pax: paxCount,
                    addons: selectedAddons,
                    customer_name: customerData.customer_name,
                    customer_phone: customerData.customer_phone,
                    customer_email: customerData.customer_email,
                    event_date: customerData.event_date,
                    event_location: customerData.event_location,
                    notes: customerData.notes
                })
            });

            if (response.ok) {
                const result = await response.json();
                setSubmittedQuotation(result);

                // Construct Whatsapp Message
                const dateFormatted = new Date(customerData.event_date).toLocaleDateString('id-ID', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                });
                const addOnText = pricing.addonBreakdown.length > 0 
                    ? pricing.addonBreakdown.map(a => `- ${a.name}`).join('%0A')
                    : 'Tidak ada';

                const waMessage = `Halo Admin Dewandaru Catering!%0ASaya ingin mengonfirmasi simulasi penawaran yang sudah saya hitung.%0A%0A*DETAIL SIMULASI*%0A- ID Simulasi: %23${result.id}%0A- Nama: ${customerData.customer_name}%0A- Paket: ${selectedPackage.name}%0A- Jumlah Tamu: ${paxCount} Pax%0A- Tanggal Acara: ${dateFormatted}%0A- Lokasi: ${customerData.event_location || '-'}%0A- Add-on:%0A${addOnText}%0A%0A*ESTIMASI BIAYA*%0A- Subtotal: Rp ${pricing.subtotal.toLocaleString('id-ID')}%0A- Diskon Volume: Rp ${pricing.discountAmount.toLocaleString('id-ID')} (${pricing.discountPercent}%)%0A- *TOTAL:* *Rp ${pricing.total.toLocaleString('id-ID')}*%0A%0AMohon segera follow up rincian saya ya. Terima kasih!`;
                
                setWhatsappUrl(`https://wa.me/6281234567890?text=${waMessage}`);
                setShowReceiptModal(true);
            } else {
                alert('Gagal menyimpan simulasi. Silakan coba beberapa saat lagi.');
            }
        } catch (err) {
            console.error(err);
            alert('Koneksi terputus. Pastikan server aktif.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="skeleton rounded-full h-12 w-12 border-2 border-gold border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen px-6 md:px-12 py-12 max-w-7xl mx-auto overflow-x-hidden">
            <AnimatedBlob color="#AD8A4E" size={400} x="10%" y="15%" delay={0} opacity={0.12} />
            <AnimatedBlob color="#EAD8C0" size={350} x="80%" y="45%" delay={2} opacity={0.09} />

            {/* Header */}
            <div className="text-center mb-10 mt-12">
                <span className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">Bento Estimator</span>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-2 mb-3">Kalkulator Biaya</h1>
                <p className="text-white/40 text-xs uppercase tracking-widest font-utility">Dewandaru Catering Co.</p>
            </div>

            {/* Step Wizard Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-6 mb-20">
                
                {/* Left Form: Wizard Steps */}
                <div className="lg:col-span-7 space-y-8">
                    
                    {/* Navigation Wizard Bar (Bento Panel Style) */}
                    <GlassCard className="p-3">
                        <div className="flex items-center justify-around text-[10px] font-utility font-bold uppercase tracking-wider">
                            <button 
                                onClick={() => setStep(1)} 
                                className={`px-3 py-1.5 rounded-lg transition-all ${step === 1 ? 'bg-gold text-white' : 'text-white/40 hover:text-white'}`}
                            >
                                1. Paket
                            </button>
                            <span className="text-white/20">&rarr;</span>
                            <button 
                                onClick={() => selectedPackage && setStep(2)} 
                                disabled={!selectedPackage}
                                className={`px-3 py-1.5 rounded-lg transition-all ${step === 2 ? 'bg-gold text-white' : 'text-white/40 hover:text-white'} disabled:opacity-30`}
                            >
                                2. Undangan
                            </button>
                            <span className="text-white/20">&rarr;</span>
                            <button 
                                onClick={() => selectedPackage && setStep(3)} 
                                disabled={!selectedPackage}
                                className={`px-3 py-1.5 rounded-lg transition-all ${step === 3 ? 'bg-gold text-white' : 'text-white/40 hover:text-white'} disabled:opacity-30`}
                            >
                                3. Add-on
                            </button>
                            <span className="text-white/20">&rarr;</span>
                            <button 
                                onClick={() => selectedPackage && setStep(4)} 
                                disabled={!selectedPackage}
                                className={`px-3 py-1.5 rounded-lg transition-all ${step === 4 ? 'bg-gold text-white' : 'text-white/40 hover:text-white'} disabled:opacity-30`}
                            >
                                4. Kontak
                            </button>
                        </div>
                    </GlassCard>

                    {/* Step Content */}
                    <GlassCard className="p-8">
                        
                        {/* Step 1: Package Selector */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide">Pilih Paket Catering</h3>
                                    <p className="text-white/40 text-xs mt-1">Pilih basis masakan dan set prasmanan utama untuk acara Anda.</p>
                                </div>
                                <div className="space-y-6 text-xs">
                                    {categories.map(category => (
                                        <div key={category.id} className="space-y-3">
                                            <h4 className="text-[10px] uppercase tracking-wider font-bold text-gold border-b border-white/5 pb-1 font-utility">{category.name}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {category.packages.map(pkg => {
                                                    const isSelected = selectedPackage?.id === pkg.id;
                                                    return (
                                                        <div 
                                                            key={pkg.id} 
                                                            onClick={() => handlePackageSelect(pkg)}
                                                            className={`p-4 border rounded-xl cursor-pointer transition-all ${
                                                                isSelected 
                                                                    ? 'border-gold bg-gold/10 shadow-md' 
                                                                    : 'border-white/10 glass-card hover:border-gold/30'
                                                            }`}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <h5 className="font-display font-bold text-white uppercase text-[11px] tracking-wide">{pkg.name}</h5>
                                                                {isSelected && <Check size={14} className="text-gold" />}
                                                            </div>
                                                            <p className="text-[11px] text-white/50 mt-2 line-clamp-2 leading-relaxed">{pkg.description}</p>
                                                            <div className="mt-4 flex justify-between items-baseline border-t border-white/5 pt-2">
                                                                <span className="text-[9px] text-white/30 font-utility uppercase">Min {pkg.min_pax} pax</span>
                                                                <span className="font-utility text-xs font-bold text-gold">Rp {pkg.price_per_pax.toLocaleString('id-ID')}/pax</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <GlassButton variant="primary" size="sm" onClick={() => setStep(2)}>
                                        LANJUT LANGKAH <ArrowRight size={13} />
                                    </GlassButton>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Pax count Estimator */}
                        {step === 2 && selectedPackage && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide">Tentukan Jumlah Undangan</h3>
                                    <p className="text-white/40 text-xs mt-1">Geser thumb untuk mengatur kuota tamu. Diskon volume otomatis teraplikasikan.</p>
                                </div>

                                <div className="glass-card border border-gold/20 rounded-xl p-6 text-center my-4">
                                    <span className="text-[10px] uppercase font-utility text-white/40 tracking-wider">Estimasi Tamu Undangan</span>
                                    <div className="font-utility text-4xl font-bold text-white mt-2 mb-1">
                                        {paxCount} <span className="text-sm font-normal text-white/50">Pax</span>
                                    </div>
                                    <span className="text-[10px] text-gold font-bold font-utility">
                                        Tarif Dasar: Rp {(selectedPackage.price_per_pax * paxCount).toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <input 
                                        type="range" 
                                        min={selectedPackage.min_pax}
                                        max={selectedPackage.max_pax || 2000}
                                        step="25"
                                        value={paxCount}
                                        onChange={(e) => setPaxCount(Number(e.target.value))}
                                        className="w-full accent-gold bg-white/10 h-1.5 rounded-full cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] font-utility text-white/30">
                                        <span>MIN: {selectedPackage.min_pax} PAX</span>
                                        <span>MAX: {selectedPackage.max_pax || 2000} PAX</span>
                                    </div>
                                </div>

                                <div className="mt-8 border-t border-white/5 pt-6">
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-gold font-utility mb-4">Tingkatan Diskon Volume</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={`p-4 border rounded-xl text-center transition-all duration-300 ${paxCount >= 250 && paxCount < 500 ? 'border-gold bg-gold/5 font-semibold shadow-sm' : 'border-white/5 text-white/30'}`}>
                                            <div className="text-[9px] font-utility uppercase tracking-wider mb-1">250+ Tamu</div>
                                            <div className="text-sm font-bold font-display text-white">Diskon 5%</div>
                                        </div>
                                        <div className={`p-4 border rounded-xl text-center transition-all duration-300 ${paxCount >= 500 ? 'border-gold bg-gold/5 font-semibold shadow-sm' : 'border-white/5 text-white/30'}`}>
                                            <div className="text-[9px] font-utility uppercase tracking-wider mb-1">500+ Tamu</div>
                                            <div className="text-sm font-bold font-display text-white">Diskon 10%</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-between border-t border-white/5 pt-6">
                                    <GlassButton variant="glass" size="sm" onClick={() => setStep(1)}>
                                        KEMBALI
                                    </GlassButton>
                                    <GlassButton variant="primary" size="sm" onClick={() => setStep(3)}>
                                        LANJUT LANGKAH <ArrowRight size={13} />
                                    </GlassButton>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Addons */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide">Tambahan Add-on Premium</h3>
                                    <p className="text-white/40 text-xs mt-1">Kustomisasi prasmanan Anda dengan dekorasi eksklusif, MC, atau stall live-cooking.</p>
                                </div>

                                <div className="space-y-3">
                                    {addons.map((addon) => {
                                        const isSelected = selectedAddons.includes(addon.id);
                                        return (
                                            <div 
                                                key={addon.id}
                                                onClick={() => handleAddonToggle(addon.id)}
                                                className={`p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${
                                                    isSelected 
                                                        ? 'border-gold/55 bg-gold/10 shadow-sm' 
                                                        : 'border-white/10 glass-card hover:border-gold/25'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-4 h-4 border border-white/20 rounded flex items-center justify-center ${isSelected ? 'bg-gold border-gold text-white' : ''}`}>
                                                        {isSelected && <Check size={11} />}
                                                    </div>
                                                    <div>
                                                        <span className="font-display font-bold block text-xs text-white uppercase tracking-wide">{addon.name}</span>
                                                        <span className="text-[9px] text-white/30 uppercase tracking-widest font-utility mt-0.5 block">
                                                            {addon.pricing_type === 'per_pax' ? 'Per Tamu' : 'Harga Flat'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="font-utility text-xs font-bold text-gold">
                                                    Rp {addon.price.toLocaleString('id-ID')} {addon.pricing_type === 'per_pax' && '/pax'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 flex justify-between border-t border-white/5 pt-6">
                                    <GlassButton variant="glass" size="sm" onClick={() => setStep(2)}>
                                        KEMBALI
                                    </GlassButton>
                                    <GlassButton variant="primary" size="sm" onClick={() => setStep(4)}>
                                        LANJUT LANGKAH <ArrowRight size={13} />
                                    </GlassButton>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Contact RSVP Fields */}
                        {step === 4 && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide font-bold">Informasi RSVP Acara</h3>
                                    <p className="text-white/40 text-xs mt-1">Masukkan informasi pemesan untuk mendaftarkan estimasi digital Anda.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-medium">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 font-utility block">Nama Lengkap *</label>
                                        <input 
                                            type="text" 
                                            name="customer_name"
                                            value={customerData.customer_name}
                                            onChange={handleCustomerChange}
                                            className={`bg-transparent border-t-0 border-x-0 border-b border-dashed border-gold/45 focus:outline-none focus:ring-0 focus:border-gold text-[#111111] px-1 pb-1.5 w-full text-sm placeholder-white/20 ${errors.customer_name ? 'border-red-500/50' : ''}`}
                                            placeholder="Nama Anda..."
                                        />
                                        {errors.customer_name && <span className="text-[9px] text-red-500 font-bold">{errors.customer_name}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 font-utility block">Nomor WhatsApp *</label>
                                        <input 
                                            type="text" 
                                            name="customer_phone"
                                            value={customerData.customer_phone}
                                            onChange={handleCustomerChange}
                                            className={`bg-transparent border-t-0 border-x-0 border-b border-dashed border-gold/45 focus:outline-none focus:ring-0 focus:border-gold text-[#111111] px-1 pb-1.5 w-full text-sm placeholder-white/20 ${errors.customer_phone ? 'border-red-500/50' : ''}`}
                                            placeholder="Contoh: 08123456789..."
                                        />
                                        {errors.customer_phone && <span className="text-[9px] text-red-500 font-bold">{errors.customer_phone}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-medium">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 font-utility block">Tanggal Acara *</label>
                                        <input 
                                            type="date" 
                                            name="event_date"
                                            value={customerData.event_date}
                                            onChange={handleCustomerChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`bg-transparent border-t-0 border-x-0 border-b border-dashed border-gold/45 focus:outline-none focus:ring-0 focus:border-gold text-[#111111] px-1 pb-1.5 w-full text-sm placeholder-white/20 ${errors.event_date ? 'border-red-500/50' : ''}`}
                                        />
                                        {errors.event_date && <span className="text-[9px] text-red-500 font-bold">{errors.event_date}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 font-utility block">Email (Opsional)</label>
                                        <input 
                                            type="email" 
                                            name="customer_email"
                                            value={customerData.customer_email}
                                            onChange={handleCustomerChange}
                                            className="bg-transparent border-t-0 border-x-0 border-b border-dashed border-gold/45 focus:outline-none focus:ring-0 focus:border-gold text-[#111111] px-1 pb-1.5 w-full text-sm placeholder-white/20"
                                            placeholder="email@contoh.com..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1 text-xs">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 font-utility block">Lokasi Acara (Gedung/Rumah)</label>
                                    <input 
                                        type="text" 
                                        name="event_location"
                                        value={customerData.event_location}
                                        onChange={handleCustomerChange}
                                        className="bg-transparent border-t-0 border-x-0 border-b border-dashed border-gold/45 focus:outline-none focus:ring-0 focus:border-gold text-[#111111] px-1 pb-1.5 w-full text-sm placeholder-white/20"
                                        placeholder="Alamat Lengkap atau Nama Gedung..."
                                    />
                                </div>

                                <div className="space-y-1 text-xs">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 font-utility block">Catatan Khusus</label>
                                    <textarea 
                                        name="notes"
                                        value={customerData.notes}
                                        onChange={handleCustomerChange}
                                        rows={3}
                                        className="bg-transparent border-t-0 border-x-0 border-b border-dashed border-gold/45 focus:outline-none focus:ring-0 focus:border-gold text-[#111111] px-1 pb-1.5 w-full text-sm placeholder-white/20 resize-none"
                                        placeholder="Tulis request menu tambahan, alergi, atau negosiasi..."
                                    />
                                </div>

                                <div className="mt-8 flex justify-between pt-6 border-t border-white/5 text-xs">
                                    <GlassButton type="button" variant="glass" size="sm" onClick={() => setStep(3)}>
                                        KEMBALI
                                    </GlassButton>
                                    <GlassButton 
                                        type="submit" 
                                        variant="primary" 
                                        size="lg"
                                        disabled={submitLoading}
                                        className="px-8 shadow-md"
                                    >
                                        {submitLoading ? 'MEMPROSES...' : 'KIRIM PERMINTAAN ESTIMASI'}
                                    </GlassButton>
                                </div>
                            </form>
                        )}
                    </GlassCard>
                </div>

                {/* Right Column: Sticky Invoice Ledger Ticket */}
                <div className="lg:col-span-5 lg:sticky lg:top-28">
                    <GlassCard variant="gold" className="p-6 md:p-8 relative overflow-hidden" glow>
                        
                        {/* Receipt Header */}
                        <div className="text-center pb-5 border-b border-gold/25">
                            <span className="font-display font-bold text-lg uppercase tracking-widest text-white">NOTA ESTIMASI</span>
                            <div className="text-[9px] font-utility uppercase tracking-wider text-white/35 mt-1">Dewandaru Catering Co.</div>
                        </div>

                        {/* Items Section */}
                        <div className="py-6 space-y-4 text-xs font-utility">
                            {selectedPackage ? (
                                <>
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <span className="font-bold text-xs uppercase block text-white/80">Basis Paket</span>
                                            <span className="text-white/60">{selectedPackage.name}</span>
                                            <span className="text-[10px] text-white/35 block mt-1">
                                                {paxCount} pax &times; Rp {selectedPackage.price_per_pax.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <span className="font-bold text-white/70">
                                            Rp {pricing.packageCost.toLocaleString('id-ID')}
                                        </span>
                                    </div>

                                    {pricing.addonBreakdown.length > 0 && (
                                        <div className="border-t border-white/5 pt-4 space-y-2">
                                            <span className="font-bold text-xs uppercase block text-white/80">Tambahan Add-on</span>
                                            {pricing.addonBreakdown.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-white/60 text-xs">
                                                    <span>
                                                        - {item.name}
                                                        {item.pricing_type === 'per_pax' && (
                                                            <span className="text-[9px] text-white/35 block mt-0.5">
                                                                {paxCount} pax &times; Rp {item.price.toLocaleString('id-ID')}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span>Rp {item.cost.toLocaleString('id-ID')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 text-xs text-white/30 uppercase tracking-widest font-utility">
                                    PILIH PAKET UNTUK DAFTAR RINCIAN
                                </div>
                            )}
                        </div>

                        {/* Perforated Divider in Receipt */}
                        <div className="my-4 border-t-2 border-dashed border-gold/30 relative">
                            <div className="absolute -left-8 -top-3 w-4 h-6 rounded-r-full bg-[#f4f5f7] border-r border-gold/15" />
                            <div className="absolute -right-8 -top-3 w-4 h-6 rounded-l-full bg-[#f4f5f7] border-l border-gold/15" />
                        </div>

                        {/* Totals Section */}
                        {selectedPackage && (
                            <>
                                <div className="space-y-2.5 text-xs font-utility text-white/50">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>Rp {pricing.subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    
                                    {pricing.discountPercent > 0 && (
                                        <div className="flex justify-between text-emerald-400 font-bold">
                                            <span>Diskon Volume ({pricing.discountPercent}%)</span>
                                            <span>-Rp {pricing.discountAmount.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-white/10 pt-4 flex justify-between items-baseline mt-4">
                                    <span className="font-display font-bold text-xs text-white/80">ESTIMASI TOTAL</span>
                                    <span className="font-utility text-base font-bold text-white">
                                        Rp <span className="text-gold text-lg"><CountUp value={pricing.total} /></span>
                                    </span>
                                </div>

                                {/* Distressed rubber stamp simulation */}
                                <div className="absolute right-6 bottom-20 transform rotate-[-12deg] opacity-75 border-4 border-double border-gold/50 text-gold/80 px-4 py-2 font-utility text-[10px] uppercase font-bold tracking-widest rounded bg-white/20 select-none pointer-events-none shadow-[0_0_12px_rgba(173,138,78,0.06)]">
                                    Estimasi Valid
                                </div>
                            </>
                        )}
                        
                        <p className="text-[9px] text-white/25 mt-4 text-center leading-relaxed font-utility">
                            * Rincian estimasi final akan dikonfirmasi admin via WhatsApp.
                        </p>
                    </GlassCard>
                </div>
            </div>

            {/* CONFIRMATION SUCCESS MODAL */}
            {showReceiptModal && submittedQuotation && (
                <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center p-6 z-50 animate-fade-in text-xs" style={{ background: 'rgba(0,0,0,0.75)' }}>
                    <div className="max-w-md w-full relative">
                        <GlassCard variant="gold" className="p-8 md:p-10 text-center relative overflow-hidden" glow>
                            <div className="absolute inset-0 border-4 border-double border-gold/15 translate-x-2 translate-y-2 rounded-2xl pointer-events-none" />
                            
                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={32} />
                            </div>

                            <h2 className="font-display text-2xl font-bold text-white mb-2 uppercase tracking-wide">Simulasi Disimpan!</h2>
                            <p className="text-xs text-white/50 mb-6">
                                Penawaran Anda tercatat dengan ID Lead <span className="font-utility font-bold text-gold">#{submittedQuotation.id}</span>.
                            </p>

                            <div className="glass-card rounded-xl p-4 border border-white/5 text-left font-utility text-xs space-y-2 mb-8 text-white/60">
                                <div><strong className="text-white/40">Nama:</strong> {submittedQuotation.customer_name}</div>
                                <div><strong className="text-white/40">Paket:</strong> {selectedPackage?.name} ({submittedQuotation.pax} pax)</div>
                                <div><strong className="text-white/40">Tanggal:</strong> {new Date(submittedQuotation.event_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                <div><strong className="text-white/40">Total Estimasi:</strong> <span className="text-gold font-bold">Rp {Number(submittedQuotation.total_estimate).toLocaleString('id-ID')}</span></div>
                            </div>

                            <div className="space-y-3">
                                <a 
                                    href={whatsappUrl} 
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block"
                                >
                                    <GlassButton variant="primary" size="lg" className="w-full">
                                        <Phone size={14} />
                                        CHAT WHATSAPP CS ADMIN
                                    </GlassButton>
                                </a>
                                <GlassButton 
                                    onClick={() => {
                                        setShowReceiptModal(false);
                                        setStep(1);
                                        setSelectedAddons([]);
                                        setCustomerData({
                                            customer_name: '',
                                            customer_phone: '',
                                            customer_email: '',
                                            event_date: '',
                                            event_location: '',
                                            notes: ''
                                        });
                                    }} 
                                    variant="glass"
                                    size="md"
                                    className="w-full"
                                >
                                    TUTUP & BUAT BARU
                                </GlassButton>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};
