import React, { useState, useEffect } from 'react';
import { Bell, LogOut, User, Search, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './UI';
import { AnimatePresence, motion } from 'framer-motion';
import { NotificationPanel } from './NotificationPanel';
import { supabase } from '../lib/supabase';

export const Header = ({ onMenuClick }) => {
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

    return (
        <header className="h-16 lg:h-20 fixed top-0 left-0 right-0 lg:left-[280px] bg-[#151a1f]/80 backdrop-blur-xl border-b border-white/5 flex items-center px-4 sm:px-6 lg:px-10 z-40 justify-between gap-4">
            {/* Left: Hamburger (mobile) + Search (desktop) */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Hamburger — mobile only */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden w-10 h-10 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all shrink-0"
                >
                    <Menu size={20} />
                </button>

                {/* Search — hidden on small mobile, visible sm+ */}
                <div className="hidden sm:flex relative flex-1 max-w-[380px] group">
                    <Search
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-cyan transition-colors"
                    />
                    <input
                        type="text"
                        placeholder="Quick search issues..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-2xl text-white text-[13px] font-medium outline-none transition-all duration-300 focus:border-primary-cyan/50 focus:bg-white/[0.05] placeholder:text-white/20"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Notifications */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="w-10 h-10 bg-white/[0.02] border border-white/5 rounded-xl text-white/50 cursor-pointer relative grid place-items-center hover:bg-white/[0.05] hover:text-white transition-all"
                    >
                        <Bell size={17} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary-cyan rounded-full border-2 border-[#151a1f] shadow-[0_0_8px_rgba(91,238,252,0.5)]" />
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

                {/* Profile — label hidden on mobile */}
                <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="text-right hidden sm:block">
                        <p className="text-[11px] font-black text-white leading-none capitalize">
                            {role?.replace('_', ' ') || 'User'}
                        </p>
                        <p className="text-[9px] text-accent-green mt-1 font-bold uppercase tracking-widest">Online</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl grid place-items-center bg-primary-cyan/10 border border-primary-cyan/20 text-primary-cyan">
                        <User size={15} strokeWidth={2.5} />
                    </div>
                </div>

                <div className="w-px h-5 bg-white/5 hidden sm:block" />

                {/* Logout */}
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-transparent text-white/20 cursor-pointer flex items-center justify-center transition-all hover:text-red-500"
                >
                    <LogOut size={17} />
                </motion.button>
            </div>
        </header>
    );
};
