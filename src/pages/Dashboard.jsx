import { useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Plus, ChevronRight, LayoutGrid, ThumbsUp, MapPin } from 'lucide-react';
import { GlassyCard, Button } from '../components/UI';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIncidents } from '../hooks/useIncidents';

export const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { incidents, loading, error, refetch, toggleVote } = useIncidents(user?.id);

    useEffect(() => {
        if (!user?.id) return;

        let mounted = true;
        const channel = supabase.channel('student_dashboard')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'issues',
                filter: `reported_by=eq.${user.id}`
            }, () => {
                if (mounted) refetch();
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'incident_votes'
            }, () => {
                if (mounted) refetch();
            })
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(channel);
        };
    }, [user?.id, refetch]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
            case 'Submitted': return '#E65A1F';
            case 'In Progress': return '#facc15';
            case 'Resolved': return '#10b981';
            default: return '#60a5fa';
        }
    };

    const handleVote = async (e, id) => {
        e.stopPropagation();
        await toggleVote(id);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ height: '80px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                    {[1, 2, 3, 4].map(i => <div key={i} style={{ height: '110px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px' }} />)}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div style={{ minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E65A1F', textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '8px' }}>
                        <LayoutGrid size={14} />
                        Registry Console
                    </div>
                    <h1 style={{ fontSize: 'min(36px, 8vw)', fontWeight: '800', color: 'white', margin: 0, fontFamily: 'Outfit' }}>
                        My Incidents
                    </h1>
                </div>
                <Link to="/report" style={{ textDecoration: 'none' }}>
                    <Button style={{ padding: '10px 20px' }}>
                        <Plus size={18} /> New Report
                    </Button>
                </Link>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                gap: '20px'
            }}>
                <StatCard label="Total Filed" value={incidents.length} icon={<Clock size={18} />} accent="#E65A1F" />
                <StatCard label="Successful" value={incidents.filter(i => i.status === 'Resolved').length} icon={<CheckCircle2 size={18} />} accent="#10b981" />
                <StatCard label="In Review" value={incidents.filter(i => i.status === 'Submitted' || i.status === 'Pending').length} icon={<AlertCircle size={18} />} accent="#facc15" />
                <StatCard label="Active" value={incidents.filter(i => i.status === 'In Progress').length} icon={<AlertCircle size={18} />} accent="#60a5fa" />
            </div>

            {error && (
                <GlassyCard style={{ textAlign: 'center', border: '1px solid rgba(230, 90, 31, 0.2)' }}>
                    <p style={{ color: '#E65A1F', margin: '0 0 12px 0', fontSize: '14px' }}>Sync issues detected.</p>
                    <Button variant="secondary" size="sm" onClick={refetch}>Retry Sync</Button>
                </GlassyCard>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {!error && incidents.length === 0 ? (
                    <GlassyCard style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.3)', margin: 0, fontSize: '15px' }}>No entries found in your registry.</p>
                        <Link to="/report" style={{ textDecoration: 'none' }}><Button variant="secondary" size="sm">File Incident</Button></Link>
                    </GlassyCard>
                ) : (
                    incidents.map((incident) => (
                        <div key={incident.id} onClick={() => navigate(`/issue/${incident.id}`)} style={{ cursor: 'pointer' }}>
                            <GlassyCard style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.03)' }} hoverable>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '16px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                color: getStatusColor(incident.status),
                                                padding: '3px 8px',
                                                borderRadius: '4px',
                                                backgroundColor: `${getStatusColor(incident.status)}10`,
                                                border: `1px solid ${getStatusColor(incident.status)}20`,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {incident.status}
                                            </span>
                                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                                {new Date(incident.created_at).toLocaleDateString()}
                                            </span>
                                            {incident.category && (
                                                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(253, 161, 54, 0.4)', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    • {incident.category}
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
                                            {incident.title || 'Untitled Report'}
                                        </h3>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                                            {incident.location && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                                                    <MapPin size={12} />
                                                    {incident.location}
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => handleVote(e, incident.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    background: incident.user_has_voted ? 'rgba(253, 161, 54, 0.1)' : 'transparent',
                                                    border: '1px solid',
                                                    borderColor: incident.user_has_voted ? 'rgba(253, 161, 54, 0.3)' : 'rgba(255,255,255,0.05)',
                                                    borderRadius: '6px',
                                                    padding: '4px 8px',
                                                    color: incident.user_has_voted ? '#FDA136' : 'rgba(255,255,255,0.2)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    fontSize: '12px',
                                                    fontWeight: 600
                                                }}
                                            >
                                                <ThumbsUp size={14} fill={incident.user_has_voted ? '#FDA136' : 'none'} />
                                                {incident.votes_count}
                                            </button>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} color="rgba(255,255,255,0.15)" />
                                </div>
                            </GlassyCard>
                        </div>
                    ))
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
