import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, Filter } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { getPackageThumbnail } from './Home';
import type { Category, Package } from '../types';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } };

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
            
            {/* Header and Filter Bento Panel */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-8 mb-10 mt-12 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-left max-w-xl"
                >
                    <span className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">Pilihan Layanan</span>
                    <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-2 mb-3">
                        Katalog Catering
                    </h1>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-utility">
                        Rincian Pilihan Menu Terbaik Untuk Acara Spesial Anda
                    </p>
                </motion.div>

                {/* Category Filters Boxed in Bento Row */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.45 }}
                >
                    <GlassCard className="p-3 flex flex-wrap items-center gap-3">
                        {[{ id: null, name: 'Semua' }, ...categories].map((cat) => {
                            const active = selectedCategory === (cat.id ?? null);
                            return (
                                <motion.button
                                    key={cat.id ?? 'all'}
                                    onClick={() => setSelectedCategory(cat.id ?? null)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200 border ${
                                        active
                                            ? 'bg-[#111111] border-[#111111] text-[#FFFFFF] shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900'
                                    }`}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {cat.name}
                                </motion.button>
                            );
                        })}
                    </GlassCard>
                </motion.div>
            </div>

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
                            <GlassCard className="overflow-hidden flex flex-col h-full relative" hover>
                                
                                {/* Package Image frame with double-line corner style */}
                                <div className="relative h-48 overflow-hidden m-4 rounded-xl border border-gold/15">
                                    <img
                                        src={getPackageThumbnail(pkg.slug)}
                                        alt={pkg.name}
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute bottom-3 left-3">
                                        <span className="text-[8px] px-2 py-0.5 rounded-full font-utility uppercase tracking-widest border border-gold/40 text-gold/90 bg-black/35 backdrop-blur-md">
                                            {(pkg as any).category?.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Printed Menu Content Layout */}
                                <div className="px-6 pb-6 pt-2 flex flex-col flex-grow justify-between gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h2 className="font-display text-lg font-bold text-white leading-tight uppercase tracking-wide border-b border-gray-100 pb-2">
                                                {pkg.name}
                                            </h2>
                                            <p className="text-white/40 text-xs mt-2.5 leading-relaxed line-clamp-2">{pkg.description}</p>
                                        </div>

                                        {/* Styled Menu Items listing (looks like wedding menu card) */}
                                        {pkg.menu_items.length > 0 && (
                                            <div className="space-y-1.5">
                                                <p className="text-[9px] uppercase tracking-widest text-gold/60 font-utility font-bold flex items-center gap-1">
                                                    <Sparkles size={10} /> Sajian Utama
                                                </p>
                                                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                                    {pkg.menu_items.slice(0, 4).map(m => (
                                                        <span key={m.id} className="text-[10px] text-white/60 truncate font-display">
                                                            · {m.name}
                                                        </span>
                                                    ))}
                                                    {pkg.menu_items.length > 4 && (
                                                        <span className="text-[10px] text-white/35 font-utility col-span-2">
                                                            +{pkg.menu_items.length - 4} Menu Lainnya...
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Details: Capacity, Pricing, CTA */}
                                    <div className="border-t border-gray-100 pt-4 space-y-4 mt-auto">
                                        <div className="flex justify-between items-center text-[10px] text-white/35 font-utility uppercase tracking-wider">
                                            <span>Min. Order</span>
                                            <span className="font-bold text-white/60">{pkg.min_pax} Pax</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] text-white/30 font-utility uppercase">Tarif per pax</p>
                                                <p className="text-gold font-bold font-utility text-base leading-none">
                                                    Rp {Number(pkg.price_per_pax).toLocaleString('id-ID')}
                                                    <span className="text-[10px] font-normal text-white/30">/pax</span>
                                                </p>
                                            </div>
                                            <Link to={`/paket/${pkg.slug}`}>
                                                <GlassButton variant="primary" size="sm" className="px-5 py-2.5">
                                                    Lihat Rincian
                                                    <ChevronRight size={13} />
                                                </GlassButton>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {!loading && packages.length === 0 && (
                <div className="text-center py-20 text-white/30 text-xs font-utility uppercase tracking-widest">
                    Tidak ada paket untuk kategori ini.
                </div>
            )}
        </div>
    );
};
