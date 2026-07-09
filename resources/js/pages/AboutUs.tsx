import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Award, Users, Clock } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedBlob } from '../components/AnimatedBlob';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } };

const stats = [
    { icon: <Award size={24} />, value: '500+', label: 'Event Sukses' },
    { icon: <Users size={24} />, value: '50K+', label: 'Tamu Dilayani' },
    { icon: <Clock size={24} />, value: '8+', label: 'Tahun Pengalaman' },
    { icon: <Leaf size={24} />, value: '100%', label: 'Bahan Segar Lokal' },
];

const values = [
    { title: 'Kelezatan Nusantara', desc: 'Menu kami merayakan kekayaan kuliner Indonesia — dari soto betawi hingga ayam taliwang — dengan bahan segar pilihan setiap harinya.' },
    { title: 'Transparansi Harga', desc: 'Kami percaya setiap client berhak tahu rincian biaya sejak awal. Platform rincian mandiri kami hadir untuk mewujudkan itu.' },
    { title: 'Ketepatan Operasional', desc: 'Katering tepat waktu, porsi pas, dan tim pramusaji yang profesional adalah standar minimum yang selalu kami pertahankan.' },
];

export const AboutUs: React.FC = () => {
    return (
        <div className="relative overflow-x-hidden pb-24">
            <AnimatedBlob color="#AD8A4E" size={500} x="-10%" y="10%" delay={0} opacity={0.1} />
            <AnimatedBlob color="#6E2A2A" size={350} x="70%" y="50%" delay={3} opacity={0.1} />

            <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 space-y-16 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center"
                >
                    <span className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">Tentang Kami</span>
                    <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-2 mb-5">Garden Ledger Catering</h1>
                    <div className="h-px w-16 bg-gold/50 mx-auto" />
                </motion.div>

                {/* Intro */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <GlassCard variant="gold" className="p-8 md:p-12">
                        <p className="text-white/70 leading-relaxed text-base mb-5">
                            Didirikan dengan tekad menghadirkan kemudahan dan transparansi biaya bagi setiap calon pengantin
                            dan pelaksana acara, <strong className="text-gold">Garden Ledger Catering</strong> menggabungkan
                            dua filosofi penting: <em className="text-white/85">kelezatan masakan nusantara</em> dan{' '}
                            <em className="text-white/85">sistem rincian biaya mandiri yang transparan</em>.
                        </p>
                        <p className="text-white/55 leading-relaxed">
                            Kami menyadari bahwa masalah terbesar dalam mempersiapkan katering acara adalah kebingungan
                            terhadap akumulasi biaya. Melalui platform digital kami, Anda bebas merencanakan kebutuhan
                            prasmanan, menghitung volume discount, dan memilih add-on dekorasi — semuanya secara real-time,
                            tanpa perlu menunggu balasan admin.
                        </p>
                    </GlassCard>
                </motion.div>

                {/* Stats */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {stats.map((s, i) => (
                        <motion.div key={i} variants={fadeUp}>
                            <GlassCard className="p-6 text-center" hover>
                                <div className="text-gold mb-3 flex justify-center">{s.icon}</div>
                                <p className="font-display text-2xl font-bold text-white mb-1">{s.value}</p>
                                <p className="text-white/40 text-xs font-utility uppercase tracking-wider">{s.label}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Values */}
                <div className="space-y-5">
                    <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-5 bg-gold rounded-full inline-block" />
                        Nilai yang Kami Pegang
                    </h2>
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-5"
                    >
                        {values.map((v, i) => (
                            <motion.div key={i} variants={fadeUp}>
                                <GlassCard className="p-6 h-full" hover>
                                    <h3 className="font-semibold text-gold mb-3 text-sm">{v.title}</h3>
                                    <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
