import { useEffect, useState } from 'react';
import { AlertCircle, Clock, CheckCircle2, Shield, Search, ChevronRight, User, Mail, ThumbsUp } from 'lucide-react';
import { GlassyCard, Input } from '../components/UI';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useIncidents } from '../hooks/useIncidents';

export const AdminDashboard = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDepartment, setFilterDepartment] = useState('All');

    const DEPARTMENTS = ['All', 'General', 'IT Services', 'Estate Management', 'Student Affairs', 'Security', 'Library'];
    const CATEGORIES = ['All', 'Water', 'Electricity', 'Cleanliness', 'Wi-Fi', 'Maintenance'];
    const STATUSES = ['All', 'Pending', 'Submitted', 'In Progress', 'Resolved'];
    const navigate = useNavigate();
    const { incidents, loading, refetch } = useIncidents();

    useEffect(() => {
        let mounted = true;
        const channel = supabase.channel('admin_core')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, () => {
                if (mounted) refetch();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_votes' }, () => {
                if (mounted) refetch();
            })
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(channel);
        };
    }, [refetch]);

    const stats = {
        total: incidents.length,
        pending: incidents.filter(i => i.status === 'Submitted' || i.status === 'Pending').length,
        inProgress: incidents.filter(i => i.status === 'In Progress').length,
        resolved: incidents.filter(i => i.status === 'Resolved').length
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Pending':
            case 'Submitted': return { color: '#E65A1F', bg: 'rgba(230, 90, 31, 0.1)' };
            case 'In Progress': return { color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)' };
            case 'Resolved': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            default: return { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' };
        }
    };

    // Sort incidents by upvotes (hot) descending, then by date
    const sortedIncidents = [...incidents].sort((a, b) => {
        if (b.votes_count !== a.votes_count) {
            return b.votes_count - a.votes_count;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const filteredIncidents = sortedIncidents.filter(i => {
        const matchesSearch = (i.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (i.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (!i.is_anonymous && (
                (i.profiles?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (i.profiles?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
            ));

        const matchesCategory = filterCategory === 'All' || i.category === filterCategory;
        const matchesStatus = filterStatus === 'All' || (filterStatus === 'Submitted' ? (i.status === 'Submitted' || i.status === 'Pending') : i.status === filterStatus);
        const matchesDepartment = filterDepartment === 'All' || (i.department || 'General') === filterDepartment;

        return matchesSearch && matchesCategory && matchesStatus && matchesDepartment;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ height: '80px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3, 4].map(i => <div key={i} style={{ height: '100px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px' }} />)}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
            <header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E65A1F', textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '8px' }}>
                    <Shield size={14} />
                    Administrative Console
                </div>
                <h1 style={{ fontSize: 'min(36px, 8vw)', fontWeight: '800', color: 'white', margin: 0, fontFamily: 'Outfit' }}>
                    Incident Registry
                </h1>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                gap: '20px'
            }}>
                <StatCard label="Total Workload" value={stats.total} icon={<Clock size={18} />} accent="#E65A1F" />
                <StatCard label="Pending Action" value={stats.pending} icon={<AlertCircle size={18} />} accent="#facc15" />
                <StatCard label="In Progress" value={stats.inProgress} icon={<Clock size={18} />} accent="#60a5fa" />
                <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 size={18} />} accent="#10b981" />
            </div>

            <GlassyCard style={{ padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <Input
                        placeholder="Filter by title, reporter, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            paddingLeft: '44px',
                            backgroundColor: 'transparent',
                            border: 'none'
                        }}
                    />
                </div>
            </GlassyCard>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white',
                        outline: 'none',
                        cursor: 'pointer',
                        fontSize: '13px'
                    }}
                >
                    {DEPARTMENTS.map(d => <option key={d} value={d} style={{ background: '#1a1a1a' }}>Dept: {d}</option>)}
                </select>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white',
                        outline: 'none',
                        cursor: 'pointer',
                        fontSize: '13px'
                    }}
                >
                    {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1a1a1a' }}>Cat: {c}</option>)}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white',
                        outline: 'none',
                        cursor: 'pointer',
                        fontSize: '13px'
                    }}
                >
                    {STATUSES.map(s => <option key={s} value={s} style={{ background: '#1a1a1a' }}>Status: {s}</option>)}
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredIncidents.length === 0 ? (
                    <GlassyCard style={{ padding: '60px', textAlign: 'center', opacity: 0.6 }}>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                            {searchQuery ? 'Search yielded no matches.' : 'Incident queue is currently empty.'}
                        </p>
                    </GlassyCard>
                ) : (
                    filteredIncidents.map((incident) => {
                        const statusStyle = getStatusStyles(incident.status);
                        return (
                            <div key={incident.id} onClick={() => navigate(`/admin/issue/${incident.id}`)} style={{ cursor: 'pointer' }}>
                                <GlassyCard style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.03)' }} hoverable>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '16px' }}>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    fontSize: '10px',
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    color: statusStyle.color,
                                                    padding: '4px 10px',
                                                    borderRadius: '4px',
                                                    backgroundColor: statusStyle.bg,
                                                    border: `1px solid ${statusStyle.color}20`,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {incident.status}
                                                </span>
                                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                                    {new Date(incident.created_at).toLocaleDateString()}
                                                </span>
                                                {incident.votes_count > 0 && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#FDA136', fontWeight: 800, whiteSpace: 'nowrap' }}>
                                                        <ThumbsUp size={10} fill="#FDA136" />
                                                        {incident.votes_count} UPVOTES
                                                    </span>
                                                )}
                                            </div>

                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                color: 'white',
                                                margin: 0,
                                                fontFamily: 'Outfit',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {incident.title || 'Untitled Incident'}
                                            </h3>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '100%', overflow: 'hidden' }}>
                                                    <User size={13} style={{ flexShrink: 0 }} />
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {incident.is_anonymous ?
                                                            <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Anonymous Reporter</span> :
                                                            (incident.profiles?.name || 'Unknown')}
                                                    </span>
                                                    {incident.reporter_role && (
                                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginLeft: '4px', whiteSpace: 'nowrap' }}>
                                                            [{incident.reporter_role.replace('_', ' ')}]
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} color="rgba(255,255,255,0.15)" style={{ flexShrink: 0 }} />
                                    </div>
                                </GlassyCard>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon, accent }) => (
    <GlassyCard style={{ padding: '20px', borderLeft: `3px solid ${accent}`, backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'rgba(255,255,255,0.25)', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            {icon}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>{value}</div>
    </GlassyCard>
);
