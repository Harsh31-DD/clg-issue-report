import { useEffect, useState } from 'react';
import { LayoutDashboard, FileText, LogOut, Shield, User, Bell } from 'lucide-react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { NotificationPanel } from './NotificationPanel';
import { useAuth } from '../context/AuthContext';
import { useToast } from './UI';

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, session, userRole: role } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const { addToast } = useToast();

    // Dynamic Title Logic
    useEffect(() => {
        const titleMap = {
            '/dashboard': 'Student Console | CIRTS',
            '/report': 'File Incident | CIRTS',
            '/admin-dashboard': 'Admin Dashboard | CIRTS',
            '/auth': 'Student Login | CIRTS',
            '/admin-auth': 'Admin Authentication | CIRTS'
        };

        const path = location.pathname;
        if (path.startsWith('/issue/')) document.title = 'Issue Timeline | CIRTS';
        else if (path.startsWith('/admin/issue/')) document.title = 'Case Management | CIRTS';
        else document.title = titleMap[path] || 'CIRTS | Campus Incident System';
    }, [location.pathname]);

    const handleLogout = async () => {
        await signOut();
        addToast('Session terminated.', 'success');
    };

    const isAdmin = role === 'admin';

    return (
        <nav style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            zIndex: 1000,
            backgroundColor: isAdmin ? 'rgba(122, 15, 26, 0.8)' : 'rgba(10, 10, 15, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: isAdmin ? '1px solid rgba(230, 90, 31, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
            padding: '0 24px',
            height: '72px',
            transition: 'all 0.3s ease'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: isAdmin ? 'linear-gradient(135deg, #7A0F1A, #E65A1F)' : 'linear-gradient(135deg, #E65A1F, #FDA136)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isAdmin ? '0 0 15px rgba(122, 15, 26, 0.3)' : '0 0 15px rgba(230, 90, 31, 0.2)'
                    }}>
                        <Shield size={18} color="white" />
                    </div>
                    <span style={{
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '20px',
                        letterSpacing: '-0.5px',
                        fontFamily: 'Outfit'
                    }}>
                        CIRTS {isAdmin && <span style={{ fontSize: '12px', opacity: 0.5, marginLeft: '4px' }}>ADMIN</span>}
                    </span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {session ? (
                        <>
                            <div style={{ display: 'flex', gap: '4px', marginRight: '16px' }}>
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

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '36px',
                                            height: '36px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            color: 'rgba(237, 237, 243, 0.8)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Bell size={18} />
                                    </button>
                                    <AnimatePresence>
                                        {showNotifications && (
                                            <div style={{ position: 'absolute', top: '48px', right: 0, zIndex: 1100 }}>
                                                <NotificationPanel onClose={() => setShowNotifications(false)} />
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 14px',
                                    borderRadius: '100px',
                                    backgroundColor: isAdmin ? 'rgba(122, 15, 26, 0.3)' : 'rgba(255,255,255,0.03)',
                                    border: isAdmin ? '1px solid rgba(122, 15, 26, 0.5)' : '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <User size={14} color={isAdmin ? '#E65A1F' : 'rgba(255,255,255,0.5)'} />
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' }}>
                                        {role ? role.replace('_', ' ') : 'User'}
                                    </span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    title="Logout of System"
                                    style={{
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        color: 'rgba(255,255,255,0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#ff6b6b';
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                    }}
                                >
                                    <LogOut size={16} />
                                    <span>Exit</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Link to="/auth" style={{ textDecoration: 'none' }}>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Portal Access</span>
                            </Link>
                            <Link to="/admin-auth" style={{ textDecoration: 'none' }}>
                                <button style={{
                                    backgroundColor: '#7A0F1A',
                                    color: 'white',
                                    padding: '8px 20px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    border: '1px solid rgba(230, 90, 31, 0.3)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}>Admin Terminal</button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, label, active, isAdmin }) => (
    <Link
        to={to}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: active ? 'white' : 'rgba(255, 255, 255, 0.5)',
            transition: 'all 0.2s',
            fontSize: '14px',
            fontWeight: 600,
            padding: '10px 16px',
            borderRadius: '8px',
            backgroundColor: active ? (isAdmin ? 'rgba(122, 15, 26, 0.5)' : 'rgba(230, 90, 31, 0.15)') : 'transparent',
            border: active ? (isAdmin ? '1px solid rgba(230, 90, 31, 0.3)' : '1px solid rgba(230, 90, 31, 0.2)') : '1px solid transparent'
        }}
    >
        {icon}
        <span>{label}</span>
    </Link>
);

export const Layout = ({ children }) => {
    const { userRole } = useAuth();
    const isAdmin = userRole === 'admin';

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#050508',
            backgroundImage: isAdmin
                ? 'radial-gradient(at 0% 0%, rgba(122, 15, 26, 0.2) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(230, 90, 31, 0.1) 0px, transparent 50%)'
                : 'radial-gradient(at 0% 0%, rgba(122, 15, 26, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(230, 90, 31, 0.1) 0px, transparent 50%)',
            backgroundAttachment: 'fixed',
            color: '#EDEDF3',
            fontFamily: 'Inter, sans-serif'
        }}>
            <Navbar />
            <main style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '112px 24px 64px 24px'
            }}>
                {children ? children : <Outlet />}
            </main>
        </div>
    );
};
