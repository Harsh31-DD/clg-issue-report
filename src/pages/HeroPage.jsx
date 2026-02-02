import { motion } from 'framer-motion';
import { Shield, ArrowRight, Zap, Target, Lock } from 'lucide-react';
import { Button } from '../components/UI';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const HeroPage = () => {
    const { session } = useAuth();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            textAlign: 'center',
            padding: '0 20px'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ maxWidth: '900px' }}
            >
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(230, 90, 31, 0.1)',
                    border: '1px solid rgba(230, 90, 31, 0.2)',
                    color: '#FDA136',
                    fontSize: '14px',
                    fontWeight: 700,
                    marginBottom: '32px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    <Zap size={16} />
                    2026 Campus Safety Standard
                </div>

                <h1 style={{
                    fontSize: 'clamp(40px, 8vw, 84px)',
                    fontWeight: 800,
                    color: 'white',
                    lineHeight: 0.95,
                    marginBottom: '24px',
                    fontFamily: 'Outfit',
                    letterSpacing: '-2px'
                }}>
                    Revolutionizing <br />
                    <span style={{
                        background: 'linear-gradient(135deg, #E65A1F, #FDA136)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Campus Security</span>
                </h1>

                <p style={{
                    fontSize: 'clamp(16px, 2vw, 20px)',
                    color: 'rgba(237, 237, 243, 0.6)',
                    maxWidth: '650px',
                    margin: '0 auto 48px',
                    lineHeight: 1.6
                }}>
                    CIRTS is an advanced AI-driven transparency system for university incident reporting.
                    Seamlessly connect students and staff for a safer campus environment.
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {session ? (
                        <>
                            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                                <Button size="lg" glow style={{ padding: '16px 32px', fontSize: '18px' }}>
                                    Launch Dashboard <ArrowRight size={20} style={{ marginLeft: '12px' }} />
                                </Button>
                            </Link>
                            <Link to="/report" style={{ textDecoration: 'none' }}>
                                <Button variant="secondary" size="lg" style={{ padding: '16px 32px', fontSize: '18px' }}>
                                    Report Incident
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/auth" style={{ textDecoration: 'none' }}>
                                <Button size="lg" style={{ padding: '16px 32px', fontSize: '18px' }}>
                                    Initialize Secure Access <ArrowRight size={20} style={{ marginLeft: '12px' }} />
                                </Button>
                            </Link>
                            <Link to="/admin-auth" style={{ textDecoration: 'none' }}>
                                <Button variant="secondary" size="lg" style={{ padding: '16px 32px', fontSize: '18px' }}>
                                    View System Ops
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    width: '100%',
                    maxWidth: '1200px',
                    marginTop: '100px'
                }}
            >
                <FeatureCard
                    icon={<Shield size={24} color="#FDA136" />}
                    title="Instant Alerts"
                    desc="Real-time notification system connecting campus security to incident reports."
                />
                <FeatureCard
                    icon={<Target size={24} color="#E65A1F" />}
                    title="Precise Tracking"
                    desc="AI-powered categorization and location mapping for every submission."
                />
                <FeatureCard
                    icon={<Lock size={24} color="#7A0F1A" />}
                    title="Encrypted Privacy"
                    desc="Industry-standard AES encryption for both staff and anonymous reporters."
                />
            </motion.div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '32px',
        textAlign: 'left',
        transition: 'all 0.3s'
    }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.borderColor = 'rgba(253, 161, 54, 0.3)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }}
    >
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'white' }}>{title}</h3>
        <p style={{ fontSize: '15px', color: 'rgba(237, 237, 243, 0.5)', lineHeight: 1.5, margin: 0 }}>{desc}</p>
    </div>
);
