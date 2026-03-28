import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        // Safety timeout to prevent infinite loading (e.g. Supabase hang or offline)
        const loadingTimeout = setTimeout(() => {
            if (isMounted) {
                console.warn('[Auth] Safety timeout reached, forcing loading false');
                setLoading(false);
            }
        }, 5000);

        const handleAuth = async (session) => {
            try {
                if (!isMounted) return;

                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();

                    if (isMounted) {
                        setUser(session.user);
                        setUserRole(profile?.role || 'student');
                    }
                } else if (isMounted) {
                    setUser(null);
                    setUserRole(null);
                }
            } catch (err) {
                console.error("[Auth] Handler error:", err);
                if (isMounted) {
                    setUser(null);
                    setUserRole(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    clearTimeout(loadingTimeout);
                }
            }
        };

        // Initial session check and listener in one go
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleAuth(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleAuth(session);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            clearTimeout(loadingTimeout);
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            userRole,
            loading,
            signOut,
            isAuthenticated: !!user,
            session: { user }
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
