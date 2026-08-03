import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, ArrowRight, Menu, X } from 'lucide-react';
import { AnimatedBlob } from './components/AnimatedBlob';

// Import modular pages
import { Home } from './pages/Home';
import { PackagesCatalog } from './pages/PackagesCatalog';
import { PackageDetails } from './pages/PackageDetails';
import { GalleryGrid } from './pages/GalleryGrid';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';

// ── Navbar item helper
const NavLink: React.FC<{ to: string; label: string; onClick?: () => void }> = ({
    to, label, onClick,
}) => {
    const location = useLocation();
    const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`relative px-1 py-0.5 text-sm transition-colors duration-200 group ${
                active
                    ? 'text-gold font-semibold'
                    : 'text-white/60 hover:text-white font-normal'
            }`}
        >
            {label}
            <span
                className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300 ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
            />
        </Link>
    );
};

// ── Page transition wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

// ── Scroll-aware navbar
const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navLinks = [
        { to: '/', label: 'Beranda' },
        { to: '/paket', label: 'Paket Layanan' },
        { to: '/galeri', label: 'Galeri' },
        { to: '/tentang-kami', label: 'Tentang' },
        { to: '/kontak', label: 'Kontak' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? 'glass-card-dark border-b border-white/10 py-3'
                    : 'bg-transparent py-5'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <img 
                        src="/logo.png" 
                        className={`w-auto object-contain transition-all duration-500 group-hover:scale-105 ${
                            scrolled ? 'h-14 md:h-16' : 'h-20 md:h-24'
                        }`} 
                        alt="Dewandaru Catering Logo" 
                    />
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-7">
                    {navLinks.map(l => (
                        <NavLink key={l.to} {...l} />
                    ))}
                </nav>

                {/* Hamburger */}
                <motion.button
                    className="md:hidden p-2 border border-white/15 rounded-lg text-white/70 hover:text-gold hover:border-gold/40 transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    whileTap={{ scale: 0.92 }}
                    aria-label="Toggle navigation"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.button>
            </div>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.nav
                        key="mobile-nav"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="md:hidden overflow-hidden glass-card-dark border-t border-white/10"
                    >
                        <div className="flex flex-col gap-1 px-6 py-4">
                            {navLinks.map((l) => (
                                <Link
                                    key={l.to}
                                    to={l.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={`py-3 px-2 border-b border-white/5 text-sm transition-colors ${
                                        l.highlight ? 'text-gold font-semibold' : 'text-white/70 hover:text-white'
                                    }`}
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
};

// ── Layout
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden theme-light">
            <Navbar />

            <main className="flex-grow pt-28 md:pt-36 relative z-10">
                <PageTransition>{children}</PageTransition>
            </main>

            {/* WhatsApp Floating Button */}
            <motion.a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-2xl"
                style={{ background: '#25D366' }}
                whileHover={{ scale: 1.1, boxShadow: '0 0 24px rgba(37,211,102,0.5)' }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                <Phone size={24} />
            </motion.a>

            {/* Footer */}
            <footer className="glass-card-dark border-t border-white/8 py-14 px-6 md:px-12 mt-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <h3 className="font-display text-xl text-gold font-bold mb-3">Dewandaru Catering</h3>
                        <p className="text-sm text-white/55 leading-relaxed">
                            Menghadirkan hidangan prasmanan nusantara yang lezat dan dekorasi premium untuk momen pernikahan, gathering, & khitanan Anda.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gold/80 mb-4">Hubungi Kami</h4>
                        <ul className="text-sm text-white/55 space-y-2.5">
                            <li className="flex items-center gap-2.5">
                                <Phone size={13} className="text-gold/70 shrink-0" />
                                <span>+62 812-3456-7890</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail size={13} className="text-gold/70 shrink-0" />
                                <span>info@dewandarucatering.com</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <MapPin size={13} className="text-gold/70 shrink-0 mt-0.5" />
                                <span>Jl. Kebun Raya No. 10, Bogor, Jawa Barat</span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gold/80 mb-4">Informasi Reservasi</h4>
                        <p className="text-sm text-white/55 leading-relaxed mb-4">
                            Pilih paket catering prasmanan dan rincian menu pilihan Anda secara instan — transparan, mudah, dan langsung terhubung dengan admin CS.
                        </p>
                        <Link
                            to="/paket"
                            className="text-gold text-sm font-semibold inline-flex items-center gap-1.5 hover:text-gold-light transition-colors"
                        >
                            Lihat Semua Paket <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
                <div className="border-t border-white/8 mt-10 pt-6 text-center text-xs text-white/30">
                    © {new Date().getFullYear()} Dewandaru Catering. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

// ── Router
const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/paket" element={<PackagesCatalog />} />
            <Route path="/paket/:slug" element={<PackageDetails />} />
            <Route path="/galeri" element={<GalleryGrid />} />
            <Route path="/tentang-kami" element={<AboutUs />} />
            <Route path="/kontak" element={<ContactUs />} />
        </Routes>
    );
};

const App: React.FC = () => (
    <BrowserRouter>
        <Layout>
            <AppRoutes />
        </Layout>
    </BrowserRouter>
);

const container = document.getElementById('app');
if (container) {
    createRoot(container).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
