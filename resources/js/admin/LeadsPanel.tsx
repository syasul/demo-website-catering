import React, { useState, useEffect } from 'react';
import type { User, Quotation as Lead, Activity } from '../types';
import { ListFilter, Calendar, PhoneCall, Mail, MapPin, X, MessageSquare, Phone } from 'lucide-react';

export const LeadsPanel: React.FC<{ user: User }> = ({ user }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

    // Filter states
    const [statusFilter, setStatusFilter] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Lead drawer details
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [timeline, setTimeline] = useState<Activity[]>([]);
    const [noteContent, setNoteContent] = useState('');
    const [noteType, setNoteType] = useState<'call' | 'wa' | 'email' | 'meeting'>('wa');

    // Team users (for assignment dropdown)
    const [users, setUsers] = useState<User[]>([]);
    const [lostReason, setLostReason] = useState('');
    const [showLostInput, setShowLostInput] = useState(false);

    useEffect(() => {
        fetchLeads();
        fetchTeamUsers();
    }, [statusFilter, assigneeFilter]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/leads?status=${statusFilter}&assigned_to=${assigneeFilter}`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setLeads(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLeads();
    };

    const openLeadDrawer = async (lead: Lead) => {
        try {
            const res = await fetch(`/api/admin/leads/${lead.id}`);
            if (res.ok) {
                const data = await res.json();
                setActiveLead(data);
                setTimeline(data.activities || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!activeLead) return;

        if (newStatus === 'lost' && !lostReason) {
            setShowLostInput(true);
            return;
        }

        try {
            const res = await fetch(`/api/admin/leads/${activeLead.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    status: newStatus,
                    lost_reason: newStatus === 'lost' ? lostReason : null
                })
            });

            if (res.ok) {
                const data = await res.json();
                setActiveLead(data.lead);
                setTimeline(data.lead.activities || []);
                setLostReason('');
                setShowLostInput(false);
                fetchLeads(); // refresh lists
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAssignChange = async (userId: string) => {
        if (!activeLead) return;

        try {
            const res = await fetch(`/api/admin/leads/${activeLead.id}/assign`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ user_id: userId ? Number(userId) : null })
            });

            if (res.ok) {
                const data = await res.json();
                setActiveLead(data.lead);
                setTimeline(data.lead.activities || []);
                fetchLeads();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const submitActivityLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLead || !noteContent.trim()) return;

        try {
            const res = await fetch(`/api/admin/leads/${activeLead.id}/activities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    note: noteContent,
                    activity_type: noteType
                })
            });

            if (res.ok) {
                const data = await res.json();
                setTimeline(data.lead.activities || []);
                setActiveLead(data.lead);
                setNoteContent('');
                fetchLeads();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Kanban columns mapping
    const columns = [
        { key: 'new', title: 'Baru (New)', bg: 'bg-stempel/10 border-stempel/35 text-stempel' },
        { key: 'contacted', title: 'Dihubungi (Contacted)', bg: 'bg-gold/10 border-gold/35 text-gold' },
        { key: 'negotiation', title: 'Negosiasi (Negotiation)', bg: 'bg-maroon/10 border-maroon/35 text-maroon' },
        { key: 'deal', title: 'Deal (Closing)', bg: 'bg-sage/10 border-sage/35 text-sage' },
        { key: 'lost', title: 'Gagal (Lost)', bg: 'bg-gray-100 border-gray-300 text-gray-500' }
    ];

    return (
        <div className="space-y-6 animate-fade-in relative">
            
            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-paper border border-forest/10 p-4 shadow-sm">
                <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Cari nama / no HP lead..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-2 border border-forest/10 bg-forest/5 text-xs focus:outline-none focus:border-gold w-full md:w-60"
                    />
                    <button type="submit" className="bg-forest text-paper hover:bg-gold hover:text-forest px-4 py-2 text-xs font-bold uppercase tracking-wider">
                        Cari
                    </button>
                </form>

                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                    <div className="flex items-center gap-2 text-xs">
                        <ListFilter size={14} className="text-gold" />
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-2 border border-forest/10 bg-forest/5 focus:outline-none focus:border-gold font-medium"
                        >
                            <option value="">Semua Status</option>
                            <option value="new">Baru</option>
                            <option value="contacted">Dihubungi</option>
                            <option value="negotiation">Negosiasi</option>
                            <option value="deal">Deal</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <User size={14} className="text-gold" />
                        <select 
                            value={assigneeFilter} 
                            onChange={(e) => setAssigneeFilter(e.target.value)}
                            className="p-2 border border-forest/10 bg-forest/5 focus:outline-none focus:border-gold font-medium"
                        >
                            <option value="">Semua PIC Staff</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex bg-forest/5 border border-forest/10 p-0.5">
                        <button 
                            onClick={() => setViewMode('kanban')} 
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${viewMode === 'kanban' ? 'bg-forest text-paper' : 'text-forest/60'}`}
                        >
                            Kanban
                        </button>
                        <button 
                            onClick={() => setViewMode('table')} 
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${viewMode === 'table' ? 'bg-forest text-paper' : 'text-forest/60'}`}
                        >
                            Tabel
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-80">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                </div>
            ) : (
                <>
                    {/* KANBAN BOARD VIEW */}
                    {viewMode === 'kanban' && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start h-[calc(100vh-230px)] overflow-x-auto">
                            {columns.map(col => {
                                const colLeads = leads.filter(l => l.status === col.key);
                                return (
                                    <div key={col.key} className="bg-forest/5 border border-forest/10 flex flex-col max-h-full">
                                        <div className={`p-3 border-b text-xs font-bold uppercase tracking-wider text-center flex justify-between items-center ${col.bg}`}>
                                            <span>{col.title}</span>
                                            <span className="font-utility rounded-full bg-paper px-2 py-0.5 border border-forest/10 text-[10px]">
                                                {colLeads.length}
                                            </span>
                                        </div>
                                        
                                        <div className="p-3 space-y-3 overflow-y-auto flex-grow max-h-[calc(100vh-290px)] min-h-[150px]">
                                            {colLeads.map(lead => (
                                                <div 
                                                    key={lead.id}
                                                    onClick={() => openLeadDrawer(lead)}
                                                    className="bg-paper border border-forest/10 hover:border-gold/50 hover:shadow-md p-4 cursor-pointer transition-all space-y-3"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <h5 className="font-bold text-xs leading-none text-forest">{lead.customer_name}</h5>
                                                        <span className="font-utility text-[9px] text-forest/40">#{lead.id}</span>
                                                    </div>
                                                    
                                                    <div className="text-[10px] text-forest/70 space-y-1">
                                                        <div>{lead.package_name_snapshot} ({lead.pax} pax)</div>
                                                        <div className="flex items-center gap-1 font-utility text-[9px] text-forest/40">
                                                            <Calendar size={10} />
                                                            {lead.event_date}
                                                        </div>
                                                    </div>

                                                    <div className="border-t border-forest/5 pt-2 flex justify-between items-center text-[10px]">
                                                        <span className="font-utility font-bold text-maroon">
                                                            Rp {Number(lead.total_estimate).toLocaleString('id-ID')}
                                                        </span>
                                                        <span className="text-[9px] bg-forest/5 px-2 py-0.5 border border-forest/10 text-forest/60">
                                                            PIC: {lead.assigned_user?.name.split(' ')[0] || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {colLeads.length === 0 && (
                                                <div className="text-center py-8 text-[10px] text-forest/40 italic">
                                                    Tidak ada lead
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* LIST TABLE VIEW */}
                    {viewMode === 'table' && (
                        <div className="bg-paper border border-forest/10 shadow-sm overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-forest/5 border-b border-forest/10 text-xs font-utility uppercase tracking-wider text-forest/70">
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Nama Pelanggan</th>
                                        <th className="p-4">Paket & Pax</th>
                                        <th className="p-4">Tanggal Acara</th>
                                        <th className="p-4">Total Biaya</th>
                                        <th className="p-4">PIC</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-forest/10 text-xs">
                                    {leads.map(lead => (
                                        <tr key={lead.id} className="hover:bg-forest/5">
                                            <td className="p-4 font-utility">#{lead.id}</td>
                                            <td className="p-4 font-bold">{lead.customer_name}</td>
                                            <td className="p-4">{lead.package_name_snapshot} ({lead.pax} pax)</td>
                                            <td className="p-4 font-utility">{lead.event_date}</td>
                                            <td className="p-4 font-utility font-bold text-maroon">Rp {Number(lead.total_estimate).toLocaleString('id-ID')}</td>
                                            <td className="p-4">{lead.assigned_user?.name || '-'}</td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-paper shadow-sm">
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => openLeadDrawer(lead)}
                                                    className="bg-forest text-paper hover:bg-gold hover:text-forest px-3 py-1 font-bold uppercase tracking-wider text-[9px]"
                                                >
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {leads.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12 text-forest/50 italic">
                                                Tidak ada data lead ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* DETAIL CRM DRAWERS / DRAWER MODAL */}
            {activeLead && (
                <div className="fixed inset-0 z-40 bg-forest/40 backdrop-blur-sm flex justify-end animate-fade-in">
                    <div className="w-full max-w-xl bg-paper border-l border-gold h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in relative">
                        <div className="absolute top-2 left-2 right-2 bottom-2 border border-gold/15 pointer-events-none"></div>
                        
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-forest/10 flex justify-between items-start z-10">
                            <div>
                                <span className="font-utility text-[9px] uppercase tracking-widest text-gold font-bold">Detail Lead CRM</span>
                                <h3 className="font-display text-xl font-bold text-forest mt-0.5">{activeLead.customer_name}</h3>
                                <div className="flex gap-2 items-center mt-2 text-xs">
                                    <span className="font-utility text-[10px] font-bold uppercase tracking-wider text-forest/50">Lead #{activeLead.id}</span>
                                    <span className="text-forest/30">|</span>
                                    <span className="font-semibold text-gold">Source: {activeLead.source.toUpperCase()}</span>
                                </div>
                            </div>
                            <button onClick={() => setActiveLead(null)} className="p-2 border border-forest/10 hover:border-red-500 hover:text-red-500">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="p-6 overflow-y-auto flex-grow space-y-6 z-10">
                            
                            {/* Summary Card */}
                            <div className="bg-forest/5 border border-forest/10 p-4 space-y-4">
                                <h4 className="text-[10px] uppercase font-bold text-gold tracking-widest leading-none border-b border-forest/10 pb-2">Kalkulasi Awal & Snapshot</h4>
                                <div className="grid grid-cols-2 gap-4 text-xs font-utility">
                                    <div>
                                        <span className="text-[9px] text-forest/40 block">PAKET CATERING</span>
                                        <span className="font-bold text-forest">{activeLead.package_name_snapshot}</span>
                                        <span className="text-[10px] text-forest/50 block mt-0.5">{activeLead.pax} pax &times; Rp {Number(activeLead.price_per_pax_snapshot).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-forest/40 block">TOTAL ESTIMASI</span>
                                        <span className="font-bold text-maroon text-sm block mt-0.5">Rp {Number(activeLead.total_estimate).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                {activeLead.addon_snapshot && activeLead.addon_snapshot.length > 0 && (
                                    <div className="border-t border-forest/10 pt-3">
                                        <span className="text-[9px] font-bold text-forest/40 block mb-1">ADD-ONS SNAPSHOT:</span>
                                        <div className="space-y-1 text-xs">
                                            {activeLead.addon_snapshot.map((a: any, i: number) => (
                                                <div key={i} className="flex justify-between">
                                                    <span>- {a.name} ({a.pricing_type === 'per_pax' ? 'Per Pax' : 'Flat'})</span>
                                                    <span className="font-utility">Rp {Number(a.price).toLocaleString('id-ID')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Event Details */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-forest/40 block uppercase">Tanggal Acara</span>
                                    <div className="flex items-center gap-1.5 font-medium text-forest">
                                        <Calendar size={14} className="text-gold" />
                                        <span>{activeLead.event_date}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-forest/40 block uppercase">Nomor WhatsApp</span>
                                    <div className="flex items-center gap-1.5 font-medium text-forest">
                                        <Phone size={14} className="text-gold" />
                                        <span>{activeLead.customer_phone}</span>
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <span className="text-[9px] font-bold text-forest/40 block uppercase">Lokasi Acara</span>
                                    <div className="flex items-center gap-1.5 font-medium text-forest">
                                        <MapPin size={14} className="text-gold" />
                                        <span>{activeLead.event_location || '-'}</span>
                                    </div>
                                </div>
                                {activeLead.notes && (
                                    <div className="col-span-2 space-y-1">
                                        <span className="text-[9px] font-bold text-forest/40 block uppercase">Catatan Client</span>
                                        <p className="p-3 bg-paper border border-forest/10 leading-relaxed text-forest/80 rounded-none italic text-xs">
                                            "{activeLead.notes}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* PIPELINE & ACTION PANEL */}
                            <div className="border-t border-forest/10 pt-5 space-y-4">
                                <h4 className="text-[10px] uppercase font-bold text-gold tracking-widest leading-none">Aksi Tindak Lanjut</h4>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Status Stage */}
                                    <div className="space-y-1 text-xs">
                                        <label className="text-[10px] uppercase font-bold text-forest/50 block">Tahap Status</label>
                                        <select 
                                            value={activeLead.status}
                                            onChange={(e) => handleStatusUpdate(e.target.value)}
                                            className="w-full p-2 border border-forest/10 bg-forest/5 focus:outline-none focus:border-gold font-medium"
                                        >
                                            <option value="new">Baru (New)</option>
                                            <option value="contacted">Dihubungi (Contacted)</option>
                                            <option value="negotiation">Negosiasi (Negotiation)</option>
                                            <option value="deal">Deal (Closing)</option>
                                            <option value="lost">Gagal (Lost)</option>
                                        </select>
                                    </div>

                                    {/* Staff assignment */}
                                    <div className="space-y-1 text-xs">
                                        <label className="text-[10px] uppercase font-bold text-forest/50 block">PIC Ditugaskan Ke</label>
                                        <select 
                                            value={activeLead.assigned_to || ''}
                                            onChange={(e) => handleAssignChange(e.target.value)}
                                            className="w-full p-2 border border-forest/10 bg-forest/5 focus:outline-none focus:border-gold font-medium"
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Lost Reason popup input */}
                                {showLostInput && (
                                    <div className="bg-red-50 p-4 border border-red-200 space-y-2 text-xs">
                                        <label className="font-bold text-red-950 block">Sebutkan alasan gagal closing:</label>
                                        <div className="flex gap-2">
                                            <select 
                                                value={lostReason} 
                                                onChange={(e) => setLostReason(e.target.value)}
                                                className="flex-grow p-2 border border-red-200 bg-white focus:outline-none"
                                            >
                                                <option value="">Pilih Alasan...</option>
                                                <option value="Harga terlalu tinggi">Harga terlalu tinggi</option>
                                                <option value="Sudah pakai vendor lain">Sudah pakai vendor lain</option>
                                                <option value="Batal acara">Batal acara</option>
                                                <option value="Kurang cocok menu">Kurang cocok menu</option>
                                                <option value="Lainnya">Lainnya</option>
                                            </select>
                                            <button 
                                                onClick={() => handleStatusUpdate('lost')}
                                                className="bg-red-900 text-white px-4 py-2 font-bold uppercase tracking-wider text-[10px]"
                                            >
                                                Simpan
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* WhatsApp CS Deep link button generator */}
                                <div className="flex gap-2">
                                    <a 
                                        href={`https://wa.me/${activeLead.customer_phone.replace(/\D/g, '')}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex-1 bg-forest hover:bg-gold hover:text-forest text-paper py-3 font-bold uppercase tracking-widest text-[10px] text-center border border-gold flex justify-center items-center gap-2 shadow-sm transition-colors"
                                    >
                                        <PhoneCall size={14} />
                                        WhatsApp Chat
                                    </a>
                                </div>
                            </div>

                            {/* TIMELINE ACTIVITIES */}
                            <div className="border-t border-forest/10 pt-5 space-y-4">
                                <h4 className="text-[10px] uppercase font-bold text-gold tracking-widest leading-none">Histori Aktivitas / Follow-Up</h4>
                                
                                {/* Form activity log */}
                                <form onSubmit={submitActivityLog} className="space-y-3">
                                    <div className="flex gap-2 text-xs">
                                        <select 
                                            value={noteType} 
                                            onChange={(e) => setNoteType(e.target.value as any)}
                                            className="p-2 border border-forest/10 bg-forest/5 focus:outline-none focus:border-gold font-medium w-40"
                                        >
                                            <option value="wa">WhatsApp</option>
                                            <option value="call">Telepon</option>
                                            <option value="email">Email</option>
                                            <option value="meeting">Pertemuan</option>
                                        </select>
                                        
                                        <input 
                                            type="text" 
                                            placeholder="Tulis catatan aktivitas follow-up..."
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            className="flex-grow p-2 border border-forest/10 bg-forest/5 focus:outline-none focus:border-gold text-xs"
                                        />

                                        <button type="submit" className="bg-maroon text-paper border border-gold px-4 py-2 font-bold uppercase tracking-wider text-[10px]">
                                            Simpan
                                        </button>
                                    </div>
                                </form>

                                {/* Activity timeline log list */}
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {timeline.map((act) => (
                                        <div key={act.id} className="p-3 border border-forest/5 bg-forest/5 flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0"></div>
                                            <div className="text-xs space-y-1">
                                                <p className="text-forest/80 leading-relaxed font-medium">{act.note}</p>
                                                <div className="flex gap-2 items-center text-[9px] text-forest/40 font-utility">
                                                    <span>Oleh: {act.user?.name || 'System'}</span>
                                                    <span>&bull;</span>
                                                    <span>{new Date(act.created_at).toLocaleString('id-ID')}</span>
                                                    <span>&bull;</span>
                                                    <span className="font-bold uppercase text-[8px] text-gold border border-gold/25 px-1 py-0.2">{act.activity_type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {timeline.length === 0 && (
                                        <div className="text-center py-6 text-xs text-forest/40 italic">
                                            Belum ada catatan aktivitas.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
