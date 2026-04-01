import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Win2KNavbar = () => {
    const { isAuthenticated, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/home');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'linear-gradient(to bottom, #1a8bd8 0%, #0060b8 100%)',
            borderBottom: '2px solid #00387a',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            gap: 8,
            fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
        }}>
            {/* Logo area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
                <div style={{
                    width: 32,
                    height: 32,
                    background: 'linear-gradient(135deg, #000080, #1084d0)',
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2 L22 6 L22 14 Q22 20 12 23 Q2 20 2 14 L2 6 Z" fill="#1084d0" stroke="white" strokeWidth="1.5"/>
                        <path d="M8 12 L11 15 L17 9" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    </svg>
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 'bold', color: 'white', lineHeight: 1.1, textShadow: '1px 1px 2px #000' }}>
                        CIRTS
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', letterSpacing: 1 }}>
                        CAMPUS SAFETY
                    </div>
                </div>
            </div>

            {/* Separator */}
            <div style={{ width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.3)', marginRight: 4 }} />

            {/* Nav links */}
            <div style={{ display: 'flex', gap: 2, flex: 1 }}>
                {[
                    { label: 'Home', to: '/home' },
                    { label: 'Report Issue', to: '/report' },
                    { label: 'Dashboard', to: isAuthenticated ? '/dashboard' : '/auth' },
                    { label: 'Help', to: '/home' },
                ].map(({ label, to }) => (
                    <Link
                        key={label}
                        to={to}
                        style={{
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: 11,
                            fontWeight: 'bold',
                            padding: '3px 10px',
                            display: 'inline-block',
                            textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                            e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.textDecoration = 'none';
                        }}
                    >
                        {label}
                    </Link>
                ))}
            </div>

            {/* Right side buttons */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {isAuthenticated ? (
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: '#D4D0C8',
                            border: '2px outset #ffffff',
                            fontSize: 11,
                            fontFamily: 'Tahoma, Arial, sans-serif',
                            padding: '3px 12px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        🚪 Log Off
                    </button>
                ) : (
                    <>
                        <Link to="/auth" style={{ textDecoration: 'none' }}>
                            <button style={{
                                background: 'linear-gradient(to bottom, #4aab4a, #2a8a2a)',
                                border: '2px outset #6bcd6b',
                                color: 'white',
                                fontSize: 11,
                                fontFamily: 'Tahoma, Arial, sans-serif',
                                padding: '3px 12px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}>
                                🔑 Student Log On
                            </button>
                        </Link>
                        <Link to="/admin-auth" style={{ textDecoration: 'none' }}>
                            <button style={{
                                backgroundColor: '#D4D0C8',
                                border: '2px outset #ffffff',
                                fontSize: 11,
                                fontFamily: 'Tahoma, Arial, sans-serif',
                                padding: '3px 12px',
                                cursor: 'pointer',
                            }}>
                                🔒 Admin
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};
