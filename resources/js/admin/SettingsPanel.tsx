import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                setSettings(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (key: string, value: string) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveLoading(true);
        setSuccessMessage('');

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setSuccessMessage('Pengaturan bisnis berhasil diperbarui.');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading || !settings) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="bg-paper border border-forest/10 p-8 shadow-lg max-w-3xl animate-fade-in relative text-xs">
            <div className="absolute top-2 left-2 right-2 bottom-2 border border-gold/15 pointer-events-none"></div>
            
            <div className="mb-6">
                <span className="font-utility text-[9px] uppercase tracking-widest text-gold font-bold">Admin Config</span>
                <h3 className="font-display text-xl font-bold text-forest mt-0.5">Pengaturan Informasi Bisnis</h3>
                <div className="h-0.5 w-16 bg-gold mt-2"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-forest/60">WhatsApp CS Number (format 62...) *</label>
                        <input 
                            type="text" 
                            value={settings.contact_whatsapp || ''}
                            onChange={(e) => handleSettingChange('contact_whatsapp', e.target.value)}
                            required
                            className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold font-utility"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-forest/60">Email Kantor Utama *</label>
                        <input 
                            type="email" 
                            value={settings.contact_email || ''}
                            onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                            required
                            className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold font-utility"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-forest/60">Alamat Kantor Bisnis *</label>
                    <input 
                        type="text" 
                        value={settings.contact_address || ''}
                        onChange={(e) => handleSettingChange('contact_address', e.target.value)}
                        required
                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-forest/60 block">Template WhatsApp Otomatis (Lead Calculator) *</label>
                    <textarea 
                        value={settings.whatsapp_template || ''}
                        onChange={(e) => handleSettingChange('whatsapp_template', e.target.value)}
                        required
                        rows={8}
                        className="w-full p-3 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold font-utility text-xs leading-relaxed"
                    />
                    <span className="text-[9px] text-forest/40 block mt-1">
                        Placeholder tersedia: <code className="bg-forest/5 px-1 py-0.2 rounded font-bold font-utility">{`{name}`}</code>, <code className="bg-forest/5 px-1 py-0.2 rounded font-bold font-utility">{`{phone}`}</code>, <code className="bg-forest/5 px-1 py-0.2 rounded font-bold font-utility">{`{package}`}</code>, <code className="bg-forest/5 px-1 py-0.2 rounded font-bold font-utility">{`{pax}`}</code>, <code className="bg-forest/5 px-1 py-0.2 rounded font-bold font-utility">{`{event_date}`}</code>, <code className="bg-forest/5 px-1 py-0.2 rounded font-bold font-utility">{`{location}`}</code>, <code className="bg-forest/5 px-1 py-0.2 rounded font-bold font-utility">{`{addons}`}</code>, <code className="bg-forest/5 px-1 py-0.2 rounded font-bold font-utility">{`{total_estimate}`}</code>
                    </span>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-forest/60">Daftar Email Notifikasi Lead Baru (pisahkan dengan koma)</label>
                    <input 
                        type="text" 
                        value={settings.notification_emails || ''}
                        onChange={(e) => handleSettingChange('notification_emails', e.target.value)}
                        className="w-full p-2.5 bg-forest/5 border border-forest/10 focus:outline-none focus:border-gold font-utility"
                        placeholder="contoh: hrd@catering.com, operasional@catering.com"
                    />
                </div>

                {successMessage && (
                    <div className="bg-sage/10 text-sage text-xs p-3 border border-sage/30 flex items-center gap-2">
                        <CheckCircle size={14} />
                        <span>{successMessage}</span>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-forest/10">
                    <button 
                        type="submit" 
                        disabled={saveLoading}
                        className="bg-maroon text-paper border border-gold shadow-md hover:bg-maroon/90 px-8 py-3 font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                        {saveLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                </div>
            </form>
        </div>
    );
};
