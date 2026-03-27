import React, { useState, useEffect } from 'react';
import { Bell, LogOut, User, Search, Settings, Command } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './UI';
import { AnimatePresence, motion } from 'framer-motion';
import { NotificationPanel } from './NotificationPanel';
import { supabase } from '../lib/supabase';

export const Header = () => {
    const { signOut, session, userRole: role } = useAuth();
    const { addToast } = useToast();
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!session?.user?.id) return;

        const fetchUnread = async () => {
            try {
                const { count } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', session.user.id)
                    .eq('is_read', false);
                setUnreadCount(count || 0);
            } catch (err) {
                console.warn('[Header] Failed to fetch notifications');
            }
        };

        fetchUnread();
    }, [session?.user?.id]);

    const handleLogout = async () => {
        await signOut();
        addToast('Logged out successfully.', 'success');
    };

    const isAdmin = role === 'admin' || role === 'super_admin';

    return (
        <header className="h-20 fixed top-0 left-[280px] right-0 bg-[#151a1f]/40 backdrop-blur-4xl border-b border-white/5 flex items-center px-10 z-40 justify-between">
            <div className="flex items-center gap-5 flex-1">
                <div className="relative w-[380px] group">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-cyan transition-colors"
                    />
                    <input
                        type="text"
                        placeholder="Quick search issues..."
                        className="w-full pl-12 pr-16 py-3 bg-white/[0.02] border border-white/5 rounded-2xl text-white text-[13px] font-medium outline-none transition-all duration-300 focus:border-primary-cyan/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(91,238,252,0.05)] placeholder:text-white/20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-1 bg-white/[0.05] rounded-md border border-white/5 text-white/20 text-[9px] font-black uppercase tracking-widest">
                        ⌘ K
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Notifications */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="w-11 h-11 bg-white/[0.02] border border-white/5 rounded-2xl text-white/50 cursor-pointer relative grid place-items-center hover:bg-white/[0.05] hover:text-white transition-all group"
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-cyan rounded-full border-2 border-[#151a1f] shadow-[0_0_8px_rgba(91,238,252,0.5)]" />
                        )}
                    </motion.button>
                    <AnimatePresence>
                        {showNotifications && (
                            <div className="absolute top-14 right-0 z-[1100]">
                                <NotificationPanel onClose={() => setShowNotifications(false)} />
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile Card */}
                <div className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="text-right">
                        <p className="text-[11px] font-black text-white leading-none capitalize">
                            {role?.replace('_', ' ') || 'User'}
                        </p>
                        <p className="text-[9px] text-accent-green mt-1.5 font-bold uppercase tracking-widest">Online</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl grid place-items-center bg-primary-cyan/10 border border-primary-cyan/20 text-primary-cyan shadow-[0_0_15px_rgba(91,238,252,0.1)]">
                        <User size={16} strokeWidth={2.5} />
                    </div>
                </div>

                <div className="w-px h-6 bg-white/5" />

                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-3 rounded-2xl bg-transparent text-white/20 cursor-pointer flex items-center justify-center transition-all hover:text-red-500"
                >
                    <LogOut size={18} />
                </motion.button>
            </div>
        </header>
    );
};
