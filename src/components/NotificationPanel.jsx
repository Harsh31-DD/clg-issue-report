import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Info, CheckCheck, BellOff } from 'lucide-react';
import { GlassyCard, Button } from './UI';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const NotificationPanel = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    const fetchNotifications = async (mounted, abortSignal) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !mounted) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)
                .abortSignal(abortSignal);

            if (error) return;

            if (mounted) {
                setNotifications(data || []);
            }
        } catch {
            // Silently handle fetch errors
        }
    };

    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();
        let channel = null;

        fetchNotifications(mounted, controller.signal);

        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !mounted) return;

            channel = supabase.channel(`notifications-${user.id}`)
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                    () => {
                        if (mounted) fetchNotifications(mounted, controller.signal);
                    }
                ).subscribe();
        };

        setupSubscription();

        return () => {
            mounted = false;
            controller.abort();
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, []);

    const markAsRead = async (id, link) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) return;

            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));

            if (link) {
                navigate(link);
                if (onClose) onClose();
            }
        } catch {
            // Silently handle mark as read errors
        }
    };

    const markAllRead = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) return;

            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch {
            // mass update error
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-[360px] z-[1000]"
        >
            <GlassyCard hoverable={false} className="p-0 overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.8)] border-white/5">
                <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="m-0 text-[15px] font-black text-white uppercase tracking-tight">
                        Alert Communications
                    </h3>
                    {notifications.some(n => !n.is_read) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllRead}
                            className="text-burnt-orange text-[11px] px-2 py-1 font-black"
                        >
                            <CheckCheck size={14} className="mr-1" /> Clear
                        </Button>
                    )}
                </div>

                <div className="max-h-[420px] overflow-y-auto py-2">
                    {notifications.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <div className="w-12 h-12 rounded-full bg-white/[0.03] grid place-items-center mx-auto mb-4 border border-white/5">
                                <BellOff size={20} className="text-white/20" />
                            </div>
                            <p className="text-[13px] text-white/30 font-bold uppercase tracking-wider">
                                No active transmissions detected.
                            </p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => markAsRead(n.id, n.link)}
                                className="px-6 py-4 cursor-pointer bg-transparent transition-all duration-200 flex gap-4 relative group hover:bg-white/[0.03]"
                            >
                                {!n.is_read && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-burnt-orange rounded-full shadow-[0_0_8px_rgba(230,90,31,0.5)]" />
                                )}
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                    n.type === 'status_change' 
                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' 
                                        : 'bg-burnt-orange/10 border-burnt-orange/20 text-burnt-orange'
                                }`}>
                                    {n.type === 'status_change' ? <Info size={16} /> : <AlertCircle size={16} />}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[14px] font-black text-white mb-0.5 tracking-tight group-hover:text-burnt-orange transition-colors uppercase">{n.title}</div>
                                    <div className="text-[13px] text-white/40 font-medium leading-relaxed">{n.message}</div>
                                    <div className="text-[10px] text-white/20 mt-2 font-black uppercase tracking-[0.1em]">
                                        {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                    <Button
                        variant="secondary"
                        onClick={() => onClose && onClose()}
                        className="w-full text-[11px] font-black uppercase tracking-widest"
                    >
                        Dismiss Panel
                    </Button>
                </div>
            </GlassyCard>
        </motion.div>
    );
};
