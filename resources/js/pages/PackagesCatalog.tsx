import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Filter } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { AnimatedBlob } from '../components/AnimatedBlob';
import { getPackageThumbnail } from './Home';
import type { Category, Package } from '../types';

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export const PackagesCatalog: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCatalog = async () => {
            setLoading(true);
            try {
                const catRes = await fetch('/api/categories');
                if (catRes.ok) setCategories(await catRes.json());

                let url = '/api/packages?sort=price_asc';
                if (selectedCategory) url += `&category_id=${selectedCategory}`;

                const pkgRes = await fetch(url);
                if (pkgRes.ok) setPackages(await pkgRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCatalog();
    }, [selectedCategory]);

    return (
        <div className="relative min-h-screen px-6 md:px-12 py-12 max-w-7xl mx-auto overflow-x-hidden">
            <AnimatedBlob color="#AD8A4E" size={400} x="65%" y="-5%" delay={0} opacity={0.12} />

            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center mb-12"
            >
                <span className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">Katalog Lengkap</span>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-2 mb-4">
                    Pilihan Paket Catering
                </h1>
                <p className="text-white/45 max-w-xl mx-auto text-sm leading-relaxed">
                    Pilih paket yang sesuai dengan jenis acara dan anggaran Anda, lalu hitung estimasi biaya secara langsung.
                </p>
            </motion.div>

            {/* Category Filter */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.45 }}
                className="flex flex-wrap items-center justify-center gap-2 mb-10"
            >
                <span className="text-white/30 mr-1">
                    <Filter size={14} />
                </span>
                {[{ id: null, name: 'Semua Paket' }, ...categories].map((cat) => {
                    const active = selectedCategory === (cat.id ?? null);
                    return (
                        <motion.button
                            key={cat.id ?? 'all'}
                            onClick={() => setSelectedCategory(cat.id ?? null)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                                active
                                    ? 'bg-gold/20 border-gold/50 text-gold'
                                    : 'glass-card border-white/10 text-white/50 hover:text-white hover:border-white/20'
                            }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            {cat.name}
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Package Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass-card rounded-2xl overflow-hidden">
                            <div className="skeleton h-52 w-full" />
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
                    key={selectedCategory ?? 'all'}
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {packages.map((pkg) => (
                        <motion.div key={pkg.id} variants={fadeUp}>
                            <GlassCard className="overflow-hidden flex flex-col h-full" hover>
                                {/* Image */}
                                <div className="relative h-52 overflow-hidden">
                                    <img
                                        src={getPackageThumbnail(pkg.slug)}
                                        alt={pkg.name}
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div
                                        className="absolute inset-0"
                                        style={{ background: 'rgba(13,27,16,0.55)' }}
                                    />
                                    <div className="absolute bottom-3 left-3">
                                        <span className="text-[9px] px-2 py-0.5 rounded-full font-utility uppercase tracking-widest border border-gold/40 text-gold/90 glass-card">
                                            {(pkg as any).category?.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-grow gap-4">
                                    <div>
                                        <h2 className="font-display text-base font-semibold text-white">{pkg.name}</h2>
                                        <p className="text-white/40 text-xs mt-1.5 leading-relaxed line-clamp-2">{pkg.description}</p>
                                    </div>

                                    {/* Menu chips */}
                                    {pkg.menu_items.length > 0 && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-gold/60 font-utility mb-2">Menu Utama</p>
                                            <div className="flex flex-wrap gap-1">
                                                {pkg.menu_items.slice(0, 5).map(m => (
                                                    <span key={m.id} className="text-[9px] px-2 py-0.5 rounded-full glass-card border border-white/10 text-white/55">
                                                        {m.name}
                                                    </span>
                                                ))}
                                                {pkg.menu_items.length > 5 && (
                                                    <span className="text-[9px] text-white/30">+{pkg.menu_items.length - 5}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Capacity */}
                                    <div className="text-xs text-white/30 font-utility">
                                        Min. {pkg.min_pax} pax · Max. {pkg.max_pax || '∞'} pax
                                    </div>

                                    {/* Price + CTA */}
                                    <div className="mt-auto pt-4 border-t border-white/8 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-white/30 font-utility uppercase">Mulai dari</p>
                                            <p className="text-gold font-bold font-utility text-lg">
                                                Rp {Number(pkg.price_per_pax).toLocaleString('id-ID')}
                                                <span className="text-xs font-normal text-white/30">/pax</span>
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

            {!loading && packages.length === 0 && (
                <div className="text-center py-20 text-white/30 text-sm">
                    Tidak ada paket untuk kategori ini.
                </div>
            )}
        </div>
    );
};
