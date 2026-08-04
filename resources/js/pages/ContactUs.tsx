import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

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
        <div className="relative overflow-x-hidden pb-24 bg-[#F9F8F6]">
            <div className="max-w-6xl mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-12 relative z-10">
                
                {/* Header / Title Section (Spans full width, centered) */}
                <div className="text-center mb-16">
                    <span className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">Hubungi Kami</span>
                    <h1 className="font-display text-3xl md:text-5xl font-bold text-forest mt-2 mb-3">Send Us Message</h1>
                    <p className="text-gray-500 text-xs uppercase tracking-widest font-utility">Respon Cepat via Formulir RSVP</p>
                </div>

                {/* 2-Column Contact Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mb-20">
                    
                    {/* RSVP Form Card (Left) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-7 flex flex-col"
                    >
                        <div className="bg-white border border-gold/15 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden flex-grow flex flex-col justify-between">
                            {/* Decorative background element */}
                            <div className="absolute -right-16 -top-16 w-32 h-32 bg-gold/5 rounded-full blur-xl pointer-events-none" />

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12 space-y-6"
                                >
                                    <CheckCircle2 size={48} className="text-gold mx-auto" />
                                    <h3 className="font-display text-2xl font-bold text-forest">Pesan Terkirim!</h3>
                                    <p className="text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">
                                        Terima kasih telah menghubungi kami. Tim administrasi kami akan membalas pesan Anda secepatnya.
                                    </p>
                                    <button 
                                        onClick={() => setSuccess(false)}
                                        className="bg-gold text-forest font-bold py-2.5 px-6 rounded-xl text-xs tracking-wider uppercase hover:bg-gold-light transition-colors cursor-pointer"
                                    >
                                        Kirim Pesan Lain
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase text-gold font-utility tracking-widest block font-bold">Nama *</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                                placeholder="Nama lengkap Anda..."
                                                className={`w-full bg-[#F9F8F6] border rounded-xl px-3.5 py-2.5 text-sm text-forest placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold focus:bg-white transition-all duration-200 ${errors.name ? 'border-red-500/50' : 'border-gold/10'}`}
                                            />
                                            {errors.name && <p className="text-[9px] text-red-500 font-semibold">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase text-gold font-utility tracking-widest block font-bold">No. WhatsApp *</label>
                                            <input
                                                type="text"
                                                value={form.phone}
                                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                                placeholder="0812xxx..."
                                                className={`w-full bg-[#F9F8F6] border rounded-xl px-3.5 py-2.5 text-sm text-forest placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold focus:bg-white transition-all duration-200 ${errors.phone ? 'border-red-500/50' : 'border-gold/10'}`}
                                            />
                                            {errors.phone && <p className="text-[9px] text-red-500 font-semibold">{errors.phone}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-gold font-utility tracking-widest block font-bold">Email</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                            placeholder="email@contoh.com..."
                                            className="w-full bg-[#F9F8F6] border border-gold/10 rounded-xl px-3.5 py-2.5 text-sm text-forest placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold focus:bg-white transition-all duration-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-gold font-utility tracking-widest block font-bold">Detail Pesan *</label>
                                        <textarea
                                            value={form.message}
                                            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                            rows={4}
                                            placeholder="Ceritakan kebutuhan catering / dekorasi acara Anda..."
                                            className={`w-full bg-[#F9F8F6] border rounded-xl px-3.5 py-2.5 text-sm text-forest placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold focus:bg-white transition-all duration-200 resize-none ${errors.message ? 'border-red-500/50' : 'border-gold/10'}`}
                                        />
                                        {errors.message && <p className="text-[9px] text-red-500 font-semibold">{errors.message}</p>}
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gold text-[#1F2E22] font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:bg-gold-light cursor-pointer font-utility text-[10px] tracking-widest uppercase mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={14} className="text-[#1F2E22]" />
                                        {loading ? 'MENGIRIM...' : 'KIRIM FORMULIR'}
                                    </motion.button>
                                </form>
                            )}
                        </div>
                    </motion.div>

                    {/* Styled Invitation Image Frame (Right) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-5 relative self-stretch min-h-[300px] lg:min-h-[500px] mt-10 lg:mt-0 group"
                    >
                        <div className="absolute inset-0 border-4 border-double border-gold/20 translate-x-3 translate-y-3 rounded-2xl pointer-events-none transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1" />
                        <img
                            src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800"
                            alt="Contact Catering Presentation"
                            className="relative w-full h-full object-cover rounded-2xl shadow-lg border border-gold/10 transition-transform duration-500 group-hover:scale-[0.99]"
                        />
                    </motion.div>
                </div>

            </div>
        </div>
    );
};
