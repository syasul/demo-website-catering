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
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold"></div>
            </div>
        );
    }

    // LOGIN SCREEN (Light Theme)
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-50">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full relative z-10"
                >
                    <div className="bg-white p-8 md:p-10 shadow-xl rounded-2xl border border-gray-100">
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 border-2 border-gold/60 rounded-full flex items-center justify-center font-display text-gold text-2xl font-bold mx-auto mb-4 bg-gold/10">
                                G
                            </div>
                            <h2 className="font-display text-2xl font-bold text-gray-800 uppercase tracking-widest">ADMIN PORTAL</h2>
                            <p className="text-xs font-utility text-gray-500 mt-2">Garden Ledger Catering CRM</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block font-utility">Email Address</label>
                                <input 
                                    type="email" 
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                    className="w-full p-3 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                                    placeholder="admin@catering.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block font-utility">Password</label>
                                <input 
                                    type="password" 
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                    className="w-full p-3 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
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

                            <button 
                                type="submit" 
                                disabled={loginLoading}
                                className="w-full mt-2 bg-gold text-white font-bold tracking-wider py-3 rounded-xl hover:bg-gold-light transition-colors"
                            >
                                {loginLoading ? 'Memverifikasi...' : 'Sign In'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        );
    }

    // MAIN DASHBOARD LAYOUT (Light Theme)
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            
            {/* NAVIGATION SIDEBAR */}
            <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col justify-between shrink-0 font-sans z-20 relative">
                <div>
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-9 h-9 border border-gold/60 rounded-full flex items-center justify-center font-display text-gold text-lg font-bold bg-gold/5">
                            G
                        </div>
                        <div>
                            <span className="font-display text-sm font-bold tracking-wide block text-gray-800 leading-none">GARDEN LEDGER</span>
                            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-utility mt-1 block">CRM Panel</span>
                        </div>
                    </div>

                    <div className="p-5 border-b border-gray-100 text-xs font-utility text-gray-600 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <Users size={14} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-800 text-xs">{user.name}</div>
                        </div>
                    </div>

                    <nav className="p-4 space-y-1.5">
                        <button 
                            onClick={() => setActivePanel('dashboard')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'dashboard' ? 'bg-gold/10 text-gold' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                        >
                            <LayoutDashboard size={16} /> Dashboard
                        </button>
                        <button 
                            onClick={() => setActivePanel('leads')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'leads' ? 'bg-gold/10 text-gold' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                        >
                            <FolderKanban size={16} /> CRM Pipeline
                        </button>
                        <button 
                            onClick={() => setActivePanel('packages')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'packages' ? 'bg-gold/10 text-gold' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                        >
                            <ChefHat size={16} /> Paket & Menu
                        </button>
                        <button 
                            onClick={() => setActivePanel('pricing')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'pricing' ? 'bg-gold/10 text-gold' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                        >
                            <Percent size={16} /> Harga & Diskon
                        </button>
                        <button 
                            onClick={() => setActivePanel('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'settings' ? 'bg-gold/10 text-gold' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                        >
                            <SettingsIcon size={16} /> Pengaturan
                        </button>
                        <button 
                            onClick={() => setActivePanel('users')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'users' ? 'bg-gold/10 text-gold' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                        >
                            <Users size={16} /> Manajemen Staff
                        </button>
                        <button 
                            onClick={() => setActivePanel('logs')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-xl ${activePanel === 'logs' ? 'bg-gold/10 text-gold' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                        >
                            <ShieldAlert size={16} /> Audit Trail
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        <LogOut size={14} /> Keluar
                    </button>
                </div>
            </aside>

            {/* MAIN DATA PANELS (Content Area) */}
            <main className="flex-grow overflow-y-auto max-w-[calc(100vw-256px)] relative bg-gray-50 text-gray-900">

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
