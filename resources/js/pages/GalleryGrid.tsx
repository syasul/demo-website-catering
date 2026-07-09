import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { AnimatedBlob } from '../components/AnimatedBlob';
import type { Gallery } from '../types';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export const GalleryGrid: React.FC = () => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState<Gallery | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/galleries');
                if (res.ok) setGalleries(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="relative px-6 md:px-12 py-12 max-w-7xl mx-auto overflow-x-hidden">
            <AnimatedBlob color="#AD8A4E" size={400} x="60%" y="-5%" delay={0} opacity={0.12} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <span className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">Dokumentasi</span>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-2">Galeri Event Kami</h1>
                <p className="text-white/40 mt-3 text-sm max-w-lg mx-auto">
                    Rekam jejak acara-acara berkesan yang telah kami layani dengan penuh dedikasi.
                </p>
            </motion.div>

            {loading ? (
                <div className="columns-1 sm:columns-2 md:columns-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`skeleton rounded-2xl mb-4 ${i % 3 === 0 ? 'h-64' : i % 3 === 1 ? 'h-48' : 'h-80'}`} />
                    ))}
                </div>
            ) : (
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4"
                >
                    {galleries.map(img => (
                        <motion.div
                            key={img.id}
                            variants={fadeUp}
                            className="break-inside-avoid mb-4 relative group overflow-hidden rounded-2xl glass-card border border-white/10 cursor-pointer"
                            onClick={() => setLightbox(img)}
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <img
                                src={img.image}
                                alt={img.title}
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: 'rgba(13,27,16,0.85)' }}>
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    className="flex justify-between items-end"
                                >
                                    <div>
                                        <h4 className="font-semibold text-white text-sm">{img.title}</h4>
                                        {img.event_date && (
                                            <p className="text-[10px] text-white/40 font-utility mt-0.5">
                                                {new Date(img.event_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-8 h-8 rounded-full glass-card border border-white/20 flex items-center justify-center text-white/70">
                                        <ZoomIn size={14} />
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        key="lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md"
                        style={{ background: 'rgba(0,0,0,0.85)' }}
                        onClick={() => setLightbox(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="relative max-w-4xl w-full max-h-[85vh] flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setLightbox(null)}
                                className="absolute -top-4 -right-4 z-10 w-9 h-9 rounded-full glass-card border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                            <img
                                src={lightbox.image}
                                alt={lightbox.title}
                                className="w-full max-h-[75vh] object-contain rounded-2xl"
                            />
                            <div className="mt-4 text-center">
                                <p className="font-semibold text-white">{lightbox.title}</p>
                                {lightbox.event_date && (
                                    <p className="text-[11px] text-white/40 font-utility mt-1">
                                        {new Date(lightbox.event_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
