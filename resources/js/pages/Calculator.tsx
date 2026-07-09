import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator as CalcIcon, Check, ArrowRight, X, Calendar, Phone, MapPin } from 'lucide-react';
import type { Category, Addon, Package } from '../types';

// --- COUNT UP ANIMATION HELPERS ---
const CountUp: React.FC<{ value: number }> = ({ value }) => {
    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        let start = displayVal;
        const end = value;
        if (start === end) return;

        const duration = 500; 
        const range = end - start;
        let current = start;
        const increment = end > start ? Math.ceil(range / 15) : Math.floor(range / 15);
        const stepTime = Math.abs(Math.floor(duration / 15));
        
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

    // Stempel animation triggers
    const [stampActive, setStampActive] = useState(false);
    const [stampScale, setStampScale] = useState(false);

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
        const packageTier = selectedPackage.pricing_tiers
            .filter(t => t.min_pax <= paxCount)
            .sort((a, b) => b.min_pax - a.min_pax)[0];

        if (packageTier) {
            discountPercent = Number(packageTier.discount_percent);
        } else {
            if (paxCount >= 500) {
                discountPercent = 10;
            } else if (paxCount >= 250) {
                discountPercent = 5;
            }
        }

        const discountAmount = subtotal * (discountPercent / 100);
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

        // Trigger stempel animation
        setStampActive(true);
        setStampScale(true);
        const timer = setTimeout(() => {
            setStampScale(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedPackage, paxCount, selectedAddons, addons]);

    const handlePackageSelect = (pkg: Package) => {
        setSelectedPackage(pkg);
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
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
    };

    const validateForm = () => {
        const newErrors: any = {};
        if (!customerData.customer_name.trim()) newErrors.customer_name = 'Nama lengkap wajib diisi.';
        if (!customerData.customer_phone.trim()) newErrors.customer_phone = 'Nomor WhatsApp aktif wajib diisi.';
        if (!customerData.event_date) newErrors.event_date = 'Tanggal acara wajib ditentukan.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || !selectedPackage) return;

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
                    addon_ids: selectedAddons,
                    ...customerData
                })
            });

            const data = await response.json();
            if (response.ok) {
                setSubmittedQuotation(data.quotation);
                setWhatsappUrl(data.whatsapp_url);
                setShowReceiptModal(true);
            } else {
                alert(data.message || 'Terjadi kesalahan saat memproses data.');
            }
        } catch (err) {
            console.error("Submit error:", err);
            alert('Gagal menghubungi server.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto animate-fade-in">
            {/* Title */}
            <div className="mb-12 text-center md:text-left">
                <span className="font-utility text-xs uppercase tracking-widest text-gold font-bold">Kalkulator Self-Service</span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-forest mt-1">Simulasikan Rencana Acaramu</h1>
                <div className="h-0.5 w-16 bg-gold mt-3 mx-auto md:mx-0"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* WIZARD INPUTS */}
                <div className="lg:col-span-7 bg-paper border border-forest/10 p-6 md:p-8 shadow-lg">
                    
                    <div className="flex items-center justify-between mb-8 border-b border-forest/10 pb-4 text-xs font-utility uppercase tracking-wider text-forest/50">
                        <button onClick={() => setStep(1)} className={`pb-2 border-b ${step === 1 ? 'text-gold border-gold font-bold' : 'border-transparent'}`}>
                            1. Pilih Paket
                        </button>
                        <span className="pb-2 border-b border-transparent">&rarr;</span>
                        <button 
                            onClick={() => selectedPackage && setStep(2)} 
                            disabled={!selectedPackage}
                            className={`pb-2 border-b ${step === 2 ? 'text-gold border-gold font-bold' : 'border-transparent'} disabled:opacity-50`}
                        >
                            2. Tamu (Pax)
                        </button>
                        <span className="pb-2 border-b border-transparent">&rarr;</span>
                        <button 
                            onClick={() => selectedPackage && setStep(3)} 
                            disabled={!selectedPackage}
                            className={`pb-2 border-b ${step === 3 ? 'text-gold border-gold font-bold' : 'border-transparent'} disabled:opacity-50`}
                        >
                            3. Add-on
                        </button>
                        <span className="pb-2 border-b border-transparent">&rarr;</span>
                        <button 
                            onClick={() => selectedPackage && setStep(4)} 
                            disabled={!selectedPackage}
                            className={`pb-2 border-b ${step === 4 ? 'text-gold border-gold font-bold' : 'border-transparent'} disabled:opacity-50`}
                        >
                            4. Kontak
                        </button>
                    </div>

                    {step === 1 && (
                        <div>
                            <h3 className="font-display text-xl font-bold mb-4">Pilih Paket Catering Acaramu</h3>
                            <div className="space-y-4 text-xs">
                                {categories.map(category => (
                                    <div key={category.id} className="space-y-3">
                                        <h4 className="text-xs uppercase tracking-wider font-bold text-gold border-b border-gold/10 pb-1">{category.name}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {category.packages.map(pkg => (
                                                <div 
                                                    key={pkg.id} 
                                                    onClick={() => handlePackageSelect(pkg)}
                                                    className={`p-4 border cursor-pointer transition-all ${selectedPackage?.id === pkg.id ? 'border-gold bg-forest/5 shadow-md' : 'border-forest/10 hover:border-gold/30'}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <h5 className="font-bold text-forest">{pkg.name}</h5>
                                                        {selectedPackage?.id === pkg.id && <Check size={16} className="text-gold" />}
                                                    </div>
                                                    <p className="text-xs text-forest/70 mt-1 line-clamp-2">{pkg.description}</p>
                                                    <div className="mt-4 flex justify-between items-baseline">
                                                        <span className="text-[10px] text-forest/50 font-utility uppercase">Min {pkg.min_pax} pax</span>
                                                        <span className="font-utility text-sm font-bold text-gold">Rp {pkg.price_per_pax.toLocaleString('id-ID')}/pax</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-end text-xs">
                                <button onClick={() => setStep(2)} className="bg-forest hover:bg-forest/90 text-paper px-6 py-3 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                    Lanjut <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && selectedPackage && (
                        <div>
                            <h3 className="font-display text-xl font-bold mb-2">Tentukan Jumlah Undangan</h3>
                            <p className="text-sm text-forest/70 mb-6">
                                Geser untuk menyesuaikan jumlah tamu. Diskon bertingkat akan otomatis diaplikasikan ke total biaya.
                            </p>

                            <div className="bg-forest/5 border border-forest/10 p-6 text-center mb-8">
                                <span className="text-xs uppercase font-utility text-forest/50">Estimasi Guest Count</span>
                                <div className="font-utility text-4xl font-bold text-forest mt-2 mb-1">
                                    {paxCount} <span className="text-sm font-normal text-forest/60">Pax</span>
                                </div>
                                <span className="text-xs text-gold font-bold">
                                    Base price: Rp {(selectedPackage.price_per_pax * paxCount).toLocaleString('id-ID')}
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
                                    className="w-full accent-gold bg-forest/20 h-1.5 cursor-pointer"
                                />
                                <div className="flex justify-between text-xs font-utility text-forest/50">
                                    <span>Min: {selectedPackage.min_pax} pax</span>
                                    <span>Max: {selectedPackage.max_pax || 2000} pax</span>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-forest/10 pt-6">
                                <h4 className="text-xs uppercase tracking-wider font-bold text-gold mb-3">Tingkatan Diskon (Tamu Berkala)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-3 border text-center ${paxCount >= 250 && paxCount < 500 ? 'border-gold bg-gold/5 font-semibold' : 'border-forest/10 text-forest/50'}`}>
                                        <div className="text-xs font-utility">250+ Pax</div>
                                        <div className="text-lg font-bold text-forest">Diskon 5%</div>
                                    </div>
                                    <div className={`p-3 border text-center ${paxCount >= 500 ? 'border-gold bg-gold/5 font-semibold' : 'border-forest/10 text-forest/50'}`}>
                                        <div className="text-xs font-utility">500+ Pax</div>
                                        <div className="text-lg font-bold text-forest">Diskon 10%</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between text-xs">
                                <button onClick={() => setStep(1)} className="border border-forest text-forest hover:bg-forest/5 px-6 py-3 font-bold uppercase tracking-wider text-xs">
                                    Kembali
                                </button>
                                <button onClick={() => setStep(3)} className="bg-forest hover:bg-forest/90 text-paper px-6 py-3 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                    Lanjut <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h3 className="font-display text-xl font-bold mb-2">Tambahkan Add-on Premium</h3>
                            <p className="text-sm text-forest/70 mb-6">
                                Kustomisasi acaramu dengan pilihan add-on dekorasi, pramusaji, MC, dan pondokan live-cooking.
                            </p>

                            <div className="space-y-3">
                                {addons.map((addon) => {
                                    const isSelected = selectedAddons.includes(addon.id);
                                    return (
                                        <div 
                                            key={addon.id}
                                            onClick={() => handleAddonToggle(addon.id)}
                                            className={`p-4 border cursor-pointer flex justify-between items-center transition-all ${isSelected ? 'border-gold bg-forest/5' : 'border-forest/10 hover:border-gold/25'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 border border-forest/30 flex items-center justify-center ${isSelected ? 'bg-gold border-gold text-paper' : ''}`}>
                                                    {isSelected && <Check size={12} />}
                                                </div>
                                                <div>
                                                    <span className="font-bold block text-sm text-forest">{addon.name}</span>
                                                    <span className="text-[10px] text-forest/50 uppercase tracking-widest font-utility">
                                                        {addon.pricing_type === 'per_pax' ? 'Per Pax' : 'Harga Flat'}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="font-utility text-sm font-bold text-gold">
                                                Rp {addon.price.toLocaleString('id-ID')} {addon.pricing_type === 'per_pax' && '/pax'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex justify-between text-xs">
                                <button onClick={() => setStep(2)} className="border border-forest text-forest hover:bg-forest/5 px-6 py-3 font-bold uppercase tracking-wider text-xs">
                                    Kembali
                                </button>
                                <button onClick={() => setStep(4)} className="bg-forest hover:bg-forest/90 text-paper px-6 py-3 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                    Lanjut <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h3 className="font-display text-xl font-bold mb-2">Isi Detail Informasi Acara</h3>
                            <p className="text-sm text-forest/70 mb-6">
                                Isi data kontak untuk menyimpan simulasi penawaran ini ke sistem pipeline marketing kami.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase font-bold text-forest/60">Nama Lengkap *</label>
                                    <input 
                                        type="text" 
                                        name="customer_name"
                                        value={customerData.customer_name}
                                        onChange={handleCustomerChange}
                                        className={`w-full p-3 bg-forest/5 border focus:outline-none focus:border-gold ${errors.customer_name ? 'border-red-500' : 'border-forest/10'}`}
                                        placeholder="Nama Anda"
                                    />
                                    {errors.customer_name && <span className="text-[10px] text-red-500 font-semibold">{errors.customer_name}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs uppercase font-bold text-forest/60">Nomor WhatsApp *</label>
                                    <input 
                                        type="text" 
                                        name="customer_phone"
                                        value={customerData.customer_phone}
                                        onChange={handleCustomerChange}
                                        className={`w-full p-3 bg-forest/5 border focus:outline-none focus:border-gold ${errors.customer_phone ? 'border-red-500' : 'border-forest/10'}`}
                                        placeholder="Contoh: 08123456789"
                                    />
                                    {errors.customer_phone && <span className="text-[10px] text-red-500 font-semibold">{errors.customer_phone}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase font-bold text-forest/60">Tanggal Acara *</label>
                                    <input 
                                        type="date" 
                                        name="event_date"
                                        value={customerData.event_date}
                                        onChange={handleCustomerChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full p-3 bg-forest/5 border focus:outline-none focus:border-gold ${errors.event_date ? 'border-red-500' : 'border-forest/10'}`}
                                    />
                                    {errors.event_date && <span className="text-[10px] text-red-500 font-semibold">{errors.event_date}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs uppercase font-bold text-forest/60">Email (Opsional)</label>
                                    <input 
                                        type="email" 
                                        name="customer_email"
                                        value={customerData.customer_email}
                                        onChange={handleCustomerChange}
                                        className="w-full p-3 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                        placeholder="email@contoh.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 text-xs">
                                <label className="text-xs uppercase font-bold text-forest/60">Lokasi Acara (Gedung/Rumah)</label>
                                <input 
                                    type="text" 
                                    name="event_location"
                                    value={customerData.event_location}
                                    onChange={handleCustomerChange}
                                    className="w-full p-3 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    placeholder="Alamat Lengkap atau Nama Gedung"
                                />
                            </div>

                            <div className="space-y-1 text-xs">
                                <label className="text-xs uppercase font-bold text-forest/60">Catatan Khusus (Nego/Request)</label>
                                <textarea 
                                    name="notes"
                                    value={customerData.notes}
                                    onChange={handleCustomerChange}
                                    rows={3}
                                    className="w-full p-3 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    placeholder="Tulis request menu tambahan..."
                                />
                            </div>

                            <div className="mt-8 flex justify-between pt-4 border-t border-forest/10 text-xs">
                                <button type="button" onClick={() => setStep(3)} className="border border-forest text-forest hover:bg-forest/5 px-6 py-3 font-bold uppercase tracking-wider text-xs">
                                    Kembali
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitLoading}
                                    className="bg-maroon hover:bg-maroon/90 text-paper px-8 py-3 font-bold uppercase tracking-widest text-xs border border-gold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submitLoading ? 'Memproses...' : 'Kirim Permintaan Estimasi'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* NOTA HIDUP RECEIPT */}
                <div className="lg:col-span-5 lg:sticky lg:top-8 bg-paper border border-forest p-6 shadow-2xl relative">
                    <div className="absolute top-1 left-1 right-1 bottom-1 border border-forest/20 pointer-events-none"></div>
                    
                    <div className="text-center pb-4 border-b border-dashed border-forest/30">
                        <span className="font-display font-bold text-xl uppercase tracking-widest">NOTA ESTIMASI</span>
                        <div className="text-[10px] font-utility uppercase tracking-wider text-forest/60 mt-1">Garden Ledger Catering Co.</div>
                    </div>

                    <div className="py-6 space-y-4 text-sm font-utility">
                        {selectedPackage ? (
                            <>
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <span className="font-bold text-xs uppercase block text-forest/70">Catering Package</span>
                                        <span className="text-xs">{selectedPackage.name}</span>
                                        <span className="text-[10px] text-forest/50 block mt-0.5">
                                            {paxCount} pax &times; Rp {selectedPackage.price_per_pax.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <span className="font-bold text-xs">
                                        Rp {pricing.packageCost.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                {pricing.addonBreakdown.length > 0 && (
                                    <div className="border-t border-forest/10 pt-4 space-y-2">
                                        <span className="font-bold text-xs uppercase block text-forest/70">Tambahan Add-on</span>
                                        {pricing.addonBreakdown.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-xs">
                                                <span>
                                                    - {item.name}
                                                    {item.pricing_type === 'per_pax' && (
                                                        <span className="text-[9px] text-forest/50 block">
                                                            {paxCount} pax &times; Rp {item.price.toLocaleString('id-ID')}
                                                        </span>
                                                    )}
                                                </span>
                                                <span>Rp {item.cost.toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-b-2 border-dashed border-forest/30 my-6"></div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span>SUBTOTAL</span>
                                        <span>Rp {pricing.subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    
                                    {pricing.discountPercent > 0 && (
                                        <div className="flex justify-between text-sage font-bold">
                                            <span>DISKON TIER ({pricing.discountPercent}%)</span>
                                            <span>-Rp {pricing.discountAmount.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t-2 border-double border-forest/40 pt-4 flex justify-between items-baseline mt-4 bg-forest/5 p-3">
                                    <span className="font-display font-bold text-xs">ESTIMASI TOTAL</span>
                                    <span className="font-utility text-lg md:text-xl font-bold text-maroon">
                                        Rp <CountUp value={pricing.total} />
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-xs text-forest/50">
                                Silakan pilih paket catering untuk memicu kalkulasi nota.
                            </div>
                        )}
                    </div>

                    <div className="border-b-4 border-dotted border-forest/40 my-6 relative">
                        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-paper px-2 text-[9px] font-utility uppercase tracking-widest text-forest/40">
                            - - sobek di sini - -
                        </span>
                    </div>

                    {stampActive && (
                        <div 
                            className={`absolute right-4 bottom-24 border-4 border-double border-stempel/80 rounded-full w-24 h-24 flex items-center justify-center font-display text-[10px] font-black uppercase text-stempel/85 tracking-widest text-center transform -rotate-12 pointer-events-none select-none transition-all duration-300 ${
                                stampScale ? 'scale-[2.5] opacity-0 rotate-45' : 'scale-100 opacity-60'
                            }`}
                            style={{
                                backgroundImage: "radial-gradient(circle, rgba(59,51,80,0.05) 60%, transparent 100%)",
                                textShadow: "1px 1px 1px rgba(255,255,255,0.4)"
                            }}
                        >
                            <div className="leading-none border-t border-b border-stempel/80 py-1 px-1">
                                ESTIMASI<br/>
                                <span className="text-[7px] tracking-normal font-utility">DRAFT</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CONFIRMATION SUCCESS MODAL */}
            {showReceiptModal && submittedQuotation && (
                <div className="fixed inset-0 bg-forest/80 backdrop-blur-sm flex justify-center items-center p-6 z-50 animate-fade-in text-xs">
                    <div className="max-w-md w-full bg-paper border border-gold p-8 shadow-2xl text-center relative">
                        <div className="absolute top-2 left-2 right-2 bottom-2 border border-gold/15 pointer-events-none"></div>
                        
                        <div className="w-16 h-16 bg-sage/10 text-sage border border-sage rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={32} />
                        </div>

                        <h2 className="font-display text-2xl font-bold text-forest mb-2">Simulasi Disimpan!</h2>
                        <p className="text-sm text-forest/70 mb-6">
                            Penawaran Anda telah tercatat dengan ID Lead <span className="font-utility font-bold">#{submittedQuotation.id}</span>.
                        </p>

                        <div className="bg-forest/5 p-4 border border-forest/10 text-left font-utility text-xs space-y-2 mb-8">
                            <div><strong>Nama:</strong> {submittedQuotation.customer_name}</div>
                            <div><strong>Paket:</strong> {submittedQuotation.package_name_snapshot} ({submittedQuotation.pax} pax)</div>
                            <div><strong>Tanggal:</strong> {submittedQuotation.event_date}</div>
                            <div><strong>Total Biaya:</strong> Rp {Number(submittedQuotation.total_estimate).toLocaleString('id-ID')}</div>
                        </div>

                        <div className="space-y-3">
                            <a 
                                href={whatsappUrl} 
                                target="_blank"
                                rel="noreferrer"
                                className="w-full bg-maroon text-paper hover:bg-maroon/90 py-3 text-xs font-bold uppercase tracking-widest border border-gold shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                <Phone size={14} />
                                Chat WhatsApp Admin CS
                            </a>
                            <button 
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
                                className="w-full border border-forest text-forest hover:bg-forest/5 py-3 text-xs font-bold uppercase tracking-widest font-bold"
                            >
                                Tutup & Buat Baru
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
