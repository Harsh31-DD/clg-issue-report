import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button, Input, GlassyCard, useToast, Badge } from '../components/UI';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminAuth = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
            if (profile?.role !== 'admin') {
                await supabase.auth.signOut();
                throw new Error('Authorized personnel only. Access denied.');
            }

            addToast('Access cleared. Welcome, Administrator.', 'success');
            navigate('/admin-dashboard');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[500px] mx-auto w-full px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <GlassyCard className="p-10 md:p-14 border-white/5 shadow-[0_30px_60px_-15px_rgba(91,238,252,0.05)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6">
                        <Badge variant="error" className="h-6 px-3 text-[9px] uppercase font-black tracking-widest bg-red-500/10 text-red-400 border-red-500/20">Restricted</Badge>
                    </div>
                    
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 rounded-3xl bg-primary-cyan/5 border border-primary-cyan/10 flex items-center justify-center mx-auto mb-8 text-primary-cyan group-hover:scale-105 transition-transform duration-500">
                            <Shield size={40} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white font-display uppercase tracking-tighter">Administrative Access</h2>
                        <p className="text-[13px] text-white/20 mt-3 font-medium px-4">Enter your administrative credentials to continue to the dashboard.</p>
                    </div>

                    <form onSubmit={handleAuth} className="flex flex-col gap-6">
                        <div className="relative">
                            <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10" />
                            <Input 
                                type="email" 
                                placeholder="Admin Email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                className="pl-14 h-14 border-white/5 focus:border-primary-cyan/40 focus:shadow-[0_0_20px_rgba(91,238,252,0.05)]" 
                                required 
                            />
                        </div>
                        <div className="relative">
                            <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10" />
                            <Input 
                                type="password" 
                                placeholder="Access Key" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="pl-14 h-14 border-white/5 focus:border-primary-cyan/40 focus:shadow-[0_0_20px_rgba(91,238,252,0.05)]" 
                                required 
                            />
                        </div>
                        <Button 
                            type="submit" 
                            loading={loading} 
                            size="lg"
                            className="w-full h-14 mt-4 uppercase font-black tracking-widest text-[11px] group"
                        >
                            Sign In to Portal <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <Link to="/auth" className="text-white/20 hover:text-primary-cyan text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-3 no-underline group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Go back to Student Portal
                        </Link>
                    </div>
                </GlassyCard>
            </motion.div>
        </div>
    );
};

export default AdminAuth;
