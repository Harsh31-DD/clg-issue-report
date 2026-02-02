import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({
    session: null,
    userRole: null,
    loading: true,
    isAdmin: false,
    user: undefined,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('[AuthContext] Role fetch error:', error.message);
                return 'student';
            }
            return data?.role?.toLowerCase() || 'student';
        } catch (err) {
            console.error('[AuthContext] Role fetch exception:', err);
            return 'student';
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);
            await supabase.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            setSession(null);
            setUserRole(null);
        } catch (err) {
            console.error('[AuthContext] SignOut error:', err);
        } finally {
            setLoading(false);
            window.location.href = '/home';
        }
    };

    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (initialSession) {
                    setSession(initialSession); // Set session immediately
                    setLoading(false); // Clear loading immediately to prevent black screen
                    const role = await fetchUserRole(initialSession.user.id);
                    if (mounted) {
                        setUserRole(role);
                    }
                }
            } catch (err) {
                console.error('[AuthContext] Initialization error:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initialize();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            console.log('[AuthContext] Auth Event:', event);

            if (!mounted) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setSession(currentSession);
                setLoading(false); // Clear loading immediately on session
                if (currentSession?.user) {
                    const role = await fetchUserRole(currentSession.user.id);
                    if (mounted) setUserRole(role);
                }
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setUserRole(null);
                setLoading(false);
            } else {
                setSession(currentSession);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        session,
        userRole,
        loading,
        isAdmin: userRole === 'admin',
        user: session?.user,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
