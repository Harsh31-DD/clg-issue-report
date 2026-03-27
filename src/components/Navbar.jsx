import { useEffect, useState } from 'react';
import { LayoutDashboard, FileText, LogOut, Shield, User, Bell } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { NotificationPanel } from './NotificationPanel';
import { useAuth } from '../context/AuthContext';
import { useToast, Button } from './UI';

const NavLink = ({ to, icon, label, active, isAdmin }) => (
    <Link
        to={to}
        className={`flex items-center gap-2 no-underline px-4 py-2.5 rounded-lg transition-all duration-200 text-[14px] font-semibold border ${
            active 
                ? 'text-white bg-primary-cyan/15 border-primary-cyan/20 shadow-[0_0_15px_rgba(91,238,252,0.1)]'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5 border-transparent'
        }`}
    >
        {icon}
        <span>{label}</span>
    </Link>
);

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, session, userRole: role } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { addToast } = useToast();

    useEffect(() => {
        if (!session?.user?.id) return;

        const fetchUnread = async () => {
            try {
                const { count, error } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', session.user.id)
                    .eq('is_read', false);
                
                if (error) throw error;
                setUnreadCount(count || 0);
            } catch (err) {
                console.error("Notification fetch error:", err);
                setUnreadCount(0);
            }
        };

        fetchUnread();
        
        const channel = supabase
            .channel('navbar-notifications')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'notifications',
                filter: `user_id=eq.${session.user.id}`
            }, () => setUnreadCount(prev => prev + 1))
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [session?.user?.id]);

    const handleLogout = async () => {
        await signOut();
        addToast('Logged out successfully.', 'success');
        navigate('/home');
    };

    const isAdmin = role === 'admin' || role === 'super_admin';

    return (
        <nav className="fixed top-0 left-0 right-0 z-[1000] h-[72px] backdrop-blur-2xl px-6 transition-all duration-300 border-b bg-[#151a1f]/80 border-white/5">
            <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between">
                <Link to="/home" className="flex items-center gap-2.5 no-underline group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 bg-gradient-to-br from-primary-cyan to-accent-green shadow-[0_0_15px_rgba(91,238,252,0.2)]">
                        <Shield size={18} className="text-white" />
                    </div>
                    <span className="text-white font-black text-xl tracking-tighter font-display uppercase">
                        CIRTS {isAdmin && <span className="text-[10px] text-primary-cyan ml-1 font-bold tracking-widest opacity-60">ADMIN</span>}
                    </span>
                </Link>

                <div className="flex items-center gap-2">
                    {session ? (
                        <>
                            <div className="flex gap-1 mr-4">
                                {isAdmin ? (
                                    <NavLink to="/admin-dashboard" icon={<LayoutDashboard size={16} />} label="Console" active={location.pathname === '/admin-dashboard'} isAdmin />
                                ) : (
                                    <>
                                        <NavLink to="/home" icon={<Shield size={16} />} label="Start" active={location.pathname === '/home'} />
                                        <NavLink to="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" active={location.pathname === '/dashboard'} />
                                        <NavLink to="/report" icon={<FileText size={16} />} label="File Report" active={location.pathname === '/report'} />
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                                <div className="relative">
                                    <Button
                                        variant="secondary"
                                        iconOnly
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="w-9 h-9 p-0 relative"
                                    >
                                        <Bell size={18} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-burnt-orange rounded-full border-2 border-[#0a0a0f] text-[9px] text-white font-black grid place-items-center">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                    <AnimatePresence>
                                        {showNotifications && (
                                            <div className="absolute top-12 right-0 z-[1100]">
                                                <NotificationPanel onClose={() => setShowNotifications(false)} />
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${
                                    isAdmin 
                                        ? 'bg-red-900/30 border-red-900/50' 
                                        : 'bg-white/[0.03] border-white/5'
                                }`}>
                                    <User size={14} className={isAdmin ? 'text-burnt-orange' : 'text-white/40'} />
                                    <span className="text-[13px] font-bold text-white/80 capitalize">
                                        {role?.replace('_', ' ') || 'User'}
                                    </span>
                                </div>

                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleLogout}
                                    title="Logout of System"
                                    className="px-3 border-white/10 text-white/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20"
                                >
                                    <LogOut size={16} /> <span className="hidden md:inline">Exit</span>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/auth" className="no-underline flex items-center">
                                <span className="text-[13px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-widest">Student Access</span>
                            </Link>
                            <Link to="/admin-auth" className="no-underline">
                                <Button size="sm" className="h-10 px-5 uppercase font-black tracking-widest text-[10px]">
                                    Administrative Portal
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
