import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Briefcase, GraduationCap, HardHat, ShieldCheck } from 'lucide-react';
import { Button, Input, GlassyCard, useToast } from '../components/UI';
import { supabase } from '../lib/supabase';
import { AuthLayout } from '../components/AuthLayout';
import { Link } from 'react-router-dom';

export const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const { addToast } = useToast();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
                if (authError) throw authError;

                if (data.user) {
                    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
                    if (profile?.role?.toLowerCase() === 'admin') {
                        await supabase.auth.signOut();
                        throw new Error('Please use the Administrative Portal for admin access.');
                    }
                    window.location.href = '/home'; // Redirect to home page as requested
                }
            } else {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name,
                            role: role
                        }
                    }
                });
                if (authError) throw authError;

                if (authData.user) {
                    addToast('Registration initiated. Verification required.', 'success');
                    setIsLogin(true);
                }
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'student', label: 'Student', icon: GraduationCap },
        { id: 'teaching', label: 'Teaching Staff', icon: Briefcase },
        { id: 'non_teaching', label: 'Non-Teaching', icon: HardHat }
    ];

    return (
        <AuthLayout>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ position: 'relative' }}
            >
                <Link
                    to="/"
                    style={{
                        position: 'absolute',
                        top: '-48px',
                        left: '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'rgba(255,255,255,0.3)',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FDA136';
                        e.currentTarget.style.transform = 'translateX(-4px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
                        e.currentTarget.style.transform = 'translateX(0)';
                    }}
                >
                    <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
                    Return to Home
                </Link>

                <GlassyCard glow style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px',
                    padding: 'max(40px, 5vw)',
                    border: '1px solid rgba(253, 161, 54, 0.15)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(253, 161, 54, 0.05)'
                }}>
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#FDA136',
                            fontSize: '11px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            marginBottom: '4px'
                        }}>
                            <ShieldCheck size={14} />
                            Security Protocol Alpha
                        </div>
                        <h2 style={{
                            fontSize: 'clamp(28px, 4vw, 36px)',
                            fontWeight: '900',
                            color: 'white',
                            margin: 0,
                            fontFamily: 'Outfit',
                            letterSpacing: '-1px',
                            lineHeight: 1.1
                        }}>
                            {isLogin ? 'Access Portal' : 'Citizen Registry'}
                        </h2>
                        <p style={{ color: 'rgba(237, 237, 243, 0.4)', fontSize: '15px', margin: 0, fontWeight: 400 }}>
                            {isLogin ? 'Provide credentials to bypass neutral zone' : 'Initialize your standing in the campus network'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Entity Designation</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                            {roles.map((r) => {
                                                const Icon = r.icon;
                                                const active = role === r.id;
                                                return (
                                                    <button
                                                        key={r.id}
                                                        type="button"
                                                        onClick={() => setRole(r.id)}
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            padding: '12px 8px',
                                                            borderRadius: '12px',
                                                            border: '1px solid',
                                                            borderColor: active ? '#FDA136' : 'rgba(255, 255, 255, 0.05)',
                                                            background: active ? 'rgba(253, 161, 54, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                                            color: active ? 'white' : 'rgba(255, 255, 255, 0.4)',
                                                            fontSize: '11px',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                                        }}
                                                    >
                                                        <Icon size={18} color={active ? '#FDA136' : 'currentColor'} />
                                                        {r.label.split(' ')[0]}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div style={{ position: 'relative' }}>
                                        <User style={{ position: 'absolute', left: '16px', top: '16px', color: 'rgba(253, 161, 54, 0.4)' }} size={18} />
                                        <Input
                                            placeholder="Subject Full Name"
                                            style={{ paddingLeft: '48px', height: '52px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '16px', top: '16px', color: 'rgba(253, 161, 54, 0.4)' }} size={18} />
                            <Input
                                type="email"
                                placeholder="Network Identifier (Email)"
                                style={{ paddingLeft: '48px', height: '52px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '16px', top: '16px', color: 'rgba(253, 161, 54, 0.4)' }} size={18} />
                            <Input
                                type="password"
                                placeholder="Secure Encryption Key"
                                style={{ paddingLeft: '48px', height: '52px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: '14px',
                                    borderRadius: '12px',
                                    background: 'rgba(220, 38, 38, 0.1)',
                                    border: '1px solid rgba(220, 38, 38, 0.2)',
                                    color: '#f87171',
                                    fontSize: '13px',
                                    textAlign: 'center',
                                    fontWeight: 500
                                }}
                            >
                                SYNTAX ERROR: {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            glow
                            style={{
                                width: '100%',
                                height: '56px',
                                marginTop: '12px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            loading={loading}
                        >
                            {isLogin ? 'Establish Handshake' : 'Commit Registry'}
                            <ArrowRight size={18} style={{ marginLeft: '12px' }} />
                        </Button>
                    </form>

                    <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '24px' }}>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={{
                                color: 'rgba(255, 255, 255, 0.3)',
                                fontSize: '14px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#FDA136'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'}
                        >
                            {isLogin ? "Status: Unregistered? Toggle Enrollment" : 'Status: Established? Switch to Authentication'}
                        </button>
                    </div>
                </GlassyCard>
            </motion.div>
        </AuthLayout>
    );
};
