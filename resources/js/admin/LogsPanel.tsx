import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export const LogsPanel: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/activity-logs');
            if (res.ok) {
                const data = await res.json();
                setLogs(data.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
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
                <h3 className="font-display text-xl font-bold text-forest">Audit Trail Logs (Aktivitas Sistem)</h3>
                <button onClick={fetchLogs} className="p-2 border border-forest/10 hover:border-gold flex items-center gap-1 text-xs">
                    <RefreshCw size={12} />
                    Refresh
                </button>
            </div>

            <div className="bg-paper border border-forest/10 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-forest/5 border-b border-forest/10 text-xs font-utility uppercase tracking-wider text-forest/70">
                            <th className="p-4">Waktu</th>
                            <th className="p-4">Pelaku (User)</th>
                            <th className="p-4">Tindakan</th>
                            <th className="p-4">Modul</th>
                            <th className="p-4">Detail Perubahan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-forest/10 text-[11px] font-utility">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-forest/5">
                                <td className="p-4 whitespace-nowrap">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                <td className="p-4 font-bold">{log.user?.name || 'Sistem / Seeder'}</td>
                                <td className="p-4 uppercase">
                                    <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                                        log.action === 'created' ? 'bg-sage/10 border-sage text-sage' : 
                                        log.action === 'updated' ? 'bg-gold/10 border-gold text-gold' : 
                                        'bg-red-50 border-red-200 text-red-500'
                                    }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-4 font-bold">{log.model} (#{log.model_id})</td>
                                <td className="p-4 text-xs font-sans max-w-sm">
                                    {log.details ? (
                                        <div className="space-y-1">
                                            {log.details.before && (
                                                <div className="text-red-700 font-utility text-[10px]">
                                                    - Sebelum: {JSON.stringify(log.details.before)}
                                                </div>
                                            )}
                                            {log.details.after && (
                                                <div className="text-sage font-utility text-[10px]">
                                                    + Sesudah: {JSON.stringify(log.details.after)}
                                                </div>
                                            )}
                                            {log.details.state && (
                                                <div className="text-forest/60 font-utility text-[10px] truncate">
                                                    State: {JSON.stringify(log.details.state)}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-forest/40 italic">Tidak ada rincian</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-forest/50 italic">
                                    Belum ada log audit trail tercatat.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
