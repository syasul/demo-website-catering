import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronRight, Star, Clock, Coins, ShieldAlert,
    CheckCircle2, UtensilsCrossed, Sparkles, ArrowRight
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { AnimatedBlob } from '../components/AnimatedBlob';
import type { Category, Testimonial } from '../types';

export const getPackageThumbnail = (slug: string): string => {
    const map: Record<string, string> = {
        'paket-sakinah':  'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800',
        'paket-mawaddah': 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800',
        'paket-rahmah':   'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800',
        'paket-khitanan': 'https://images.unsplash.com/photo-1541014741259-df5290dbf28e?q=80&w=800',
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

    const solutions = [
        { title: 'Harga Real-time', desc: 'Geser jumlah tamu, harga otomatis terhitung seketika.' },
        { title: 'Diskon Bertingkat', desc: 'Volume discount diterapkan otomatis sesuai jumlah pax.' },
        { title: 'Nota Digital', desc: 'Visualisasi nota digital yang bisa langsung dikirim via WhatsApp.' },
        { title: 'Follow-up Cepat', desc: 'Tim PIC catering ditugaskan otomatis setelah Anda submit rincian.' },
    ];

    return (
        <div className="overflow-x-hidden">

            {/* ───── HERO ───── */}
            <section className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden">
                {/* Blobs */}
                <AnimatedBlob color="#AD8A4E" size={500} x="-10%" y="5%"  delay={0}   opacity={0.2} />
                <AnimatedBlob color="#6E2A2A" size={450} x="55%" y="30%" delay={2}   opacity={0.18} />
                <AnimatedBlob color="#2A3B6E" size={380} x="20%" y="60%" delay={4}   opacity={0.15} />

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 glass-card border border-gold/25 text-gold text-xs font-semibold uppercase tracking-widest"
                    >
                        <Sparkles size={12} />
                        Garden Ledger Catering
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
                    >
                        Berapa Biaya{' '}
                        <span className="text-gold text-glow-gold">Catering</span>
                        <br />
                        Acara Anda?
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10"
                    >
                        Rencanakan prasmanan pernikahan, syukuran, atau corporate gathering dengan rincian biaya instan.
                        Transparan, real-time, tanpa perlu menunggu balasan admin.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link to="/paket">
                            <GlassButton variant="primary" size="lg">
                                <UtensilsCrossed size={18} />
                                Pilih Paket & Hitung Biaya
                            </GlassButton>
                        </Link>
                        <Link to="/galeri">
                            <GlassButton variant="glass" size="lg">
                                Lihat Galeri Acara
                                <ChevronRight size={16} />
                            </GlassButton>
                        </Link>
                    </motion.div>

                    {/* Trust bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className="mt-16 flex flex-wrap justify-center gap-8 text-xs text-white/35 uppercase tracking-widest font-utility"
                    >
                        {['500+ Event Sukses', 'Wedding · Khitanan · Corporate', 'Bogor & Jabodetabek', 'Prasmanan Premium'].map(t => (
                            <span key={t}>{t}</span>
                        ))}
                    </motion.div>
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
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                                    style={{ background: 'rgba(110,42,42,0.3)', border: '1px solid rgba(110,42,42,0.4)' }}>
                                    <span className="text-red-400">{p.icon}</span>
                                </div>
                                <h3 className="font-display text-lg font-semibold text-white mb-3">{p.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ───── SOLUTIONS ───── */}
            <section className="py-24 px-6 md:px-12 relative overflow-hidden">
                <AnimatedBlob color="#AD8A4E" size={400} x="70%" y="-10%" delay={1} opacity={0.12} />
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                    >
                        <div className="space-y-6">
                            <span className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">Solusi Kami</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                                Rincian Biaya Mandiri,
                                <br />
                                <span className="text-gold">Instan & Transparan</span>
                            </h2>
                            <p className="text-white/55 leading-relaxed">
                                Platform kami menghadirkan rincian estimasi catering secara real-time — layaknya kasir catering
                                pribadi Anda. Pilih paket, sesuaikan pax, tambahkan add-on, dan dapatkan nota digital seketika.
                            </p>
                            <Link to="/paket">
                                <GlassButton variant="primary" size="md" className="mt-2">
                                    Coba Sekarang
                                    <ArrowRight size={16} />
                                </GlassButton>
                            </Link>
                        </div>

                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            {solutions.map((s, i) => (
                                <motion.div key={i} variants={fadeUp}>
                                    <GlassCard variant="gold" className="p-6">
                                        <CheckCircle2 size={20} className="text-gold mb-3" />
                                        <h4 className="font-semibold text-white text-sm mb-1.5">{s.title}</h4>
                                        <p className="text-white/45 text-xs leading-relaxed">{s.desc}</p>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ───── PACKAGES ───── */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-80px' }}
                    className="text-center mb-14"
                >
                    <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-gold font-semibold font-utility flex items-center justify-center gap-1.5">
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
                                        <div className="absolute inset-0" style={{ background: 'rgba(13,27,16,0.6)' }} />
                                        <div className="absolute bottom-3 left-3">
                                            <span className="text-[9px] px-2 py-0.5 rounded-full font-utility uppercase tracking-widest border border-gold/40 text-gold/90 glass-card">
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

                                        <div className="mt-auto pt-4 border-t border-white/8 flex justify-between items-center">
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
                    <AnimatedBlob color="#6E2A2A" size={350} x="5%" y="20%" delay={3} opacity={0.12} />
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
                                    <GlassCard variant="gold" className="p-7 flex flex-col justify-between h-full">
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
                                        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
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
                <AnimatedBlob color="#AD8A4E" size={500} x="25%" y="-20%" delay={0} opacity={0.13} />
                <div className="relative z-10 max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <GlassCard variant="gold" className="p-10 md:p-14" glow>
                            <Sparkles size={32} className="text-gold mx-auto mb-6" />
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
