import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, Info } from 'lucide-react';
import { GlassyCard } from './UI';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const NotificationPanel = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
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
                .limit(20)
                .abortSignal(abortSignal);

            if (error) {
                if (error.name === 'AbortError') return;
                console.error('Error fetching notifications:', error);
                return;
            }

            if (mounted) {
                setNotifications(data || []);
                setUnreadCount((data || []).filter((n) => !n.is_read).length);
            }
        } catch (err) {
            if (mounted && err.name !== 'AbortError') {
                console.error('Unexpected error in fetchNotifications:', err);
            }
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

            if (error) {
                console.error('Error marking notification as read:', error);
                return;
            }

            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            if (link) {
                navigate(link);
            }
            if (onClose) onClose();
        } catch (err) {
            console.error('Unexpected error in markAsRead:', err);
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

            if (error) {
                console.error('Error marking all as read:', error);
                return;
            }

            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Unexpected error in markAllRead:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{
                width: '380px',
                zIndex: 1000
            }}
        >
            <GlassyCard style={{
                padding: '0',
                overflow: 'hidden',
                border: '1px solid rgba(253, 161, 54, 0.2)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Communications Center
                    </h3>
                    <button onClick={markAllRead} style={{ color: '#FDA136', background: 'none', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        Clear All
                    </button>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                            No active transmissions found.
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => markAsRead(n.id, n.link)}
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    cursor: 'pointer',
                                    backgroundColor: n.is_read ? 'transparent' : 'rgba(253, 161, 54, 0.05)',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    gap: '16px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.is_read ? 'transparent' : 'rgba(253, 161, 54, 0.05)'}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: n.type === 'status_change' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(253, 161, 54, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {n.type === 'status_change' ? <Info size={18} color="#60a5fa" /> : <AlertCircle size={18} color="#FDA136" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{n.title}</div>
                                    <div style={{ fontSize: '13px', color: 'rgba(237, 237, 243, 0.4)', lineHeight: 1.4 }}>{n.message}</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>
                                        {n.created_at ? new Date(n.created_at).toLocaleString() : 'Just now'}
                                    </div>
                                </div>
                                {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FDA136', alignSelf: 'center' }} />}
                            </div>
                        ))
                    )}
                </div>

                <button
                    onClick={() => onClose && onClose()}
                    style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 600, borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                >
                    Close Panel
                </button>
            </GlassyCard>
        </motion.div>
    );
};
