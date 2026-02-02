import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button, Input, GlassyCard, useToast } from '../components/UI';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';

export const AdminAuth = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw authError;

            if (data.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (profile?.role?.toLowerCase() !== 'admin') {
                    await supabase.auth.signOut();
                    addToast('Unauthorized access. Personnel only.', 'error');
                    throw new Error('This terminal is reserved for administrative personnel only.');
                }
                addToast('Access granted. Welcome, Administrator.', 'success');
                window.location.href = '/admin-dashboard';
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <GlassyCard glow style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px',
                    padding: '48px',
                    border: '1px solid #7A0F1A',
                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 0 40px rgba(122, 15, 26, 0.1)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            margin: '0 auto 24px',
                            background: 'linear-gradient(135deg, #7A0F1A, #E65A1F)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 30px rgba(122, 15, 26, 0.4)'
                        }}>
                            <Shield size={32} color="white" />
                        </div>
                        <h2 style={{
                            fontSize: '32px',
                            fontWeight: '800',
                            color: 'white',
                            margin: '0 0 12px 0',
                            fontFamily: 'Outfit',
                            letterSpacing: '-1px'
                        }}>
                            Admin Portal
                        </h2>
                        <p style={{ color: 'rgba(237, 237, 243, 0.4)', fontSize: '15px', margin: 0 }}>
                            Authorized Personnel Only. <br />
                            Please verify your administrative credentials.
                        </p>
                    </div>

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '16px', top: '14px', color: 'rgba(122, 15, 26, 0.6)' }} size={18} />
                            <Input
                                type="email"
                                placeholder="Admin ID / Email"
                                style={{ paddingLeft: '48px', height: '52px', border: '1px solid rgba(122, 15, 26, 0.3)' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '16px', top: '14px', color: 'rgba(122, 15, 26, 0.6)' }} size={18} />
                            <Input
                                type="password"
                                placeholder="Security Key"
                                style={{ paddingLeft: '48px', height: '52px', border: '1px solid rgba(122, 15, 26, 0.3)' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    padding: '14px',
                                    borderRadius: '12px',
                                    background: 'rgba(122, 15, 26, 0.1)',
                                    border: '1px solid rgba(122, 15, 26, 0.2)',
                                    color: '#E65A1F',
                                    fontSize: '13px',
                                    lineHeight: '1.4',
                                    textAlign: 'center'
                                }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button type="submit" glow style={{ width: '100%', height: '56px', background: 'linear-gradient(135deg, #7A0F1A, #E65A1F)' }} loading={loading}>
                            Verify Authorization <ArrowRight size={20} style={{ marginLeft: '12px' }} />
                        </Button>
                    </form>

                    <button
                        onClick={() => navigate('/auth')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.2)',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                    >
                        Return to Standard Node
                    </button>
                </GlassyCard>
            </motion.div>
        </AuthLayout>
    );
};
