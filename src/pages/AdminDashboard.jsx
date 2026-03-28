import React, { useState, useEffect } from 'react';
import { GlassyCard, Badge, Button, Input, useToast } from '../components/UI';
import { Shield, Filter, Search, ChevronRight, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [offline, setOffline] = useState(!navigator.onLine);
    const { addToast } = useToast();

    const fetchAll = async () => {
        try {
            const { data, error } = await supabase
                .from('incidents')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setIncidents(data || []);
        } catch (err) {
            console.error("AdminDashboard fetch error:", err);
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending':     return '#EEE638'; // yellow
            case 'in_progress': return '#F97316'; // orange
            case 'resolved':    return '#16F686'; // green
            case 'noted':       return '#5BEEFC'; // cyan
            default:            return 'rgba(255,255,255,0.2)';
        }
    };

    useEffect(() => {
        const handleOffline = () => setOffline(true);
        const handleOnline = () => setOffline(false);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        fetchAll();

        // Real-time subscription - Mutate state directly
        const channel = supabase
            .channel('admin-updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'incidents' },
                (payload) => setIncidents(prev => [payload.new, ...prev].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)))
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'incidents' },
                (payload) => setIncidents(prev => prev.map(i => i.id === payload.new.id ? payload.new : i))
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'incidents' },
                (payload) => setIncidents(prev => prev.filter(i => i.id !== payload.old.id))
            )
            .subscribe();

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredIncidents = filter === 'All' 
        ? incidents 
        : incidents.filter(i => i.status === filter);

    const stats = [
        { label: 'Total Logs',  value: incidents.length, icon: Activity,     color: '#5BEEFC' },
        { label: 'Critical',    value: incidents.filter(i => i.priority === 'High').length,    icon: AlertCircle,  color: '#EF4444' },
        { label: 'Pending',     value: incidents.filter(i => i.status === 'pending').length,   icon: Clock,        color: '#EEE638' },
        { label: 'Resolved',    value: incidents.filter(i => i.status === 'resolved').length,  icon: CheckCircle,  color: '#16F686' },
    ];

    return (
        <div className="flex flex-col gap-10">
            {offline && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-sm animate-pulse">
                    <AlertTriangle size={18} /> You are offline. Admin console connection lost.
                </div>
            )}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Admin Dashboard</h1>
                    <p className="text-white/30 mt-2 font-medium">Manage and resolve reported issues in real-time.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" size="md" onClick={() => fetchAll()} className="h-12 uppercase font-black tracking-widest text-[10px]">
                        <Activity size={16} /> Sync Records
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(s => (
                    <GlassyCard key={s.label} className="p-8 border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div
                                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                                style={{ color: s.color }}
                            >
                                <s.icon size={18} />
                            </div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{s.label}</span>
                        </div>
                        <div className="text-5xl font-black text-white font-display tracking-tighter">{s.value}</div>
                    </GlassyCard>
                ))}
            </div>

            <GlassyCard className="p-0 overflow-hidden border-white/5">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-8 bg-white/[0.01]">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-widest">Issue Management</h3>
                        <p className="text-[10px] text-white/20 mt-1 uppercase font-black tracking-[0.2em]">Filter by Status</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 overflow-x-auto max-w-full hidden-scrollbar">
                            {['All', 'pending', 'noted', 'in_progress', 'resolved'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setFilter(tab)}
                                    className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer whitespace-nowrap ${
                                        filter === tab 
                                            ? 'bg-primary-cyan/20 text-primary-cyan shadow-[0_0_20px_rgba(91,238,252,0.1)]' 
                                            : 'text-white/20 hover:text-white/40'
                                    }`}
                                >
                                    {tab.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="divide-y divide-white/5">
                    {loading ? (
                        <div className="p-24 text-center">
                            <div className="animate-pulse flex flex-col items-center gap-6">
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10" />
                                <div className="text-[10px] text-white/20 font-black tracking-[0.4em] uppercase">Fetching Incident Logs</div>
                            </div>
                        </div>
                    ) : filteredIncidents.length === 0 ? (
                        <div className="p-24 text-center flex flex-col items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/5">
                                <Shield size={40} />
                            </div>
                            <p className="text-white/20 font-black uppercase tracking-widest text-xs">No matching records found</p>
                        </div>
                    ) : (
                        filteredIncidents.map((i, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={i.id}
                            >
                                <Link to={`/admin/issue/${i.id}`} className="no-underline group">
                                    <div className="p-8 flex flex-col md:flex-row md:justify-between md:items-center gap-8 hover:bg-white/[0.02] transition-all cursor-pointer">
                                        <div className="flex gap-6 items-center">
                                            <div
                                                className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                                                style={{ color: getStatusColor(i.status) }}
                                            >
                                                <Activity size={24} />
                                            </div>
                                            <div>
                                                <div className="text-base font-bold text-white group-hover:text-primary-cyan transition-colors">{i.title}</div>
                                                <div className="text-[10px] text-white/20 mt-1 font-black uppercase tracking-widest flex items-center gap-3">
                                                    <span>REF-{i.id.slice(0, 6).toUpperCase()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/10" />
                                                    <span>{i.category}</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/10" />
                                                    <span>{new Date(i.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-6 items-center justify-between md:justify-end">
                                            <div className="flex gap-3">
                                                <Badge variant={i.priority === 'High' ? 'error' : 'primary'}>{i.priority}</Badge>
                                                <Badge variant={i.status}>{i.status.replace('_', ' ')}</Badge>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center text-white/10 group-hover:text-primary-cyan group-hover:bg-primary-cyan/5 transition-all">
                                                <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            </GlassyCard>
        </div>
    );
};

export default AdminDashboard;
