import React, { useEffect, useState } from 'react';
import { GlassyCard, Badge, Button, useToast } from '../components/UI';
import { Shield, Clock, AlertTriangle, ChevronRight, Plus, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offline, setOffline] = useState(!navigator.onLine);
    const { addToast } = useToast();

    const getStatusText = (status) => {
        switch(status) {
            case 'pending': return 'Waiting for admin review';
            case 'noted': return 'Admin has seen your issue';
            case 'in_progress': return 'Issue is being worked on';
            case 'resolved': return 'Issue has been resolved';
            default: return 'Waiting for admin review';
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

    const fetchIncidents = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('incidents')
                    .select('*')
                    .eq('reporter_id', user.id)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                setIncidents(data || []);

                // Fetch notifications for Activity Feed
                const { data: notifData } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('type', 'status_update')
                    .order('created_at', { ascending: false })
                    .limit(5);
                setNotifications(notifData || []);
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleOffline = () => setOffline(true);
        const handleOnline = () => setOffline(false);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        fetchIncidents();

        // Real-time subscriptions wrapper
        let channel = supabase.channel('dashboard-updates');

        channel
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
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => setNotifications(prev => [payload.new, ...prev].slice(0, 5))
            )
            .subscribe();

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
            supabase.removeChannel(channel);
        };
    }, []);

    const stats = [
        { label: 'Total Reports',  value: incidents.length, icon: Shield,   color: '#5BEEFC' },
        { label: 'Pending Review', value: incidents.filter(i => i.status === 'pending').length,  icon: Clock,    color: '#EEE638' },
        { label: 'Resolved',       value: incidents.filter(i => i.status === 'resolved').length, icon: Activity, color: '#16F686' },
    ];

    return (
        <div className="flex flex-col gap-10">
            {offline && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-sm animate-pulse">
                    <AlertTriangle size={18} /> You are offline. Connection Lost.
                </div>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter">Your Reported Issues</h1>
                    <p className="text-white/30 mt-1 text-sm font-medium">Track status of your complaints instantly.</p>
                </div>
                <Link to="/report" className="no-underline">
                    <Button size="lg" className="w-full sm:w-auto h-12 px-6 uppercase font-black tracking-widest text-[11px] group">
                        <Plus size={16} className="group-hover:rotate-90 transition-transform" /> 
                        Report New Issue
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map(s => (
                    <GlassyCard key={s.label} className="p-5 sm:p-8 border-white/5">
                        <div className="flex justify-between items-start mb-4">
                            <div
                                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                                style={{ color: s.color }}
                            >
                                <s.icon size={20} />
                            </div>
                            <Badge variant="primary">{s.label}</Badge>
                        </div>
                        <div className="text-4xl sm:text-5xl font-black text-white font-display tracking-tighter">{s.value}</div>
                    </GlassyCard>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <GlassyCard className="p-0 overflow-hidden border-white/5 lg:col-span-2">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">Recent Reports</h3>
                            <p className="text-[10px] text-white/20 mt-1 uppercase font-black tracking-[0.2em]">Submitted by you</p>
                        </div>
                        <Badge variant="neutral">{incidents.length} Found</Badge>
                    </div>
                    <div className="divide-y divide-white/5">
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="animate-pulse flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5" />
                                    <div className="text-[10px] text-white/20 font-black tracking-[0.3em] uppercase underline-offset-8">Loading Records</div>
                                </div>
                            </div>
                        ) : incidents.length === 0 ? (
                            <div className="p-24 text-center flex flex-col items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/5">
                                    <AlertTriangle size={40} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-white/40 font-bold uppercase text-xs tracking-widest">No Issues Reported</p>
                                    <p className="text-white/20 text-xs">Your reporting history is currently empty.</p>
                                </div>
                                <Link to="/report">
                                    <Button variant="secondary" size="md">File Your First Issue</Button>
                                </Link>
                            </div>
                        ) : (
                            incidents.map((i, index) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={i.id}
                                >
                                    <Link to={`/issue/${i.id}`} className="no-underline group">
                                        <div className="p-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6 hover:bg-white/[0.02] transition-all cursor-pointer">
                                            <div className="flex gap-6 items-center">
                                            <div
                                                className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                                                style={{ color: getStatusColor(i.status) }}
                                            >
                                                <Shield size={24} />
                                            </div>
                                                <div>
                                                    <div className="text-base font-bold text-white group-hover:text-primary-cyan transition-colors">{i.title}</div>
                                                    <div className="text-[10px] text-white/40 mt-1.5 font-black uppercase tracking-widest">
                                                        {i.category} • {new Date(i.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-6 items-center justify-between md:justify-end">
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge variant={i.status}>{i.status.replace('_', ' ')}</Badge>
                                                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">{getStatusText(i.status)}</span>
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

                <GlassyCard className="p-0 overflow-hidden border-white/5 border-t-primary-cyan/30 border-t-2 h-fit">
                    <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <Activity size={16} className="text-primary-cyan" /> Activity Feed
                        </h3>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                        {loading ? (
                            <div className="text-[10px] text-center text-white/20 font-black tracking-widest uppercase p-10 animate-pulse">Syncing...</div>
                        ) : notifications.length === 0 ? (
                            <div className="text-[10px] text-center text-white/20 font-black tracking-widest uppercase p-10">No recent activity</div>
                        ) : (
                            <AnimatePresence>
                                {notifications.map(notif => (
                                    <motion.div 
                                        key={notif.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex gap-4"
                                    >
                                        <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-cyan shadow-[0_0_10px_rgba(91,238,252,0.5)] shrink-0" />
                                        <div>
                                            <p className="text-white text-[13px] font-bold leading-tight">{notif.message}</p>
                                            <p className="text-white/30 text-[9px] uppercase font-black tracking-widest mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </GlassyCard>
            </div>
        </div>
    );
};

export default Dashboard;
