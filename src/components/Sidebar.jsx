import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    Shield,
    Home,
    Settings,
    ChevronRight,
    Command
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
    <Link to={to} className="no-underline">
        <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mb-1 relative border ${
                active 
                    ? 'text-white bg-white/[0.04] border-white/[0.12]' 
                    : 'text-white/30 bg-transparent border-transparent'
            }`}
        >
            <div className={`flex items-center justify-center ${active ? 'text-primary-cyan' : 'text-current'}`}>
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span className={`text-[13px] flex-1 tracking-tight ${active ? 'font-bold' : 'font-medium'}`}>
                {label}
            </span>
            {active && <div className="w-1.5 h-1.5 rounded-full bg-primary-cyan shadow-[0_0_12px_rgba(91,238,252,0.6)]" />}
        </motion.div>
    </Link>
);

export const Sidebar = () => {
    const location = useLocation();
    const { userRole } = useAuth();
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    const menuItems = isAdmin ? [
        { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
        { to: '/home', icon: Home, label: 'Home Page' },
    ] : [
        { to: '/home', icon: Home, label: 'Home Page' },
        { to: '/dashboard', icon: LayoutDashboard, label: 'Reported Issues' },
        { to: '/report', icon: FileText, label: 'Report New Issue' },
    ];

    return (
        <aside className="w-[280px] h-screen fixed left-0 top-0 bg-[#0d1114]/80 backdrop-blur-4xl border-r border-white/5 flex flex-col p-8 md:p-4 z-50">
            <div className="flex items-center gap-3 mb-12 px-2">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-cyan to-accent-green rounded-[10px] flex items-center justify-center shadow-[0_0_20px_rgba(91,238,252,0.2)]">
                    <Shield size={20} className="text-bg-dark" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-white font-display uppercase tracking-tight">CIRTS</h2>
                    <p className="text-[9px] font-black text-primary-cyan uppercase tracking-[0.15em]">
                        {isAdmin ? 'Admin Panel' : 'Student Panel'}
                    </p>
                </div>
            </div>

            <nav className="flex-1">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-4 mb-4">
                    Navigation
                </div>
                {menuItems.map((item) => (
                    <SidebarLink
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        label={item.label}
                        active={location.pathname === item.to}
                    />
                ))}
            </nav>

            <div className="mt-auto p-4 bg-white/[0.01] rounded-2xl border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.03] grid place-items-center text-white/20">
                    <Command size={14} />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-bold m-0 text-white/40 uppercase tracking-widest">System Status</p>
                    <p className="text-[9px] text-accent-green m-0 mt-0.5 uppercase font-black">Stable & Secure</p>
                </div>
            </div>
        </aside>
    );
};
