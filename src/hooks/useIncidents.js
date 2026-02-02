import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Custom hook for fetching issues with voting support
 */
export const useIncidents = (userId) => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const fetchIncidents = useCallback(async (mounted, abortSignal) => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!mounted) return;

            // Fetch from the new 'issues' table
            let query = supabase
                .from('issues')
                .select('*, profiles(name, email), incident_votes(user_id)');

            if (userId) {
                query = query.eq('reported_by', userId);
            }

            const { data, error: fetchError } = await query
                .order('created_at', { ascending: false })
                .abortSignal(abortSignal);

            if (!mounted) return;
            if (fetchError) {
                if (fetchError.name === 'AbortError') return;
                throw fetchError;
            }

            // Map and calculate voting stats
            const formatted = (data || []).map((item) => ({
                ...item,
                title: item.title || null,
                votes_count: item.incident_votes?.length || 0,
                user_has_voted: item.incident_votes?.some((v) => v.user_id === user?.id) || false
            }));

            setIncidents(formatted);
        } catch (err) {
            if (mounted && err.name !== 'AbortError') {
                console.error('[useIncidents] Fetch error:', err);
                setError('Service synchronization failed.');
            }
        } finally {
            if (mounted) setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();

        const load = async () => {
            if (mounted) await fetchIncidents(mounted, controller.signal);
        };

        load();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [refetchTrigger, fetchIncidents]);

    const refetch = () => setRefetchTrigger(prev => prev + 1);

    const toggleVote = async (incidentId) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const incident = incidents.find(i => i.id === incidentId);
            if (!incident) return;

            if (incident.user_has_voted) {
                // Remove vote
                await supabase
                    .from('incident_votes')
                    .delete()
                    .eq('incident_id', incidentId)
                    .eq('user_id', user.id);
            } else {
                // Add vote
                await supabase
                    .from('incident_votes')
                    .insert({ incident_id: incidentId, user_id: user.id });
            }

            // Optimistic update for better UX
            setIncidents(prev => prev.map(i => {
                if (i.id === incidentId) {
                    return {
                        ...i,
                        user_has_voted: !i.user_has_voted,
                        votes_count: i.user_has_voted ? i.votes_count - 1 : i.votes_count + 1
                    };
                }
                return i;
            }));

        } catch (err) {
            console.error('[useIncidents] Vote toggle failed:', err);
            // Re-fetch on error to ensure sync
            refetch();
        }
    };

    return { incidents, loading, error, refetch, toggleVote };
};
