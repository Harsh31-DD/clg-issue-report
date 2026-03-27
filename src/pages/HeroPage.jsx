import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Zap, Activity, Cpu, Lock, Sparkles } from 'lucide-react';
import { Button, GlassyCard, Badge } from '../components/UI';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
    >
        <GlassyCard hoverable className="h-full p-8 md:p-10 text-left group border-white/5">
            <div className="w-14 h-14 rounded-2xl bg-primary-cyan/10 border border-primary-cyan/20 flex items-center justify-center mb-8 text-primary-cyan group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-black text-white mb-3 font-display uppercase tracking-tight">{title}</h3>
            <p className="text-[14px] text-white/40 leading-relaxed font-medium">
                {desc}
            </p>
        </GlassyCard>
    </motion.div>
);

const HeroPage = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="relative min-h-[90vh] flex flex-col items-center justify-center py-20 px-6 text-center overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-cyan/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl z-10"
            >
                <div className="mb-8">
                    <Badge variant="primary" className="pl-3 pr-4 py-1.5 flex items-center gap-2 mx-auto w-fit">
                        <Sparkles size={12} className="text-primary-cyan animate-pulse" />
                        <span className="text-[9px] uppercase font-black tracking-[0.2em]">Campus Reporting Active</span>
                    </Badge>
                </div>

                <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] mb-8 font-display tracking-tighter uppercase">
                    College Issue <br />
                    <span className="shine-text">Reporting System</span>
                </h1>

                <p className="text-base md:text-lg text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                    Report and track campus issues easily. Ensuring a better campus environment through transparent and quick reporting.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="no-underline w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:min-w-[200px] h-14 text-sm font-bold tracking-wider uppercase group">
                                    Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/report" className="no-underline w-full sm:w-auto">
                                <Button variant="secondary" size="lg" className="w-full sm:min-w-[200px] h-14 text-sm font-bold tracking-wider uppercase">
                                    Report Issue
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/auth" className="no-underline w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:min-w-[200px] h-14 text-sm font-bold tracking-wider uppercase group">
                                    Login <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/report" className="no-underline w-full sm:w-auto">
                                <Button variant="secondary" size="lg" className="w-full sm:min-w-[200px] h-14 text-sm font-bold tracking-wider uppercase">
                                    Report Issue
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Sub-link for Staff */}
                <div className="mt-8">
                    <Link to="/admin-auth" className="text-[10px] text-white/20 hover:text-primary-cyan transition-colors font-black uppercase tracking-[0.2em] no-underline">
                        Are you Staff? Access Admin Terminal
                    </Link>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-32 relative z-10">
                <FeatureCard
                    delay={0.1}
                    icon={<Activity size={24} />}
                    title="Real-time Track"
                    desc="Track the status of your reported issues in real-time as they resolve."
                />
                <FeatureCard
                    delay={0.2}
                    icon={<Cpu size={24} />}
                    title="Instant Alerts"
                    desc="Receive instant notifications on updates and resolutions."
                />
                <FeatureCard
                    delay={0.3}
                    icon={<Lock size={24} />}
                    title="Secure Login"
                    desc="Access your account securely with multi-platform verification."
                />
            </div>
            
            {/* Visual Accents */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    );
};

export default HeroPage;
