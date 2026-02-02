import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, User, Clock, Shield, CheckCircle, MessageSquare, ThumbsUp, Activity } from 'lucide-react';
import { GlassyCard, Button, Input, useToast } from '../components/UI';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const IssueDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, userRole, loading: authLoading } = useAuth();
    const [incident, setIncident] = useState(null);
    const [replies, setReplies] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [incidentFiles, setIncidentFiles] = useState([]);
    const [replyContent, setReplyContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [voting, setVoting] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const { addToast } = useToast();
    const scrollRef = useRef(null);

    const fetchReplies = useCallback(async (mounted, abortSignal) => {
        if (!id) return;
        try {
            const { data, error } = await supabase
                .from('issue_replies')
                .select('*, profiles(name, role)')
                .eq('issue_id', id)
                .order('created_at', { ascending: true })
                .abortSignal(abortSignal);

            if (mounted && !error) setReplies(data || []);
        } catch (err) {
            if (err.name !== 'AbortError') console.error('[IssueDetail] Reply sync error:', err);
        }
    }, [id]);

    const fetchAuditLogs = useCallback(async (mounted, abortSignal) => {
        if (!id || userRole !== 'admin') return;
        try {
            const { data, error } = await supabase
                .from('incident_logs')
                .select('*, profiles:changed_by(name)')
                .eq('incident_id', id)
                .order('created_at', { ascending: false })
                .abortSignal(abortSignal);

            if (mounted && !error) setAuditLogs(data || []);
        } catch (err) {
            if (err.name !== 'AbortError') console.error('[IssueDetail] Audit log fetch failed:', err);
        }
    }, [id, userRole]);

    const fetchData = useCallback(async (mounted, abortSignal) => {
        if (authLoading || !user || !id) return;

        try {
            const { data: incidentData, error: incError } = await supabase
                .from('issues')
                .select('*, profiles(name, email), incident_votes(user_id)')
                .eq('id', id)
                .single()
                .abortSignal(abortSignal);

            if (!mounted) return;
            if (incError) {
                if (incError.name === 'AbortError') return;
                throw incError;
            }

            const formatted = {
                ...incidentData,
                votes_count: incidentData.incident_votes?.length || 0,
                user_has_voted: incidentData.incident_votes?.some((v) => v.user_id === user.id) || false
            };

            setIncident(formatted);
            setAdminNote(formatted.admin_note || '');

            const { data: files } = await supabase
                .from('issue_images')
                .select('*')
                .eq('issue_id', id)
                .abortSignal(abortSignal);

            if (mounted) setIncidentFiles(files || []);

            await fetchReplies(mounted, abortSignal);
            await fetchAuditLogs(mounted, abortSignal);
        } catch (err) {
            if (mounted && err.name !== 'AbortError') {
                console.error('[IssueDetail] Data fetch failed:', err);
            }
        } finally {
            if (mounted) setLoading(false);
        }
    }, [authLoading, user, id, fetchReplies, fetchAuditLogs]);

    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();

        fetchData(mounted, controller.signal);

        const channel = supabase
            .channel(`issue-updates-${id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'issue_replies',
                filter: `issue_id=eq.${id}`
            }, () => fetchReplies(mounted, controller.signal))
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'incident_logs',
                filter: `incident_id=eq.${id}`
            }, () => fetchAuditLogs(mounted, controller.signal))
            .subscribe();

        return () => {
            mounted = false;
            controller.abort();
            supabase.removeChannel(channel);
        };
    }, [id, fetchData, fetchReplies, fetchAuditLogs]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [replies]);

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim() || sending || !user || !id) return;

        setSending(true);
        try {
            const { error } = await supabase
                .from('issue_replies')
                .insert({
                    issue_id: id,
                    user_id: user.id,
                    content: replyContent
                });
            if (error) throw error;
            setReplyContent('');
            addToast('Reply transmitted to timeline.', 'success');
            await fetchReplies(true);
        } catch (err) {
            console.error('[IssueDetail] Reply failed:', err);
            addToast('Transmission failure.', 'error');
        } finally {
            setSending(false);
        }
    };

    const toggleVote = async () => {
        if (!user || !id || voting) return;
        setVoting(true);
        try {
            if (incident.user_has_voted) {
                await supabase.from('incident_votes').delete().eq('incident_id', id).eq('user_id', user.id);
            } else {
                await supabase.from('incident_votes').insert({ incident_id: id, user_id: user.id });
            }
            fetchData(true);
        } catch (err) {
            console.error('[IssueDetail] Vote failed:', err);
        } finally {
            setVoting(false);
        }
    };

    const updateStatus = async (newStatus) => {
        if (!id) return;
        const confirmMsg = {
            'Resolved': 'Confirm resolution of case?',
            'In Progress': 'Initiate work on case?',
            'Under Review': 'Mark case as being reviewed?'
        };

        if (confirmMsg[newStatus] && !window.confirm(confirmMsg[newStatus])) return;

        try {
            const updates = {
                status: newStatus,
                status_updated_at: new Date().toISOString()
            };

            if (newStatus === 'Resolved') {
                updates.resolved_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('issues')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            setIncident({ ...incident, ...updates });
            addToast(`Case status shifted to ${newStatus}.`, 'success');
            await fetchAuditLogs(true);
        } catch (err) {
            console.error('[IssueDetail] Status update failed:', err);
            addToast('Status shift failed.', 'error');
        }
    };

    const handleSaveAdminNote = async () => {
        if (!id || savingNote) return;
        setSavingNote(true);
        try {
            const { error } = await supabase
                .from('issues')
                .update({ admin_note: adminNote })
                .eq('id', id);

            if (error) throw error;
            setIncident((prev) => ({ ...prev, admin_note: adminNote }));
            addToast('Resolution protocol updated.', 'success');
        } catch (err) {
            console.error('[IssueDetail] Admin note update failed:', err);
            addToast('Update failed.', 'error');
        } finally {
            setSavingNote(false);
        }
    };

    const isAdmin = userRole?.toLowerCase() === 'admin';

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px' }}>
            <div style={{ height: '60px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px' }} />
            <GlassyCard style={{ height: '400px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <div />
            </GlassyCard>
        </div>
    );

    if (!incident) return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            Case not found or access restricted.
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 20px 60px 20px', width: '100%' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <Button variant="secondary" size="sm" onClick={() => navigate(-1)} style={{ gap: '8px' }}>
                    <ChevronLeft size={16} /> Dashboard
                </Button>

                {isAdmin && incident.status !== 'Resolved' && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {incident.status === 'Submitted' && <Button size="sm" onClick={() => updateStatus('Under Review')}>Acknowledge</Button>}
                        {incident.status === 'Under Review' && <Button size="sm" onClick={() => updateStatus('In Progress')}>Assign</Button>}
                        <Button size="sm" variant="primary" onClick={() => updateStatus('Resolved')}>Close Case</Button>
                    </div>
                )}
            </div>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '24px',
                alignItems: 'start'
            }}>
                <div style={{
                    flex: '1',
                    minWidth: 'min(100%, 700px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}>
                    <GlassyCard style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', backgroundColor: 'rgba(230, 90, 31, 0.1)', color: '#FDA136' }}>
                                    {incident.category}
                                </span>
                                {incident.department && (
                                    <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255,255,255,0.6)' }}>
                                        {incident.department}
                                    </span>
                                )}
                                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>ID: {incident.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: incident.status === 'Resolved' ? '#10b981' : '#FDA136', fontSize: '13px', fontWeight: 600 }}>
                                {incident.status === 'Resolved' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                {incident.status}
                            </div>
                        </div>

                        <h1 style={{ fontSize: 'min(32px, 8vw)', fontWeight: 800, color: 'white', marginBottom: '16px', fontFamily: 'Outfit' }}>
                            {incident.title || 'Untitled Report'}
                        </h1>
                        <p style={{ color: 'rgba(237, 237, 243, 0.6)', lineHeight: 1.6, fontSize: '15px' }}>{incident.description}</p>

                        <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                            <Button
                                variant={incident.user_has_voted ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={toggleVote}
                                style={{
                                    gap: '8px',
                                    borderColor: incident.user_has_voted ? 'transparent' : 'rgba(253, 161, 54, 0.4)',
                                    color: incident.user_has_voted ? '#FDA136' : 'white'
                                }}
                                disabled={voting}
                            >
                                <ThumbsUp size={14} fill={incident.user_has_voted ? '#FDA136' : 'none'} />
                                {incident.votes_count} {incident.votes_count === 1 ? 'Upvote' : 'Upvotes'}
                            </Button>
                        </div>
                    </GlassyCard>

                    <GlassyCard style={{ display: 'flex', flexDirection: 'column', height: '500px', padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={14} /> Case Timeline
                            </h3>
                        </div>

                        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {replies.length === 0 && (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '13px' }}>
                                    No entries in the timeline.
                                </div>
                            )}
                            {replies.map((reply) => {
                                const isOwn = user?.id ? reply.user_id === user.id : false;
                                const isReplyAdmin = reply.profiles?.role?.toLowerCase() === 'admin';

                                return (
                                    <div key={reply.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                                        <div style={{
                                            maxWidth: '85%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            backgroundColor: isReplyAdmin ? 'rgba(230, 90, 31, 0.08)' : isOwn ? 'rgba(253, 161, 54, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                                {isReplyAdmin && <Shield size={10} color="#FDA136" />}
                                                <span style={{ fontSize: '10px', fontWeight: 700, color: isReplyAdmin ? '#FDA136' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                                                    {reply.profiles?.name || 'Anonymous User'} {isReplyAdmin && '(STAFF)'}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '14px', lineHeight: 1.5 }}>{reply.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSendReply} style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.1)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                            <Input
                                placeholder="Update the case timeline..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                style={{ height: '42px', fontSize: '14px' }}
                            />
                            <Button style={{ width: '42px', minWidth: '42px', padding: 0 }} disabled={!replyContent.trim() || sending} type="submit">
                                <Send size={18} />
                            </Button>
                        </form>
                    </GlassyCard>
                </div>

                <div style={{
                    width: '100%',
                    maxWidth: '340px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <GlassyCard style={{ padding: '20px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Registry Artifacts</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <InfoItem
                                icon={<User size={14} />}
                                label="Filing Party"
                                value={incident.is_anonymous ? 'Anonymous Reporter' : (incident.profiles?.name || 'Unknown')}
                            />
                            {incident.reporter_role && (
                                <InfoItem
                                    icon={<Shield size={14} />}
                                    label="Reporter Type"
                                    value={incident.reporter_role.replace('_', ' ')}
                                />
                            )}
                            <InfoItem icon={<Clock size={14} />} label="Filed At" value={new Date(incident.created_at).toLocaleString()} />
                            <InfoItem icon={<Shield size={14} />} label="Security Level" value={incident.priority} color={incident.priority === 'Critical' ? '#ff6b6b' : '#FDA136'} />
                        </div>

                        {incidentFiles.length > 0 && (
                            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Evidence Preview</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                                    {incidentFiles.map((file) => {
                                        const publicUrl = supabase.storage.from('issue-images').getPublicUrl(file.image_path).data.publicUrl;

                                        return (
                                            <a
                                                key={file.id}
                                                href={publicUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    aspectRatio: '1',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <img src={publicUrl} alt="evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </GlassyCard>

                    {isAdmin && (
                        <GlassyCard style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '11px', fontWeight: 800, color: '#FDA136', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={14} /> Audit Trail
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {auditLogs.length === 0 && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>No status shifts recorded.</p>}
                                {auditLogs.map((log) => (
                                    <div key={log.id} style={{ borderLeft: '1px dashed rgba(255,255,255,0.1)', paddingLeft: '12px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '-4.5px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(253, 161, 54, 0.4)' }} />
                                        <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: 'white' }}>
                                            {log.status_from} → {log.status_to}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                                            By {log.profiles?.name} • {new Date(log.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </GlassyCard>
                    )}

                    {isAdmin && !incident.is_anonymous && (
                        <GlassyCard style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Contact Protocol</h4>
                            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', wordBreak: 'break-all' }}>{incident.profiles?.email}</p>
                        </GlassyCard>
                    )}

                    {isAdmin && (
                        <GlassyCard style={{ padding: '20px', border: '1px solid rgba(253, 161, 54, 0.2)', backgroundColor: 'rgba(253, 161, 54, 0.02)' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: 800, color: '#FDA136', textTransform: 'uppercase' }}>Admin Resolution Note</h4>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Add notes for resolution or internal tracking..."
                                style={{
                                    width: '100%',
                                    height: '100px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    padding: '10px',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    resize: 'none',
                                    marginBottom: '10px'
                                }}
                            />
                            <Button size="sm" style={{ width: '100%' }} onClick={handleSaveAdminNote} disabled={savingNote}>
                                {savingNote ? 'Saving...' : 'Save Admin Note'}
                            </Button>
                        </GlassyCard>
                    )}

                    {!isAdmin && incident.admin_note && (
                        <GlassyCard style={{ padding: '20px', borderLeft: '3px solid #10b981', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Admin Resolution Note</h4>
                            <p style={{ margin: 0, fontSize: '13px', color: 'white', lineHeight: 1.5 }}>{incident.admin_note}</p>
                        </GlassyCard>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value, color = 'rgba(255,255,255,0.8)' }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            {icon} {label}
        </div>
        <div style={{ fontSize: '14px', color, fontWeight: 500 }}>{value}</div>
    </div>
);
