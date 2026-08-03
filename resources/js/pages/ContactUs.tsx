import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } };

const contacts = [
    { icon: <Phone size={16} />, label: 'WhatsApp', value: '+62 812-3456-7890', href: 'https://wa.me/6281234567890' },
    { icon: <Mail size={16} />, label: 'Email', value: 'info@dewandarucatering.com', href: 'mailto:info@dewandarucatering.com' },
    { icon: <MapPin size={16} />, label: 'Alamat', value: 'Jl. Kebun Raya No. 10, Bogor, Jawa Barat', href: undefined },
    { icon: <Clock size={16} />, label: 'Jam Operasional', value: 'Senin – Sabtu: 08.00 – 17.00 WIB\nMinggu: 09.00 – 14.00 WIB', href: undefined },
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
            <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 relative z-10">
                
                {/* 2-Column Contact Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mt-12 mb-20">
                    
                    {/* RSVP Form Card (Left) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-7"
                    >
                        <div className="mb-8">
                            <span className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">Hubungi Kami</span>
                            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-2 mb-3">Send Us Message</h1>
                            <p className="text-white/40 text-xs uppercase tracking-widest font-utility">Respon Cepat via Formulir RSVP</p>
                        </div>

                        <GlassCard variant="gold" className="p-8 md:p-10 relative overflow-hidden" glow>
                            


                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12 space-y-6"
                                >
                                    <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                                    <h3 className="font-display text-2xl font-bold text-white">Pesan Terkirim!</h3>
                                    <p className="text-white/50 text-xs leading-relaxed max-w-sm mx-auto">
                                        Terima kasih telah menghubungi kami. Tim administrasi kami akan membalas pesan Anda secepatnya.
                                    </p>
                                    <GlassButton variant="glass" size="sm" onClick={() => setSuccess(false)}>
                                        Kirim Pesan Lain
                                    </GlassButton>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8 mt-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase text-white/40 font-utility tracking-widest block font-bold">Nama *</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                                placeholder="Nama lengkap Anda..."
                                                className={`glass-input px-3.5 py-2.5 w-full text-sm placeholder-white/20 ${errors.name ? 'border-red-500/50' : ''}`}
                                            />
                                            {errors.name && <p className="text-[9px] text-red-500">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase text-white/40 font-utility tracking-widest block font-bold">No. WhatsApp *</label>
                                            <input
                                                type="text"
                                                value={form.phone}
                                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                                placeholder="0812xxx..."
                                                className={`glass-input px-3.5 py-2.5 w-full text-sm placeholder-white/20 ${errors.phone ? 'border-red-500/50' : ''}`}
                                            />
                                            {errors.phone && <p className="text-[9px] text-red-500">{errors.phone}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-white/40 font-utility tracking-widest block font-bold">Email</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                            placeholder="email@contoh.com..."
                                            className="glass-input px-3.5 py-2.5 w-full text-sm placeholder-white/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-white/40 font-utility tracking-widest block font-bold">Detail Pesan *</label>
                                        <textarea
                                            value={form.message}
                                            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                            rows={4}
                                            placeholder="Ceritakan kebutuhan catering / dekorasi acara Anda..."
                                            className={`glass-input px-3.5 py-2.5 w-full text-sm placeholder-white/20 resize-none ${errors.message ? 'border-red-500/50' : ''}`}
                                        />
                                        {errors.message && <p className="text-[9px] text-red-500">{errors.message}</p>}
                                    </div>

                                    <GlassButton variant="primary" size="lg" type="submit" disabled={loading} className="w-full mt-4">
                                        <Send size={15} />
                                        {loading ? 'MENGIRIM...' : 'KIRIM FORMULIR'}
                                    </GlassButton>
                                </form>
                            )}
                        </GlassCard>
                    </motion.div>

                    {/* Styled Invitation Image Frame (Right) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-5 relative pr-0 lg:pr-6 self-stretch min-h-[300px] lg:min-h-[500px] mt-10 lg:mt-0"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800"
                            alt="Contact Catering Presentation"
                            className="relative w-full h-full object-cover border border-gray-100 rounded-2xl shadow-sm min-h-[300px] lg:min-h-[500px]"
                        />
                    </motion.div>
                </div>

                {/* Bottom Row Contact Info (Bento Cards) */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-white/10 pt-16"
                >
                    {contacts.map((c, i) => (
                        <motion.div key={i} variants={fadeUp}>
                            <GlassCard className="p-6 h-full flex flex-col justify-between" hover>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl glass-card-gold border border-gold/20 flex items-center justify-center text-gold shrink-0">
                                        {c.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/40 font-utility uppercase tracking-wider mb-1">{c.label}</p>
                                        {c.href ? (
                                            <a href={c.href} target="_blank" rel="noreferrer" className="text-white/80 text-xs hover:text-gold transition-colors font-semibold">
                                                {c.value}
                                            </a>
                                        ) : (
                                            <p className="text-white/70 text-xs font-semibold whitespace-pre-line leading-relaxed">{c.value}</p>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </div>
    );
};
