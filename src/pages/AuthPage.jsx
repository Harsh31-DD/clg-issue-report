import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Briefcase, GraduationCap, HardHat, ShieldCheck } from 'lucide-react';
import { Button, Input, GlassyCard, useToast, Badge } from '../components/UI';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const { addToast } = useToast();
    const navigate = useNavigate();

    const validateForm = () => {
        if (!email.includes('@')) {
            addToast('Please enter a valid email address.', 'error');
            return false;
        }
        if (password.length < 6) {
            addToast('Password must be at least 6 characters.', 'error');
            return false;
        }
        if (!isLogin && !name.trim()) {
            addToast('Please enter your full name.', 'error');
            return false;
        }
        return true;
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                // Role check handled in AuthContext, but let's be explicit for UX
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
                if (profile?.role === 'admin') {
                    await supabase.auth.signOut();
                    throw new Error('Please use the Administrative Portal for admin access.');
                }

                addToast('Access granted.', 'success');
                navigate('/dashboard');
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { 
                        data: { name, role },
                        emailRedirectTo: `${window.location.origin}/auth`
                    }
                });
                if (error) throw error;

                if (data.user) {
                    // Manual profile creation if trigger not used, or as fallback
                    const { error: profileError } = await supabase.from('profiles').upsert({ 
                        id: data.user.id, 
                        name, 
                        email, 
                        role 
                    });
                    if (profileError) console.error('Profile creation error:', profileError);
                    
                    addToast('Registry created. Please check your email or login.', 'success');
                    setIsLogin(true);
                }
            }
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'student', label: 'Student', icon: GraduationCap },
        { id: 'staff', label: 'Staff Member', icon: Briefcase }
    ];

    return (
        <div className="max-w-[520px] mx-auto w-full px-4">
            <Link to="/" className="flex items-center gap-2 text-white/10 hover:text-white/30 transition-colors text-[11px] font-black uppercase mb-8 no-underline group tracking-widest">
                <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> 
                Go Back
            </Link>

            <GlassyCard className="p-8 md:p-12 border-white/5">
                <div className="text-center mb-10">
                    <div className="inline-flex mb-4">
                        <Badge variant="primary">
                            <ShieldCheck size={12} className="mr-2" /> Secure Access
                        </Badge>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white font-display uppercase tracking-tighter">
                        Student & Staff Portal
                    </h2>
                    <p className="mt-2 text-[14px] text-white/30 font-medium tracking-wide">
                        {isLogin ? 'Enter credentials for the Student & Staff Dashboard' : 'Sign up to start reporting campus issues.'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-6">
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-col gap-6 overflow-hidden"
                            >
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] px-1">Choose Account Type</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {roles.map(r => (
                                            <button 
                                                key={r.id} 
                                                type="button" 
                                                onClick={() => setRole(r.id)} 
                                                className={`py-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer ${
                                                    role === r.id 
                                                        ? 'bg-primary-cyan/10 border-primary-cyan/40 text-white shadow-[0_0_20px_rgba(91,238,252,0.05)]' 
                                                        : 'bg-white/[0.01] border-white/5 text-white/20 hover:bg-white/[0.03]'
                                                }`}
                                            >
                                                <r.icon size={18} className={role === r.id ? 'text-primary-cyan' : ''} /> 
                                                <span className="text-[10px] font-bold tracking-tight">{r.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="relative">
                                    <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                                    <Input 
                                        placeholder="Full Name" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        className="pl-14" 
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                        <Input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="pl-14" 
                            required 
                        />
                    </div>

                    <div className="relative">
                        <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                        <Input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="pl-14" 
                            required 
                        />
                    </div>

                    <Button type="submit" loading={loading} size="lg" className="mt-4 w-full group uppercase tracking-widest font-black text-[12px] h-14">
                        {isLogin ? 'Sign In' : 'Sign Up'} 
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <button 
                        type="button" 
                        onClick={() => setIsLogin(!isLogin)} 
                        className="text-white/20 hover:text-primary-cyan text-[11px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                    >
                        {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </GlassyCard>
        </div>
    );
};

export default AuthPage;
