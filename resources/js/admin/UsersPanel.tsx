import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { UserPlus, Edit3, Trash2, X } from 'lucide-react';

export const UsersPanel: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        is_active: true
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) setUsers(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = selectedUserId ? 'PUT' : 'POST';
            const url = selectedUserId ? `/api/admin/users/${selectedUserId}` : '/api/admin/users';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                setShowForm(false);
                setSelectedUserId(null);
                setForm({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    is_active: true
                });
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.message || 'Error occurred.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteUser = async (id: number) => {
        if (!confirm('Hapus staff ini?')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in text-xs">
            <div className="flex justify-between items-center">
                <h3 className="font-display text-xl font-bold text-forest">Manajemen Staff Akun</h3>
                
                <button 
                    onClick={() => {
                        setSelectedUserId(null);
                        setForm({ name: '', email: '', password: '', phone: '', is_active: true });
                        setShowForm(true);
                    }}
                    className="bg-forest text-paper hover:bg-gold hover:text-forest px-4 py-2.5 text-xs font-bold uppercase tracking-wider border border-gold flex items-center gap-2"
                >
                    <UserPlus size={14} />
                    Tambah Staff
                </button>
            </div>

            <div className="bg-paper border border-forest/10 shadow-sm max-w-4xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-forest/5 border-b border-forest/10 text-xs font-utility uppercase tracking-wider">
                            <th className="p-4">Nama</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">No. HP</th>

                            <th className="p-4">Status</th>
                            <th className="p-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-forest/10 text-xs">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="p-4 font-bold">{u.name}</td>
                                <td className="p-4 font-utility">{u.email}</td>
                                <td className="p-4 font-utility">{u.phone || '-'}</td>

                                <td className="p-4">
                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${u.is_active ? 'bg-sage/10 border-sage text-sage' : 'bg-red-50 border-red-200 text-red-500'}`}>
                                        {u.is_active ? 'Aktif' : 'Non-aktif'}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button 
                                        onClick={() => {
                                            setSelectedUserId(u.id);
                                            setForm({
                                                name: u.name,
                                                email: u.email,
                                                password: '',
                                                phone: u.phone || '',
                                                is_active: u.is_active
                                            });
                                            setShowForm(true);
                                        }}
                                        className="p-1 border border-forest/10 hover:border-gold hover:text-gold"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => deleteUser(u.id)}
                                        className="p-1 border border-forest/10 hover:border-red-500 hover:text-red-500"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* POPUP FORM */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-forest/80 flex justify-center items-center p-6 backdrop-blur-sm animate-fade-in">
                    <div className="max-w-md w-full bg-paper border border-gold p-8 shadow-2xl relative">
                        <div className="absolute top-2 left-2 right-2 bottom-2 border border-gold/15 pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-display text-xl font-bold">{selectedUserId ? 'Edit Akun Staff' : 'Tambah Staff Baru'}</h3>
                            <button onClick={() => setShowForm(false)} className="p-2 border border-forest/10 hover:border-red-500 hover:text-red-500">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-forest/60">Nama Staff *</label>
                                <input 
                                    type="text" 
                                    value={form.name} 
                                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-forest/60">Email *</label>
                                    <input 
                                        type="email" 
                                        value={form.email} 
                                        onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-forest/60">Nomor HP</label>
                                    <input 
                                        type="text" 
                                        value={form.phone} 
                                        onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold font-utility"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-forest/60">Password {selectedUserId && '(Kosongkan jika tetap)'} *</label>
                                    <input 
                                        type="password" 
                                        value={form.password} 
                                        onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                                        required={!selectedUserId}
                                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <label className="flex items-center gap-2 cursor-pointer font-bold text-[9px] uppercase text-forest/60">
                                    <input 
                                        type="checkbox" 
                                        checked={form.is_active} 
                                        onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                                        className="accent-gold"
                                    />
                                    Akun Aktif
                                </label>

                                <div className="flex gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowForm(false)}
                                        className="border border-forest text-forest hover:bg-forest/5 px-6 py-2 font-bold uppercase tracking-wider"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit"
                                        className="bg-maroon text-paper border border-gold shadow-md hover:bg-maroon/90 px-6 py-2 font-bold uppercase tracking-wider"
                                    >
                                        Simpan Akun
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
