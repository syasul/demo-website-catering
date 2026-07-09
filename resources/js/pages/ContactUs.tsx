import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { AnimatedBlob } from '../components/AnimatedBlob';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } };

const contacts = [
    { icon: <Phone size={18} />, label: 'WhatsApp', value: '+62 812-3456-7890', href: 'https://wa.me/6281234567890' },
    { icon: <Mail size={18} />, label: 'Email', value: 'info@gardencatering.com', href: 'mailto:info@gardencatering.com' },
    { icon: <MapPin size={18} />, label: 'Alamat', value: 'Jl. Kebun Raya No. 10, Bogor, Jawa Barat', href: undefined },
];

export const ContactUs: React.FC = () => {
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Nama wajib diisi';
        if (!form.phone.trim() && !form.email.trim()) e.phone = 'Isi minimal satu — No. WhatsApp atau email';
        if (!form.message.trim()) e.message = 'Pesan wajib diisi';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email, message: form.message }),
            });
            if (res.ok) {
                setSuccess(true);
                setForm({ name: '', phone: '', email: '', message: '' });
            } else {
                const d = await res.json();
                alert(d.message || 'Terjadi kesalahan.');
            }
        } catch {
            alert('Gagal menghubungi server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative overflow-x-hidden pb-24">
            <AnimatedBlob color="#AD8A4E" size={450} x="-5%" y="20%" delay={0} opacity={0.12} />
            <AnimatedBlob color="#2A3B6E" size={380} x="65%" y="40%" delay={2} opacity={0.1} />

            <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <span className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">Hubungi Kami</span>
                    <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-2">Bicara Dengan Kami</h1>
                    <p className="text-white/40 mt-3 text-sm max-w-md mx-auto">
                        Siap membantu merencanakan catering acara Anda. Isi form atau hubungi langsung via WhatsApp.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Contact info */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        className="lg:col-span-4 space-y-4"
                    >
                        {contacts.map((c, i) => (
                            <motion.div key={i} variants={fadeUp}>
                                <GlassCard className="p-5" hover>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl glass-card-gold border border-gold/30 flex items-center justify-center text-gold shrink-0">
                                            {c.icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/35 font-utility uppercase tracking-wider mb-1">{c.label}</p>
                                            {c.href ? (
                                                <a href={c.href} target="_blank" rel="noreferrer" className="text-white/80 text-sm hover:text-gold transition-colors">
                                                    {c.value}
                                                </a>
                                            ) : (
                                                <p className="text-white/70 text-sm">{c.value}</p>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}

                        <motion.div variants={fadeUp}>
                            <GlassCard variant="gold" className="p-5">
                                <p className="text-[10px] text-white/35 font-utility uppercase tracking-wider mb-2">Jam Operasional</p>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    Senin – Sabtu: 08.00 – 17.00 WIB<br />
                                    Minggu: 09.00 – 14.00 WIB
                                </p>
                            </GlassCard>
                        </motion.div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-8"
                    >
                        <GlassCard className="p-7 md:p-10">
                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-5" />
                                    <h3 className="font-display text-2xl font-bold text-white mb-3">Pesan Terkirim!</h3>
                                    <p className="text-white/50 text-sm leading-relaxed mb-6">
                                        Terima kasih telah menghubungi kami. Tim kami akan membalas pesan Anda secepatnya.
                                    </p>
                                    <GlassButton variant="glass" size="md" onClick={() => setSuccess(false)}>
                                        Kirim Pesan Lain
                                    </GlassButton>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <h3 className="font-semibold text-white mb-2">Kirim Pesan</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-white/40 font-utility tracking-wider">Nama *</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                                placeholder="Nama Anda"
                                                className={`glass-input w-full px-3 py-2.5 rounded-xl text-sm ${errors.name ? 'border-red-500/60' : ''}`}
                                            />
                                            {errors.name && <p className="text-[10px] text-red-400">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-white/40 font-utility tracking-wider">No. WhatsApp</label>
                                            <input
                                                type="text"
                                                value={form.phone}
                                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                                placeholder="0812xxx"
                                                className={`glass-input w-full px-3 py-2.5 rounded-xl text-sm ${errors.phone ? 'border-red-500/60' : ''}`}
                                            />
                                            {errors.phone && <p className="text-[10px] text-red-400">{errors.phone}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-white/40 font-utility tracking-wider">Email</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                            placeholder="email@contoh.com"
                                            className="glass-input w-full px-3 py-2.5 rounded-xl text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-white/40 font-utility tracking-wider">Pesan *</label>
                                        <textarea
                                            value={form.message}
                                            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                            rows={5}
                                            placeholder="Ceritakan kebutuhan acara Anda..."
                                            className={`glass-input w-full px-3 py-2.5 rounded-xl text-sm resize-none ${errors.message ? 'border-red-500/60' : ''}`}
                                        />
                                        {errors.message && <p className="text-[10px] text-red-400">{errors.message}</p>}
                                    </div>

                                    <GlassButton variant="primary" size="lg" type="submit" disabled={loading} className="w-full">
                                        <Send size={16} />
                                        {loading ? 'Mengirim...' : 'Kirim Pesan'}
                                    </GlassButton>
                                </form>
                            )}
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
