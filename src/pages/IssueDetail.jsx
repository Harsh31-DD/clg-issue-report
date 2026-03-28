import React, { useEffect, useState } from 'react';
import { GlassyCard, Badge, Button, useToast } from '../components/UI';
import { Shield, Clock, ChevronLeft, MapPin, User, FileText, Activity, AlertCircle, Save, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const IssueDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOne = async () => {
            try {
                const { data, error } = await supabase.from('incidents').select('*').eq('id', id).single();
                if (error) throw error;
                setIncident(data);
                
                // Check if user is admin
                if (user) {
                    const { data: profile, error: pError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                    if (pError) throw pError;
                    setIsAdmin(profile?.role === 'admin');
                }
            } catch (err) {
                console.error("IssueDetail fetch error:", err);
                addToast(err.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchOne();
    }, [id, user]);

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending':     return '#EEE638';
            case 'in_progress': return '#F97316';
            case 'resolved':    return '#16F686';
            case 'noted':       return '#5BEEFC';
            default:            return 'rgba(255,255,255,0.2)';
        }
    };

    const handleUpdate = async (field, value, customToast) => {
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('incidents')
                .update({ [field]: value })
                .eq('id', id);

            if (error) throw error;
            
            setIncident(prev => ({ ...prev, [field]: value }));
            addToast(customToast || `Record updated: ${field} set to ${value}`, 'success');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setUpdating(false);
        }
    };

    const statusActions = [
        { value: 'noted', label: 'Mark as Noted', toast: 'Issue marked as Noted' },
        { value: 'in_progress', label: 'Mark as In Progress', toast: 'Issue is being processed' },
        { value: 'resolved', label: 'Mark as Resolved', toast: 'Issue resolved successfully' }
    ];


    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 gap-6">
            <div className="w-12 h-12 border-4 border-primary-cyan/10 border-t-primary-cyan rounded-full animate-spin" />
            <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] animate-pulse">Loading Details</div>
        </div>
    );

    if (!incident) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 gap-8 px-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500/40">
                <AlertCircle size={40} />
            </div>
            <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Issue Not Found</h2>
                <p className="text-[14px] text-white/20 mt-3 font-medium max-w-[320px]">This report may have been removed or the link is invalid.</p>
            </div>
            <Button variant="secondary" size="md" onClick={() => navigate(-1)} className="px-8 uppercase font-black tracking-widest text-[10px]">Go Back</Button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <Button variant="secondary" size="md" onClick={() => navigate(-1)} iconOnly className="h-12 w-12 rounded-2xl">
                    <ChevronLeft size={20} />
                </Button>
                <div className="flex gap-4">
                    {isAdmin && (
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary-cyan/5 border border-primary-cyan/10">
                            <Shield size={14} className="text-primary-cyan" />
                            <span className="text-[10px] font-black uppercase text-primary-cyan tracking-widest">Admin Portal View</span>
                        </div>
                    )}
                    <Badge variant={incident.priority === 'High' ? 'error' : 'neutral'}>{incident.priority} Level</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                <div className="lg:col-span-2 flex flex-col gap-10">
                    <GlassyCard className="p-10 md:p-14 relative overflow-hidden group border-white/5">
                        <div
                            className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-1000 pointer-events-none"
                            style={{ color: getStatusColor(incident.status) }}
                        >
                            <Shield size={220} />
                        </div>
                        
                        <div className="flex flex-col gap-10 relative z-10">
                            <div className="flex flex-wrap items-center gap-4">
                                <Badge variant={incident.category === 'Emergency' ? 'error' : 'primary'} className="pl-2 pr-4 py-1.5 flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
                                    {incident.category}
                                </Badge>
                                <Badge variant={incident.status}>{incident.status.replace('_', ' ')}</Badge>
                                <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] ml-auto hidden md:block">
                                    REF-{incident.id.slice(0, 8).toUpperCase()}
                                </span>
                            </div>
                            
                            <h1 className="text-3xl md:text-6xl font-black text-white leading-[1] font-display uppercase tracking-tighter">{incident.title}</h1>
                            
                            <div className="h-1 bg-gradient-to-r from-primary-cyan/30 to-transparent w-40 rounded-full" />
                            
                            <p className="text-base md:text-xl text-white/40 leading-relaxed font-medium whitespace-pre-wrap">
                                {incident.description}
                            </p>
                        </div>
                    </GlassyCard>

                    {isAdmin && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <GlassyCard className="p-10 border-primary-cyan/10 shadow-[0_30px_60px_-15px_rgba(91,238,252,0.05)]">
                                <div className="flex items-center gap-4 mb-10">
                                    <div
                                        className="p-3 rounded-2xl bg-white/[0.02] border border-white/5"
                                        style={{ color: getStatusColor(incident.status) }}
                                    >
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Management Controls</h3>
                                        <p className="text-[10px] text-white/20 mt-2 uppercase font-black tracking-widest">Update incident parameters</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="flex flex-col gap-5">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Case Status</label>
                                        <div className="flex flex-wrap gap-2.5">
                                            {statusActions.map(action => (
                                                <button
                                                    key={action.value}
                                                    disabled={updating}
                                                    onClick={() => handleUpdate('status', action.value, action.toast)}
                                                    className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                                                        incident.status === action.value
                                                            ? 'bg-primary-cyan/20 text-primary-cyan shadow-[0_0_20px_rgba(91,238,252,0.1)] scale-105'
                                                                : 'bg-white/[0.01] border border-white/5 text-white/20 hover:bg-white/[0.03] hover:text-white/40'
                                                    } disabled:opacity-50 cursor-pointer`}
                                                >
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-5">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Set Priority</label>
                                        <div className="flex gap-2.5">
                                            {['Low', 'Medium', 'High'].map(p => (
                                                <button
                                                    key={p}
                                                    disabled={updating}
                                                    onClick={() => handleUpdate('priority', p)}
                                                    className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${
                                                        incident.priority === p
                                                            ? 'bg-white/5 border-white/20 text-white shadow-lg'
                                                            : 'bg-white/[0.01] border-white/5 text-white/10 hover:bg-white/[0.03] hover:text-white/30'
                                                    } disabled:opacity-50 cursor-pointer`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </GlassyCard>
                        </motion.div>
                    )}
                </div>

                <div className="flex flex-col gap-10">
                    <GlassyCard className="p-10 border-white/5 bg-white/[0.01]">
                        <h3 className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] mb-12 border-b border-white/5 pb-6">Case Briefing</h3>
                        
                        <div className="flex flex-col gap-10">
                            <div className="flex gap-6 items-start">
                                <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 text-white/10 group-hover:text-primary-cyan duration-500">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] mb-2">Time Recorded</div>
                                    <div className="text-white font-bold text-[13px] tracking-tight">{new Date(incident.created_at).toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 text-white/10">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] mb-2">Locality</div>
                                    <div className="text-white font-bold text-[13px] tracking-tight">General Campus Area</div>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 text-white/10">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] mb-2">Registry ID</div>
                                    <div className="text-white font-black text-[10px] opacity-40 truncate max-w-[140px] uppercase tracking-widest">{incident.id.slice(0, 16).toUpperCase()}...</div>
                                </div>
                            </div>
                        </div>
                    </GlassyCard>

                    <div className="p-10 rounded-[32px] bg-white/[0.01] border border-white/5 flex flex-col gap-8 text-center">
                        <div className="w-16 h-16 rounded-[20px] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto text-white/5">
                            <Shield size={32} />
                        </div>
                        <p className="text-[11px] text-white/20 font-medium leading-relaxed tracking-wide px-2">
                            This report is processed through secure channels. All updates are logged for verification.
                        </p>
                        <Button variant="secondary" size="md" className="w-full justify-center text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl" onClick={() => window.print()}>
                            Generate PDF Copy
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;
