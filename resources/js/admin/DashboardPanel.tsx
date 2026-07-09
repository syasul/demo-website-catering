import React, { useState, useEffect } from 'react';
import type { User, Quotation as Lead } from '../types';
import { AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { GlassCard } from '../components/GlassCard';

export const DashboardPanel: React.FC<{ user: User }> = ({ user }) => {
    const [stats, setStats] = useState<any>(null);
    const [monthlyLeads, setMonthlyLeads] = useState<any[]>([]);
    const [popularPackages, setPopularPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isFinanceOrSuperAdmin = user.role === 'finance' || user.role === 'super_admin';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Stats & Distribution
            const statsRes = await fetch('/api/admin/reports/dashboard-stats');
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }

            // Charts data
            const monthsRes = await fetch('/api/admin/reports/leads-by-month');
            if (monthsRes.ok) {
                const data = await monthsRes.json();
                setMonthlyLeads(data);
            }

            const packagesRes = await fetch('/api/admin/reports/popular-packages');
            if (packagesRes.ok) {
                const data = await packagesRes.json();
                setPopularPackages(data);
            }
        } catch (e) {
            console.error("Error fetching reports", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="p-5" hover>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-utility block leading-none">Lead Baru (Minggu Ini)</span>
                    <span className="font-display text-3xl font-bold text-white block mt-3">{stats.stats.new_leads_this_week}</span>
                </GlassCard>
                <GlassCard className="p-5" hover>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-utility block leading-none">Nilai Pipeline Aktif</span>
                    <span className="font-utility text-xl font-bold text-gold block mt-3 text-glow-gold">
                        Rp {isFinanceOrSuperAdmin ? stats.stats.pipeline_value.toLocaleString('id-ID') : 'Rp ***'}
                    </span>
                </GlassCard>
                <GlassCard className="p-5" hover>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-utility block leading-none">Deal Bulan Ini</span>
                    <span className="font-display text-3xl font-bold text-emerald-400 block mt-3">{stats.stats.deals_this_month}</span>
                </GlassCard>
                <GlassCard className="p-5" hover>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-utility block leading-none">Omset Deal (Bulan Ini)</span>
                    <span className="font-utility text-xl font-bold text-white block mt-3">
                        Rp {isFinanceOrSuperAdmin ? stats.stats.deals_value_this_month.toLocaleString('id-ID') : 'Rp ***'}
                    </span>
                </GlassCard>
            </div>

            {/* URGENT ALERTS WIDGET */}
            {stats.urgent_leads.length > 0 && (
                <div className="glass-card border-red-500/30 bg-red-500/10 p-5 shadow-sm space-y-3 rounded-2xl">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                        <AlertCircle size={18} />
                        <h4>Perlu Tindak Lanjut Segera (Tanpa Aktivitas &gt; 2 Hari)</h4>
                    </div>
                    <div className="divide-y divide-red-500/20">
                        {stats.urgent_leads.slice(0, 3).map((lead: Lead) => (
                            <div key={lead.id} className="py-2.5 flex justify-between items-center text-xs">
                                <div>
                                    <span className="font-bold text-red-300">{lead.customer_name}</span>
                                    <span className="text-red-300/70 ml-2">({lead.package_name_snapshot} — {lead.pax} pax)</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-utility bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md uppercase border border-red-500/30">
                                        Status: {lead.status}
                                    </span>
                                    <span className="text-red-400 font-medium font-utility">
                                        Assigned: {lead.assigned_user?.name || 'Unassigned'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* GRAPHS AND CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Line Chart: Leads Trend */}
                <GlassCard className="p-6">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-gold mb-6 flex items-center gap-2 text-glow-gold">
                        <TrendingUp size={16} />
                        Tren Pertumbuhan Lead per Bulan
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyLeads}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Poppins' }} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
                                <Tooltip wrapperStyle={{ fontFamily: 'Poppins', fontSize: 12 }} contentStyle={{ backgroundColor: 'rgba(13,27,16,0.9)', borderColor: 'rgba(173,138,78,0.3)', color: '#fff' }} />
                                <Legend wrapperStyle={{ fontSize: 11, color: '#fff' }} />
                                <Line type="monotone" dataKey="web" stroke="#ff7e67" strokeWidth={2} name="Web Calculator" />
                                <Line type="monotone" dataKey="whatsapp" stroke="#25D366" strokeWidth={2} name="WhatsApp CS" />
                                <Line type="monotone" dataKey="manual" stroke="#AD8A4E" strokeWidth={2} name="Manual Admin" />
                                <Line type="monotone" dataKey="total" stroke="#fff" strokeWidth={3} name="Total Leads" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Bar Chart: Simulations vs Closed Deals */}
                <GlassCard className="p-6">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-gold mb-6 flex items-center gap-2 text-glow-gold">
                        <BarChart3 size={16} />
                        Paket Terpopuler (Simulasi vs Closing)
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={popularPackages}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Poppins' }} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
                                <Tooltip wrapperStyle={{ fontFamily: 'Poppins', fontSize: 12 }} contentStyle={{ backgroundColor: 'rgba(13,27,16,0.9)', borderColor: 'rgba(173,138,78,0.3)', color: '#fff' }} />
                                <Legend wrapperStyle={{ fontSize: 11, color: '#fff' }} />
                                <Bar dataKey="simulations" fill="#AD8A4E" name="Simulasi" />
                                <Bar dataKey="deals" fill="#4ade80" name="Deal Closing" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
