import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { animate, stagger as animeStagger } from 'animejs';
import {
    ChevronRight, Star, Clock, Coins, ShieldAlert,
    CheckCircle2, UtensilsCrossed, Sparkles, ArrowRight
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

import type { Category, Testimonial } from '../types';

export const getPackageThumbnail = (slug: string): string => {
    const map: Record<string, string> = {
        'paket-sakinah':  'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800',
        'paket-mawaddah': 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800',
        'paket-rahmah':   'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800',
        'paket-khitanan': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800',
        'paket-gathering':'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800',
    };
    return map[slug] ?? map['paket-sakinah'];
};

// ── Stagger animation variant
const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

// --- COUNT UP ANIMATION HELPER ---
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

export const Home: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        (async () => {
            try {
                const [catRes, tRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/testimonials'),
                ]);
                if (catRes.ok) setCategories(await catRes.json());
                if (tRes.ok) setTestimonials((await tRes.json()).slice(0, 3));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();

        // ── anime.js Entrance Animations
        animate('.anime-hero-title', {
            translateY: [48, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 1300,
            delay: 200
        });

        animate('.anime-hero-desc', {
            translateY: [32, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 1300,
            delay: 350
        });

        animate('.anime-hero-cta', {
            translateY: [24, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 1100,
            delay: 450
        });

        animate('.anime-hero-img', {
            translateX: [40, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 1400,
            delay: 500
        });

        animate('.anime-bento-card', {
            translateY: [60, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 1200,
            delay: animeStagger(120, { start: 600 })
        });
    }, []);

    const allPackages = categories.flatMap(cat =>
        cat.packages.map(pkg => ({ ...pkg, categoryName: cat.name }))
    );

    const problems = [
        {
            icon: <Clock size={22} />,
            title: 'Menunggu Penawaran CS',
            desc: 'Harus WA admin dulu dan menunggu berjam-jam hanya untuk mendapat estimasi kasar harga catering.',
        },
        {
            icon: <Coins size={22} />,
            title: 'Harga Tidak Transparan',
            desc: 'Harga per pax, pondokan, dan add-on tersembunyi. Sulit menghitung sendiri tanpa info lengkap.',
        },
        {
            icon: <ShieldAlert size={22} />,
            title: 'Revisi Berulang-ulang',
            desc: 'Setiap perubahan porsi atau tambahan pondokan membutuhkan revisi PDF invoice manual dari admin.',
        },
    ];

    return (
        <div className="overflow-x-hidden">

            {/* ───── HERO ───── */}
            <section className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden">

                <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 text-center lg:text-left">

                        <h1 className="anime-hero-title opacity-0 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
                            Berapa Biaya{' '}
                            <span className="text-gold">Catering</span>
                            <br />
                            Acara Anda?
                        </h1>

                        <p className="anime-hero-desc opacity-0 text-white/60 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
                            Rencanakan prasmanan pernikahan, syukuran, atau corporate gathering dengan rincian pilihan menu instan.
                            Transparan, rapi, dan langsung terhubung dengan WhatsApp admin.
                        </p>

                        <div className="anime-hero-cta opacity-0 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/paket">
                                <GlassButton variant="primary" size="lg">
                                    <UtensilsCrossed size={18} />
                                    Pilih Paket Catering
                                </GlassButton>
                            </Link>
                            <Link to="/galeri">
                                <GlassButton variant="glass" size="lg">
                                    Lihat Galeri Acara
                                    <ChevronRight size={16} />
                                </GlassButton>
                            </Link>
                        </div>

                        {/* Trust bar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                            className="mt-16 flex flex-wrap justify-center lg:justify-start gap-6 text-[10px] text-white/35 uppercase tracking-widest font-utility"
                        >
                            {['500+ Event Sukses', 'Bogor & Jabodetabek', 'Prasmanan Premium'].map(t => (
                                <span key={t} className="border-r border-white/10 pr-6 last:border-0">{t}</span>
                            ))}
                        </motion.div>
                    </div>

                    <div className="lg:col-span-5 relative pr-0 lg:pr-6 mt-10 lg:mt-0">
                        <div className="anime-hero-img opacity-0 relative max-w-md mx-auto">
                            <img
                                src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800"
                                alt="Catering Decoration Setup"
                                className="relative w-full h-[320px] md:h-[400px] lg:h-[520px] object-cover border border-gray-100 rounded-2xl shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                    style={{ background: 'rgba(13,27,16,0)' }} />
            </section>

            {/* ───── PROBLEMS ───── */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-80px' }}
                    className="text-center mb-14"
                >
                    <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">
                        Kebingungan Umum
                    </motion.span>
                    <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
                        Kendala yang Sering Dialami
                    </motion.h2>
                </motion.div>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-60px' }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {problems.map((p, i) => (
                        <motion.div key={i} variants={fadeUp}>
                            <GlassCard className="p-8 h-full" hover>
                                <div className="flex items-center gap-3.5 mb-4">
                                    <span className="text-gold shrink-0">{p.icon}</span>
                                    <h3 className="font-display text-lg font-semibold text-white leading-snug">{p.title}</h3>
                                </div>
                                <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ───── SOLUTIONS (BENTO GRID) ───── */}
            <section className="py-24 px-6 md:px-12 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">Solusi Modern</span>
                        <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-2">
                            Layanan Catering Nusantara & Dekorasi Premium
                        </h2>
                        <p className="text-white/50 text-sm max-w-xl mx-auto mt-4 leading-relaxed">
                            Menghadirkan kesempurnaan hidangan prasmanan dengan penataan estetik (buffet setup) untuk setiap momen berharga Anda.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[230px]">
                        
                        {/* Cell 1: Buffet Menu Showcase (spans 2x2 on desktop, 2x1 on tablet) */}
                        <GlassCard variant="default" className="anime-bento-card opacity-0 md:col-span-2 lg:col-span-2 lg:row-span-2 p-8 flex flex-col justify-between" hover>
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-gold">
                                        <UtensilsCrossed size={20} />
                                    </span>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">Sajian Menu Prasmanan Utama</h3>
                                        <p className="text-white/40 text-[9px] font-utility tracking-widest">VARIASI KULINER NUSANTARA</p>
                                    </div>
                                </div>
                                <p className="text-white/60 text-xs leading-relaxed max-w-xl">
                                    Kami menyajikan ragam hidangan khas nusantara dengan standard rasa premium. Mulai dari hidangan pembuka yang menyegarkan, ayam bakar bumbu tradisional, olahan daging sapi lada hitam, hingga sajian penutup istimewa.
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
                                        <p className="text-gold font-display font-semibold text-xs uppercase mb-1">Ayam Bakar</p>
                                        <p className="text-white/40 text-[8px] font-utility">TALIWANG</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
                                        <p className="text-gold font-display font-semibold text-xs uppercase mb-1">Daging Sapi</p>
                                        <p className="text-white/40 text-[8px] font-utility">LADA HITAM</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
                                        <p className="text-gold font-display font-semibold text-xs uppercase mb-1">Kakap Fillet</p>
                                        <p className="text-white/40 text-[8px] font-utility">ASAM MANIS</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
                                        <p className="text-gold font-display font-semibold text-xs uppercase mb-1">Es Doger</p>
                                        <p className="text-white/40 text-[8px] font-utility">TRADISIONAL</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-4 text-[10px] text-white/35 font-utility uppercase tracking-widest flex justify-between">
                                <span>STANDARD BAHAN HIGIENIS</span>
                                <span>100% HALAL</span>
                            </div>
                        </GlassCard>

                        {/* Cell 2: Waitstaff & Decoration Setup (spans 1x2 on desktop, 1x1 on tablet) */}
                        <GlassCard variant="default" className="anime-bento-card opacity-0 md:col-span-1 lg:col-span-1 lg:row-span-2 p-6 flex flex-col justify-between relative overflow-hidden" hover>
                            <div className="space-y-4 relative z-10">
                                <span className="text-[9px] text-gold font-utility uppercase tracking-widest font-bold">Layanan Lengkap</span>
                                <h3 className="font-display text-lg font-bold text-white leading-tight uppercase">Dekorasi & Pramusaji</h3>
                                <p className="text-white/60 text-[11px] leading-relaxed">
                                    Tidak hanya makanan lezat, kami juga menyediakan penataan meja prasmanan estetik (buffet setup), pramusaji berseragam rapi, peralatan makan premium, serta koordinasi acara terpadu.
                                </p>
                                <ul className="space-y-2 text-[10px] text-white/50 pt-2 font-display">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" /> Buffet Table Decoration
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" /> Professional Waitstaff
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" /> Chafing Dishes & Cutlery
                                    </li>
                                </ul>
                            </div>
                            <div className="pt-4 text-center z-10">
                                <Link to="/paket" className="block w-full">
                                    <GlassButton variant="primary" size="sm" className="w-full">
                                        LIHAT KATALOG PAKET
                                    </GlassButton>
                                </Link>
                            </div>
                        </GlassCard>

                        {/* Cell 3: Kitchen Standards (spans 1x1) */}
                        <GlassCard variant="default" className="anime-bento-card opacity-0 md:col-span-1 lg:col-span-1 p-6 flex flex-col justify-between" hover>
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] uppercase tracking-wider text-white/40 font-utility">Kualitas</span>
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-utility font-semibold">
                                    PREMIUM
                                </span>
                            </div>
                            <div>
                                <h4 className="font-display font-semibold text-white text-xs uppercase mb-1.5">Higienis & Segar</h4>
                                <p className="text-white/55 text-[11px] leading-relaxed">
                                    Pengolahan bahan makanan dilakukan di dapur bersih berstandar tinggi untuk menjamin kesegaran dan cita rasa masakan.
                                </p>
                            </div>
                            <span className="text-[9px] text-white/35 font-utility uppercase">KITCHEN STANDARD</span>
                        </GlassCard>

                        {/* Cell 4: WhatsApp Message Preview Card */}
                        <GlassCard variant="default" className="anime-bento-card opacity-0 md:col-span-1 lg:col-span-1 p-6 flex flex-col justify-between" hover>
                            <div className="flex justify-between items-start border-b border-black/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] text-white font-bold font-utility">D</div>
                                    <div>
                                        <p className="text-[10px] font-bold text-white/80 leading-none">CS Dewandaru Catering</p>
                                        <p className="text-[7px] text-emerald-600 font-bold leading-none mt-0.5 flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" /> Online
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[8px] font-utility text-white/30 uppercase">WA Live Chat</span>
                            </div>

                            {/* WA Preview Bubbles */}
                            <div className="space-y-2 py-1 font-sans">
                                <div className="flex justify-end">
                                    <div className="bg-[#E2F9EC] border border-[#A6E8C1]/30 text-[10px] px-3 py-1.5 rounded-2xl rounded-tr-none text-[#075E54] max-w-[90%] shadow-[0_1px_3px_rgba(0,0,0,0.03)] leading-relaxed">
                                        Halo Dewandaru Catering! Saya mau tanya detail paket prasmanan Wedding & Event...
                                    </div>
                                </div>
                            </div>

                            <span className="text-[9px] text-white/35 font-utility uppercase tracking-widest mt-1">AUTOMATIC EXPORT</span>
                        </GlassCard>

                        {/* Cell 5: JABODETABEK Coverage */}
                        <GlassCard 
                            variant="default" 
                            className="anime-bento-card opacity-0 md:col-span-1 lg:col-span-1 p-6 flex flex-col justify-between overflow-hidden relative" 
                            style={{ 
                                backgroundSize: '16px 16px', 
                                backgroundImage: 'radial-gradient(circle, rgba(173,138,78,0.06) 1px, transparent 1px)' 
                            }}
                            hover
                        >
                            {/* Locator Animation */}
                            <div className="absolute right-[-15px] bottom-[-15px] w-24 h-24 border border-gold/10 rounded-full flex items-center justify-center pointer-events-none">
                                <div className="w-16 h-16 border border-gold/20 rounded-full flex items-center justify-center animate-ping" />
                                <div className="w-6 h-6 bg-gold/15 border border-gold/30 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-gold rounded-full" />
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-white/40 font-utility block mb-1">Area Layanan</span>
                                <h4 className="font-display font-bold text-white text-sm leading-tight">Bogor & JABODETABEK</h4>
                            </div>

                            <div className="z-10">
                                <p className="text-[9px] text-white/50 leading-relaxed max-w-[130px]">
                                    Pengiriman gratis ongkir untuk seluruh area utama Kota/Kab. Bogor.
                                </p>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </section>

            {/* ───── PACKAGES ───── */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-80px' }}
                    className="text-left mb-14 border-b border-gray-100 pb-6"
                >
                    <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-gold font-semibold font-utility flex items-center gap-1.5">
                        <UtensilsCrossed size={12} /> Layanan Catering
                    </motion.span>
                    <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
                        Pilihan Paket Acara
                    </motion.h2>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="glass-card rounded-2xl overflow-hidden">
                                <div className="skeleton h-48 w-full" />
                                <div className="p-6 space-y-3">
                                    <div className="skeleton h-4 w-3/4" />
                                    <div className="skeleton h-3 w-full" />
                                    <div className="skeleton h-3 w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-60px' }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {allPackages.map((pkg, i) => (
                            <motion.div key={pkg.id} variants={fadeUp}>
                                <GlassCard className="overflow-hidden flex flex-col h-full" hover>
                                    {/* Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={getPackageThumbnail(pkg.slug)}
                                            alt={pkg.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0" style={{ background: 'rgba(25, 27, 29, 0.4)' }} />
                                        <div className="absolute bottom-3 left-3">
                                            <span className="text-[9px] px-2 py-0.5 rounded-full font-utility uppercase tracking-widest border border-white/10 text-white/90 bg-black/35 backdrop-blur-sm">
                                                {pkg.categoryName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 flex flex-col flex-grow space-y-4">
                                        <div>
                                            <h3 className="font-display text-base font-semibold text-white leading-tight">{pkg.name}</h3>
                                            <p className="text-white/45 text-xs mt-1.5 leading-relaxed line-clamp-2">{pkg.description}</p>
                                        </div>

                                        {pkg.menu_items.length > 0 && (
                                            <div className="space-y-2">
                                                <span className="text-[10px] uppercase tracking-widest text-gold/70 font-utility">Sajian Utama</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {pkg.menu_items.slice(0, 4).map(m => (
                                                        <span key={m.id} className="text-[9px] px-2 py-0.5 rounded-full glass-card border border-white/10 text-white/60">
                                                            {m.name}
                                                        </span>
                                                    ))}
                                                    {pkg.menu_items.length > 4 && (
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full text-white/40">
                                                            +{pkg.menu_items.length - 4} lainnya
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                            <div>
                                                <span className="text-[10px] text-white/35 font-utility uppercase">Mulai dari</span>
                                                <p className="text-gold font-bold font-utility text-base">
                                                    Rp {Number(pkg.price_per_pax).toLocaleString('id-ID')}
                                                    <span className="text-xs font-normal text-white/35">/pax</span>
                                                </p>
                                            </div>
                                            <Link to={`/paket/${pkg.slug}`}>
                                                <GlassButton variant="primary" size="sm">
                                                    Hitung Biaya
                                                    <ChevronRight size={14} />
                                                </GlassButton>
                                            </Link>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-10"
                >
                    <Link to="/paket">
                        <GlassButton variant="glass" size="md">
                            Lihat Semua Paket
                            <ArrowRight size={16} />
                        </GlassButton>
                    </Link>
                </motion.div>
            </section>

            {/* ───── TESTIMONIALS ───── */}
            {testimonials.length > 0 && (
                <section className="py-24 px-6 md:px-12 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="text-center mb-14"
                        >
                            <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">
                                Ulasan Client
                            </motion.span>
                            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
                                Kata Mereka
                            </motion.h2>
                        </motion.div>

                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {testimonials.map((t, i) => (
                                <motion.div key={t.id} variants={fadeUp}>
                                    <GlassCard variant="default" className="p-7 flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex gap-1 mb-4">
                                                {[...Array(t.rating)].map((_, j) => (
                                                    <Star key={j} size={14} className="text-gold fill-gold" />
                                                ))}
                                            </div>
                                            <p className="text-white/70 text-sm leading-relaxed italic mb-6">
                                                "{t.content}"
                                            </p>
                                        </div>
                                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                            <span className="text-sm font-semibold text-gold">{t.customer_name}</span>
                                            <span className="text-[10px] text-white/35 font-utility uppercase tracking-wider">{t.event_type}</span>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ───── CTA PENUTUP ───── */}
            <section className="py-28 px-6 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <GlassCard variant="default" className="p-10 md:p-14" hover={false}>
                            <UtensilsCrossed size={32} className="text-gold mx-auto mb-6" />
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                                Siap Rencanakan Acaramu?
                            </h2>
                            <p className="text-white/55 mb-8 leading-relaxed">
                                Pilih paket catering, sesuaikan jumlah tamu, dan dapatkan nota estimasi biaya — semuanya dalam hitungan detik.
                            </p>
                            <Link to="/paket">
                                <GlassButton variant="primary" size="lg">
                                    <UtensilsCrossed size={18} />
                                    Mulai Pilih Paket
                                </GlassButton>
                            </Link>
                        </GlassCard>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
