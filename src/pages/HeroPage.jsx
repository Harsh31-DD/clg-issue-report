import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ------------------------------------------------
   Tiny Win2K icon SVGs (inline, system-style)
------------------------------------------------ */
const IconShield = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="2" width="20" height="26" rx="2" fill="#000080" stroke="#000" strokeWidth="1" />
        <path d="M16 6 L24 10 L24 18 Q24 24 16 28 Q8 24 8 18 L8 10 Z" fill="#1084d0" stroke="#000" strokeWidth="1" />
        <path d="M12 17 L15 20 L21 13" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
);

const IconActivity = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="22" height="22" fill="white" stroke="#808080" />
        <polyline points="3,14 7,8 11,16 15,6 19,11 21,11" stroke="#000080" strokeWidth="2" fill="none" />
    </svg>
);

const IconAlert = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="22" height="22" fill="white" stroke="#808080" />
        <path d="M12 3 L21 20 L3 20 Z" fill="#FFD700" stroke="#000" strokeWidth="1" />
        <text x="12" y="17" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000">!</text>
    </svg>
);

const IconLock = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="22" height="22" fill="white" stroke="#808080" />
        <rect x="7" y="11" width="10" height="8" fill="#808080" stroke="#000" strokeWidth="1" />
        <path d="M9 11 L9 8 Q9 5 12 5 Q15 5 15 8 L15 11" stroke="#000" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="15" r="1.5" fill="white" />
    </svg>
);

const IconDocument = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="18" height="24" fill="white" stroke="#000" strokeWidth="1" />
        <path d="M18 2 L22 6 L18 6 L18 2 Z" fill="#C0C0C0" stroke="#000" strokeWidth="1" />
        <line x1="8" y1="11" x2="20" y2="11" stroke="#000080" strokeWidth="1" />
        <line x1="8" y1="14" x2="20" y2="14" stroke="#000080" strokeWidth="1" />
        <line x1="8" y1="17" x2="16" y2="17" stroke="#000080" strokeWidth="1" />
    </svg>
);

const IconComputer = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="22" height="16" rx="1" fill="#C0C0C0" stroke="#000" strokeWidth="1" />
        <rect x="5" y="5" width="18" height="12" fill="#000080" />
        <rect x="12" y="19" width="4" height="5" fill="#808080" />
        <rect x="8" y="24" width="12" height="2" fill="#808080" stroke="#000" strokeWidth="0.5" />
        <text x="14" y="13" textAnchor="middle" fontSize="7" fill="#00FF00" fontFamily="monospace">{'>'}_</text>
    </svg>
);

/* ------------------------------------------------
   Win2K FeatureCard  
------------------------------------------------ */
const FeatureCard = ({ icon, title, desc }) => (
    <div className="win-window flex-1 min-w-0">
        {/* Title bar */}
        <div className="win-titlebar">
            <div className="win-titlebar-btn">–</div>
            <span style={{ flex: 1, fontSize: 11 }}>{title}</span>
            <div className="win-titlebar-btn">□</div>
            <div className="win-titlebar-btn" style={{ fontWeight: 'bold' }}>✕</div>
        </div>
        {/* Content */}
        <div style={{ padding: '12px', backgroundColor: '#D4D0C8' }}>
            <div style={{ marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 11, color: '#000', lineHeight: 1.5 }}>{desc}</div>
        </div>
    </div>
);

/* ------------------------------------------------
   Blinking text cursor
------------------------------------------------ */
const BlinkCursor = () => (
    <span className="blink" style={{ marginLeft: 1, borderLeft: '2px solid #000', height: '1em', display: 'inline-block', verticalAlign: 'middle' }} />
);

/* ------------------------------------------------
   Main HeroPage
------------------------------------------------ */
const HeroPage = () => {
    const { isAuthenticated } = useAuth();
    const [time, setTime] = useState(new Date());
    const [statusMsg, setStatusMsg] = useState('System ready.');

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#008080',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='2' height='2' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='%23009090'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%23009090'/%3E%3C/svg%3E")`,
            fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '48px', /* space for navbar */
        }}>

            {/* ---- MAIN CONTENT AREA ---- */}
            <div style={{ flex: 1, padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 900, margin: '0 auto', width: '100%' }}>

                {/* ---- MAIN WINDOW: CIRTS ---- */}
                <div className="win-window" style={{ width: '100%' }}>
                    {/* Title bar */}
                    <div className="win-titlebar">
                        <IconShield />
                        <span style={{ flex: 1, marginLeft: 4 }}>CIRTS - Campus Issue Reporting &amp; Tracking System</span>
                        <div className="win-titlebar-btn" style={{ marginLeft: 2 }}>–</div>
                        <div className="win-titlebar-btn">□</div>
                        <div className="win-titlebar-btn" style={{ fontWeight: 'bold', color: 'red' }}>✕</div>
                    </div>

                    {/* Menu bar */}
                    <div style={{
                        backgroundColor: '#D4D0C8',
                        borderBottom: '1px solid #808080',
                        padding: '2px 4px',
                        display: 'flex',
                        gap: 2,
                        fontSize: 11,
                    }}>
                        {['File', 'Edit', 'View', 'Report', 'Help'].map(item => (
                            <span key={item} className="win-menu-item" style={{ padding: '1px 6px' }}>{item}</span>
                        ))}
                    </div>

                    {/* Toolbar */}
                    <div style={{
                        backgroundColor: '#D4D0C8',
                        borderBottom: '1px solid #808080',
                        padding: '4px 6px',
                        display: 'flex',
                        gap: 4,
                        alignItems: 'center',
                        fontSize: 11,
                    }}>
                        <button className="win-btn" style={{ minWidth: 60, fontSize: 11 }}>Back</button>
                        <button className="win-btn" style={{ minWidth: 60, fontSize: 11 }}>Forward</button>
                        <div className="win-separator" style={{ width: 1, height: 20, borderTop: 'none', borderLeft: '1px solid #808080', borderRight: '1px solid #fff', margin: '0 4px' }} />
                        <button className="win-btn" style={{ minWidth: 60, fontSize: 11 }}>Home</button>
                        <button className="win-btn" style={{ minWidth: 60, fontSize: 11 }}>Search</button>
                        <button className="win-btn" style={{ minWidth: 60, fontSize: 11 }}>Refresh</button>
                        <div style={{ flex: 1 }} />
                        <div className="win-panel-sunken" style={{ padding: '1px 6px', fontSize: 11, minWidth: 200, color: '#000' }}>
                            http://cirts.campus.edu/home<BlinkCursor />
                        </div>
                        <button className="win-btn win-btn-primary" style={{ fontSize: 11 }}>Go</button>
                    </div>

                    {/* Main body */}
                    <div style={{ backgroundColor: '#D4D0C8', padding: 16, display: 'flex', gap: 16 }}>

                        {/* LEFT PANEL */}
                        <div style={{ width: 160, flexShrink: 0 }}>
                            <div className="win-window" style={{ marginBottom: 8 }}>
                                <div className="win-titlebar" style={{ fontSize: 11, padding: '2px 4px' }}>
                                    <span style={{ flex: 1 }}>Quick Links</span>
                                </div>
                                <div style={{ padding: '6px 4px', backgroundColor: '#D4D0C8', fontSize: 11 }}>
                                    {[
                                        isAuthenticated ? { label: '📁 My Dashboard', to: '/dashboard' } : { label: '🔑 Student Login', to: '/auth' },
                                        { label: '📝 File a Report', to: '/report' },
                                        { label: '🔒 Admin Portal', to: '/admin-auth' },
                                        { label: '❓ Help & FAQ', to: '/home' },
                                        { label: '📋 View Issues', to: isAuthenticated ? '/dashboard' : '/auth' },
                                    ].map(({ label, to }) => (
                                        <div key={label} style={{ marginBottom: 2 }}>
                                            <Link
                                                to={to}
                                                style={{
                                                    display: 'block',
                                                    color: '#000080',
                                                    textDecoration: 'underline',
                                                    padding: '2px 4px',
                                                    fontSize: 11,
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#000080'}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                                                onMouseOver={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.backgroundColor = '#000080'; }}
                                                onMouseOut={e => { e.currentTarget.style.color = '#000080'; e.currentTarget.style.backgroundColor = ''; }}
                                            >
                                                {label}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="win-window">
                                <div className="win-titlebar" style={{ fontSize: 11, padding: '2px 4px' }}>
                                    <span style={{ flex: 1 }}>System Info</span>
                                </div>
                                <div style={{ padding: '6px 4px', backgroundColor: '#D4D0C8', fontSize: 10, lineHeight: 1.6 }}>
                                    <div><b>OS:</b> Campus NT 5.0</div>
                                    <div><b>Ver:</b> CIRTS v2.0.4</div>
                                    <div><b>Status:</b> <span style={{ color: 'green' }}>Online</span></div>
                                    <div><b>Date:</b> {dateStr}</div>
                                    <div><b>Time:</b> {timeStr}</div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT MAIN CONTENT */}
                        <div style={{ flex: 1, minWidth: 0 }}>

                            {/* Hero banner */}
                            <div className="win-window" style={{ marginBottom: 12 }}>
                                <div className="win-titlebar">
                                    <span style={{ flex: 1 }}>Welcome to CIRTS</span>
                                </div>
                                <div style={{ padding: 16, backgroundColor: '#D4D0C8' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                        {/* Big icon */}
                                        <div style={{ flexShrink: 0 }}>
                                            <div style={{
                                                width: 64,
                                                height: 64,
                                                background: 'linear-gradient(135deg, #000080, #1084d0)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '2px solid #808080',
                                            }}>
                                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                                    <path d="M20 2 L36 9 L36 22 Q36 33 20 38 Q4 33 4 22 L4 9 Z" fill="#1084d0" stroke="white" strokeWidth="1.5" />
                                                    <path d="M13 21 L18 26 L28 14" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: 20,
                                                fontWeight: 'bold',
                                                color: '#000080',
                                                marginBottom: 4,
                                                fontFamily: 'Tahoma, Arial, sans-serif',
                                            }}>
                                                College Issue Reporting System
                                            </div>
                                            <div style={{ fontSize: 11, color: '#000', lineHeight: 1.6, marginBottom: 12 }}>
                                                Report and track campus issues easily. Ensuring a better campus environment 
                                                through transparent and quick reporting. All submissions are logged and monitored 
                                                by campus administration.
                                            </div>

                                            {/* Progress bar decoration */}
                                            <div style={{ marginBottom: 10 }}>
                                                <div style={{ fontSize: 10, color: '#000', marginBottom: 2 }}>Campus System Status:</div>
                                                <div className="win-panel-sunken" style={{ height: 16, padding: 0, overflow: 'hidden', position: 'relative', width: '80%' }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: '73%',
                                                        background: 'repeating-linear-gradient(90deg, #000080 0px, #000080 10px, #4060d0 10px, #4060d0 20px)'
                                                    }} />
                                                </div>
                                                <div style={{ fontSize: 10, color: '#000' }}>73% of issues resolved this semester</div>
                                            </div>

                                            {/* Action buttons */}
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {isAuthenticated ? (
                                                    <>
                                                        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                                                            <button className="win-btn win-btn-primary" style={{ fontSize: 11, padding: '4px 16px' }}>
                                                                📊 Open Dashboard
                                                            </button>
                                                        </Link>
                                                        <Link to="/report" style={{ textDecoration: 'none' }}>
                                                            <button className="win-btn" style={{ fontSize: 11 }}>
                                                                📝 File New Report
                                                            </button>
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link to="/auth" style={{ textDecoration: 'none' }}>
                                                            <button className="win-btn win-btn-primary" style={{ fontSize: 11, padding: '4px 16px' }}>
                                                                🔑 Log On...
                                                            </button>
                                                        </Link>
                                                        <Link to="/report" style={{ textDecoration: 'none' }}>
                                                            <button className="win-btn" style={{ fontSize: 11 }}>
                                                                📝 Report Issue
                                                            </button>
                                                        </Link>
                                                        <button className="win-btn" style={{ fontSize: 11 }}>
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature cards row */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <FeatureCard
                                    icon={<IconActivity />}
                                    title="Real-time Tracking"
                                    desc="Track the status of your reported issues in real-time as they are reviewed and resolved by campus staff."
                                />
                                <FeatureCard
                                    icon={<IconAlert />}
                                    title="Instant Alerts"
                                    desc="Receive instant desktop notifications on updates, status changes, and issue resolutions."
                                />
                                <FeatureCard
                                    icon={<IconLock />}
                                    title="Secure Login"
                                    desc="Access your account securely using your campus credentials. Protected by Windows 2000 security."
                                />
                            </div>

                            {/* Admin access notice */}
                            <div className="win-panel-sunken" style={{ padding: '4px 8px', fontSize: 10, color: '#808080', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="#D4D0C8" stroke="#808080"/><text x="6" y="9" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#808080">i</text></svg>
                                <span>Restricted area: </span>
                                <Link to="/admin-auth" style={{ color: '#000080', fontSize: 10 }}>Administrative access only →</Link>
                            </div>
                        </div>
                    </div>

                    {/* Status bar */}
                    <div className="win-statusbar">
                        <div className="win-panel-sunken" style={{ padding: '1px 8px', flex: 1, fontSize: 10 }}>
                            {statusMsg}
                        </div>
                        <div className="win-panel-sunken" style={{ padding: '1px 8px', fontSize: 10, minWidth: 120 }}>
                            Campus Network
                        </div>
                        <div className="win-panel-sunken" style={{ padding: '1px 8px', fontSize: 10, minWidth: 80 }}>
                            {timeStr}
                        </div>
                    </div>
                </div>

                {/* ---- DESKTOP ICONS ROW ---- */}
                <div style={{ display: 'flex', gap: 16, paddingLeft: 8 }}>
                    {[
                        { icon: <IconComputer />, label: 'My Campus', to: '/home' },
                        { icon: <IconDocument />, label: 'My Reports', to: isAuthenticated ? '/dashboard' : '/auth' },
                        { icon: <IconShield />, label: 'Security', to: '/admin-auth' },
                    ].map(({ icon, label, to }) => (
                        <Link key={label} to={to} style={{ textDecoration: 'none' }}>
                            <div className="win-desktop-icon">
                                {icon}
                                <span
                                    className="icon-label"
                                    style={{
                                        fontSize: 11,
                                        color: 'white',
                                        textAlign: 'center',
                                        textShadow: '1px 1px 1px #000',
                                        padding: '1px 2px',
                                        fontFamily: 'Tahoma, Arial, sans-serif',
                                    }}
                                >
                                    {label}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ---- TASKBAR ---- */}
            <div className="win-taskbar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, padding: '0 4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Start button */}
                <button className="win-btn" style={{
                    background: 'linear-gradient(to bottom, #4aab4a, #2a8a2a)',
                    color: 'white',
                    borderColor: '#6bcd6b',
                    fontWeight: 'bold',
                    fontSize: 12,
                    height: 22,
                    padding: '0 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <rect width="7" height="7" fill="#FF0000"/>
                        <rect x="9" width="7" height="7" fill="#00FF00"/>
                        <rect y="9" width="7" height="7" fill="#0000FF"/>
                        <rect x="9" y="9" width="7" height="7" fill="#FFFF00"/>
                    </svg>
                    Start
                </button>

                <div style={{ width: 1, height: 22, backgroundColor: '#808080', margin: '0 2px' }} />

                {/* Open window task button */}
                <button className="win-btn pressed" style={{
                    height: 22,
                    minWidth: 150,
                    fontSize: 10,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    gap: 4,
                    backgroundColor: '#C0C0C0',
                }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4 L14 4 L14 14 L2 14 Z" fill="#000080" stroke="#fff" strokeWidth="1"/>
                    </svg>
                    CIRTS - Campus Safety
                </button>

                <div style={{ flex: 1 }} />

                {/* System tray */}
                <div className="win-panel-sunken" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '1px 8px',
                    height: 22,
                    fontSize: 11,
                    color: '#000',
                }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" fill="#000080" stroke="#fff" strokeWidth="0.5"/>
                        <path d="M4 9 Q7 4 10 9" stroke="#fff" strokeWidth="1" fill="none"/>
                        <circle cx="7" cy="6" r="1.5" fill="#fff"/>
                    </svg>
                    <span>{timeStr}</span>
                </div>
            </div>

            {/* Bottom padding for taskbar */}
            <div style={{ height: 30 }} />
        </div>
    );
};

export default HeroPage;
