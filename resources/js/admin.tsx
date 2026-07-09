import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Users, FolderKanban, ChefHat, 
    Settings as SettingsIcon, LogOut, ShieldAlert, Percent, AlertCircle
} from 'lucide-react';
import type { User } from './types';

// Components
import { GlassCard } from './components/GlassCard';
import { GlassButton } from './components/GlassButton';
import { AnimatedBlob } from './components/AnimatedBlob';

// Import refactored panels
import { DashboardPanel } from './admin/DashboardPanel';
import { LeadsPanel } from './admin/LeadsPanel';
import { PackagesPanel } from './admin/PackagesPanel';
import { PricingPanel } from './admin/PricingPanel';
import { SettingsPanel } from './admin/SettingsPanel';
import { UsersPanel } from './admin/UsersPanel';
import { LogsPanel } from './admin/LogsPanel';

const fadeProps = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
};

// --- ADMIN CONTROL CENTER ---
const AdminApp: React.FC = () => {
    const [authChecked, setAuthChecked] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Navigation Active Panel
    const [activePanel, setActivePanel] = useState<'dashboard' | 'leads' | 'packages' | 'pricing' | 'settings' | 'users' | 'logs'>('dashboard');

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (e) {
            setUser(null);
        } finally {
            setAuthChecked(true);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');

        try {
            await fetch('/sanctum/csrf-cookie');
            
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });

            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                checkSession();
            } else {
                setLoginError(data.message || 'Kredensial salah.');
            }
        } catch (err) {
            setLoginError('Koneksi gagal. Silakan coba lagi.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                setUser(null);
                setActivePanel('dashboard');
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!authChecked) {
        return (
            <div className="flex justify-center items-center min-h-screen" style={{ background: '#0d1b10' }}>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold"></div>
            </div>
        );
    }

    // LOGIN SCREEN (Dark Glassmorphism)
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#0d1b10' }}>
                <AnimatedBlob color="#AD8A4E" size={400} x="-5%" y="10%" delay={0} opacity={0.15} />
                <AnimatedBlob color="#1F2E22" size={350} x="60%" y="40%" delay={2} opacity={0.3} />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full relative z-10"
                >
                    <GlassCard variant="gold" className="p-8 md:p-10" glow>
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 border-2 border-gold/60 rounded-full flex items-center justify-center font-display text-gold text-2xl font-bold mx-auto mb-4 bg-gold/10">
                                G
                            </div>
                            <h2 className="font-display text-2xl font-bold text-white uppercase tracking-widest text-glow-gold">ADMIN PORTAL</h2>
                            <p className="text-xs font-utility text-white/50 mt-2">Garden Ledger Catering CRM</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-white/50 block font-utility">Email Address</label>
                                <input 
                                    type="email" 
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                    className="glass-input w-full p-3 rounded-xl text-sm"
                                    placeholder="admin@catering.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-white/50 block font-utility">Password</label>
                                <input 
                                    type="password" 
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                    className="glass-input w-full p-3 rounded-xl text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            <AnimatePresence>
                                {loginError && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-500/10 text-red-400 text-xs p-3 rounded-xl border border-red-500/20 flex items-center gap-2"
                                    >
                                        <AlertCircle size={14} className="shrink-0" />
                                        <span>{loginError}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <GlassButton 
                                type="submit" 
                                variant="primary"
                                disabled={loginLoading}
                                className="w-full mt-2"
                            >
                                {loginLoading ? 'Memverifikasi...' : 'Sign In'}
                            </GlassButton>
                        </form>
                    </GlassCard>
                </motion.div>
            </div>
        );
    }

    // MAIN DASHBOARD LAYOUT (Dark Glassmorphism)
    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#0d1b10' }}>
            
            {/* NAVIGATION SIDEBAR */}
            <aside className="w-64 glass-card-dark border-r border-white/10 flex flex-col justify-between shrink-0 font-sans z-20 relative">
                <div>
                    <div className="p-6 border-b border-white/5 flex items-center gap-3">
                        <div className="w-9 h-9 border border-gold/60 rounded-full flex items-center justify-center font-display text-gold text-lg font-bold bg-gold/5 shadow-[0_0_15px_rgba(173,138,78,0.2)]">
                            G
                        </div>
                        <div>
                            <span className="font-display text-sm font-bold tracking-wide block text-gold leading-none text-glow-gold">GARDEN LEDGER</span>
                            <span className="text-[9px] uppercase tracking-widest text-white/40 font-utility mt-1 block">CRM Panel</span>
                        </div>
                    </div>

                    <div className="p-5 border-b border-white/5 text-xs font-utility text-white/60 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gold">
                            <Users size={14} />
                        </div>
                        <div>
                            <div className="font-bold text-white text-xs">{user.name}</div>
                            <div className="text-[9px] uppercase tracking-wider text-gold/70">{user.role.replace('_', ' ')}</div>
                        </div>
                    </div>

                    <nav className="p-4 space-y-1.5">
                        <button 
                            onClick={() => setActivePanel('dashboard')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'dashboard' ? 'bg-gold/10 text-gold shadow-[inset_0_0_0_1px_rgba(173,138,78,0.3)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                        >
                            <LayoutDashboard size={16} /> Dashboard
                        </button>
                        <button 
                            onClick={() => setActivePanel('leads')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'leads' ? 'bg-gold/10 text-gold shadow-[inset_0_0_0_1px_rgba(173,138,78,0.3)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                        >
                            <FolderKanban size={16} /> CRM Pipeline
                        </button>
                        
                        {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'finance') && (
                            <>
                                <button 
                                    onClick={() => setActivePanel('packages')}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'packages' ? 'bg-gold/10 text-gold shadow-[inset_0_0_0_1px_rgba(173,138,78,0.3)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                                >
                                    <ChefHat size={16} /> Paket & Menu
                                </button>
                                <button 
                                    onClick={() => setActivePanel('pricing')}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'pricing' ? 'bg-gold/10 text-gold shadow-[inset_0_0_0_1px_rgba(173,138,78,0.3)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Percent size={16} /> Harga & Diskon
                                </button>
                            </>
                        )}

                        {(user.role === 'super_admin' || user.role === 'admin') && (
                            <button 
                                onClick={() => setActivePanel('settings')}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'settings' ? 'bg-gold/10 text-gold shadow-[inset_0_0_0_1px_rgba(173,138,78,0.3)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                            >
                                <SettingsIcon size={16} /> Pengaturan
                            </button>
                        )}

                        {user.role === 'super_admin' && (
                            <>
                                <button 
                                    onClick={() => setActivePanel('users')}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'users' ? 'bg-gold/10 text-gold shadow-[inset_0_0_0_1px_rgba(173,138,78,0.3)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Users size={16} /> Manajemen Staff
                                </button>
                                <button 
                                    onClick={() => setActivePanel('logs')}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'logs' ? 'bg-gold/10 text-gold shadow-[inset_0_0_0_1px_rgba(173,138,78,0.3)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                                >
                                    <ShieldAlert size={16} /> Audit Trail
                                </button>
                            </>
                        )}
                    </nav>
                </div>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 glass-card border border-red-500/20 text-red-400 hover:bg-red-500/10 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        <LogOut size={14} /> Keluar
                    </button>
                </div>
            </aside>

            {/* MAIN DATA PANELS (Content Area) */}
            <main className="flex-grow overflow-y-auto max-w-[calc(100vw-256px)] relative">
                {/* Background Blobs for main content area */}
                <AnimatedBlob color="#AD8A4E" size={500} x="80%" y="-10%" delay={0} opacity={0.07} />
                <AnimatedBlob color="#1F2E22" size={600} x="-10%" y="60%" delay={2} opacity={0.15} />

                <div className="p-8 relative z-10 min-h-full">
                    <AnimatePresence mode="wait">
                        {activePanel === 'dashboard' && <motion.div key="dashboard" {...fadeProps}><DashboardPanel user={user} /></motion.div>}
                        {activePanel === 'leads' && <motion.div key="leads" {...fadeProps}><LeadsPanel user={user} /></motion.div>}
                        {activePanel === 'packages' && <motion.div key="packages" {...fadeProps}><PackagesPanel user={user} /></motion.div>}
                        {activePanel === 'pricing' && <motion.div key="pricing" {...fadeProps}><PricingPanel user={user} /></motion.div>}
                        {activePanel === 'settings' && <motion.div key="settings" {...fadeProps}><SettingsPanel /></motion.div>}
                        {activePanel === 'users' && <motion.div key="users" {...fadeProps}><UsersPanel /></motion.div>}
                        {activePanel === 'logs' && <motion.div key="logs" {...fadeProps}><LogsPanel /></motion.div>}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

// --- BOOTSTRAP CONTROL ---
const container = document.getElementById('admin-app');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <AdminApp />
        </React.StrictMode>
    );
}
