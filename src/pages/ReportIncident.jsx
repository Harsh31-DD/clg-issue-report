import React, { useState } from 'react';
import { GlassyCard, Button, Input, useToast, Badge } from '../components/UI';
import { Camera, Send, MapPin, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ReportIncident = () => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Safety');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [priority, setPriority] = useState('Medium');
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            addToast('Please provide all required details.', 'error');
            return;
        }
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('incidents').insert({
                title,
                category,
                description,
                reporter_id: user.id,
                status: 'Submitted',
                priority
            });
            if (error) throw error;
            setSuccess(true);
            addToast('Report submitted successfully.', 'success');
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <div className="max-w-[600px] mx-auto mt-20 text-center px-4">
            <GlassyCard className="p-12 border-white/5">
                <div className="w-20 h-20 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-8 text-accent-green shadow-[0_0_40px_rgba(22,246,134,0.1)]">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Report Submitted</h2>
                <p className="text-[14px] text-white/30 mb-8 max-w-[400px] mx-auto font-medium">Successfully recorded. Returning to your dashboard to track progress...</p>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '100%' }} 
                        transition={{ duration: 2.5 }} 
                        className="h-full bg-accent-green shadow-[0_0_15px_rgba(22,246,134,0.4)]" 
                    />
                </div>
            </GlassyCard>
        </div>
    );

    return (
        <div className="max-w-[800px] mx-auto px-4">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Report a New Issue</h1>
                    <p className="text-white/30 mt-2 font-medium">Describe the problem clearly for quick resolution.</p>
                </div>
                <Link to="/dashboard">
                    <Button variant="secondary" size="md" iconOnly className="h-12 w-12 rounded-2xl">
                        <ArrowLeft size={18} />
                    </Button>
                </Link>
            </div>

            <GlassyCard className="p-8 md:p-12 border-white/5">
                <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                    <div className="flex flex-col gap-4 text-left">
                        <label className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] px-1">Issue Category</label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {['Safety', 'Infrastructure', 'Technical', 'Administrative'].map(c => (
                                <button 
                                    key={c} 
                                    type="button" 
                                    onClick={() => setCategory(c)} 
                                    className={`py-4 rounded-2xl border text-[12px] font-bold transition-all duration-300 cursor-pointer ${
                                        category === c 
                                            ? 'bg-primary-cyan/10 border-primary-cyan/40 text-white shadow-[0_0_20px_rgba(91,238,252,0.05)]' 
                                            : 'bg-white/[0.01] border-white/5 text-white/15 hover:bg-white/[0.03]'
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                        <div className="flex flex-col gap-4">
                            <label className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] px-1">Title</label>
                            <Input placeholder="What is the issue?" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        <div className="flex flex-col gap-4">
                            <label className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] px-1">Priority Level</label>
                            <div className="flex gap-2">
                                {['Low', 'Medium', 'High'].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-4 rounded-2xl border text-[11px] font-bold transition-all duration-300 cursor-pointer ${
                                            priority === p
                                                ? 'bg-white/5 border-white/20 text-white'
                                                : 'bg-white/[0.01] border-white/5 text-white/15 hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 text-left">
                        <label className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] px-1">Detailed Description</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            className="w-full h-44 bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-white text-[14px] outline-none transition-all duration-300 focus:border-primary-cyan/40 focus:bg-white/[0.04] focus:shadow-[0_0_20px_rgba(91,238,252,0.05)] placeholder:text-white/20 resize-none leading-relaxed" 
                            required 
                            placeholder="Describe the problem clearly..." 
                        />
                    </div>

                    <Button type="submit" loading={loading} size="lg" className="h-14 w-full uppercase font-black tracking-widest text-[11px] group">
                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                        Submit Report
                    </Button>
                </form>
            </GlassyCard>
        </div>
    );
};

export default ReportIncident;
