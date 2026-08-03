import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Award, Users, Clock, UtensilsCrossed } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const AboutUs: React.FC = () => {
    return (
        <div className="relative overflow-x-hidden pb-24">
            <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 relative z-10">
                
                {/* Header Section */}
                <div className="text-center mb-16 mt-12">
                    <span className="text-xs uppercase tracking-widest text-gold font-semibold font-utility">Cerita Kami</span>
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-2">About Us</h1>
                    <p className="text-white/40 text-[10px] mt-3 uppercase tracking-widest font-utility">Dewandaru Catering & Events</p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[230px]">
                    
                    {/* Cell 1: Our Story (spans 2x2) */}
                    <GlassCard variant="default" className="md:col-span-2 md:row-span-2 p-8 flex flex-col justify-between" hover>
                        <div className="space-y-6">
                            <span className="text-xs uppercase tracking-wider text-gold font-semibold font-utility block">Filosofi Dapur Kami</span>
                            <h2 className="font-display text-xl md:text-2xl font-bold text-white leading-relaxed">
                                Menghadirkan Cita Rasa Nusantara Dengan Transparansi Penuh
                            </h2>
                            <p className="text-white/60 text-xs leading-relaxed">
                                Didirikan dengan tekad menghadirkan kemudahan dan transparansi biaya bagi setiap pelaksana acara, <strong className="text-gold">Dewandaru Catering</strong> menggabungkan kelezatan masakan nusantara dengan sistem pencatatan rincian menu yang transparan.
                            </p>
                            <p className="text-white/50 text-xs leading-relaxed">
                                Kami menyadari kebingungan terhadap kalkulasi menu seringkali menjadi kendala utama dalam perencanaan. Melalui platform digital kami, Anda bebas menentukan porsi tamu dan memilih paket hidangan prasmanan secara instan.
                            </p>
                        </div>
                        <div className="border-t border-white/5 pt-4 text-[10px] text-white/35 font-utility uppercase tracking-widest">
                            EST. 2018 · BOGOR & JABODETABEK
                        </div>
                    </GlassCard>

                    {/* Cell 2: Photo Frame Chef (spans 1x2) */}
                    <GlassCard variant="default" className="md:col-span-1 md:row-span-2 p-6 flex flex-col justify-between relative overflow-hidden" hover>
                        <div className="relative h-[320px] rounded-xl overflow-hidden">
                            <img 
                                src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800"
                                alt="Chef preparing food"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <div className="absolute bottom-3 left-3">
                                <p className="text-[10px] font-utility uppercase tracking-wider text-gold font-bold">Dapur Premium</p>
                                <p className="font-display text-sm font-semibold text-white/90">Dewandaru Culinary Team</p>
                            </div>
                        </div>
                        <div className="pt-2 text-center">
                            <span className="text-[10px] text-gold/80 font-utility uppercase tracking-widest font-bold">100% BAHAN LOKAL SEGAR</span>
                        </div>
                    </GlassCard>

                    {/* Cell 3: Ledger Stats Sheet */}
                    <GlassCard variant="default" className="p-6 flex flex-col justify-between" hover>
                        <span className="text-[10px] uppercase tracking-wider text-white/40 font-utility">Akumulasi Event</span>
                        <div className="space-y-4">
                            <div className="flex justify-between items-baseline font-utility border-b border-gray-100 pb-2 text-xs">
                                <span className="text-white/50">Event Sukses</span>
                                <span className="font-bold text-white text-base">500+ Acara</span>
                            </div>
                            <div className="flex justify-between items-baseline font-utility pt-1 text-xs">
                                <span className="text-white/50">Tamu Dilayani</span>
                                <span className="font-bold text-white text-base">50K+ Tamu</span>
                            </div>
                        </div>
                        <span className="text-[9px] text-white/35 font-utility uppercase">RECORDED DATA</span>
                    </GlassCard>

                    {/* Cell 4: Kelezatan Nusantara */}
                    <GlassCard variant="default" className="p-6 flex flex-col justify-between" hover>
                        <span className="text-[10px] uppercase tracking-wider text-white/40 font-utility">Kelezatan</span>
                        <div>
                            <h4 className="font-semibold text-gold text-xs uppercase mb-1.5">Kelezatan Nusantara</h4>
                            <p className="text-white/50 text-[11px] leading-relaxed line-clamp-3">
                                Menu prasmanan khas Indonesia disajikan dengan bahan segar dan rempah otentik pilihan.
                            </p>
                        </div>
                        <span className="text-[9px] text-white/35 font-utility uppercase">CITA RASA KITA</span>
                    </GlassCard>

                    {/* Cell 5: Transparansi Penuh */}
                    <GlassCard variant="default" className="p-6 flex flex-col justify-between" hover>
                        <span className="text-[10px] uppercase tracking-wider text-white/40 font-utility">Integritas</span>
                        <div>
                            <h4 className="font-semibold text-gold text-xs uppercase mb-1.5">Harga Jujur</h4>
                            <p className="text-white/50 text-[11px] leading-relaxed line-clamp-3">
                                Rincian pilihan menu catering prasmanan yang transparan tanpa ada biaya tersembunyi.
                            </p>
                        </div>
                        <span className="text-[9px] text-white/35 font-utility uppercase">TRANSPARANSI PENUH</span>
                    </GlassCard>

                </div>
            </div>
        </div>
    );
};
