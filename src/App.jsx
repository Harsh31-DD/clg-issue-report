import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './components/Layout';
import { HeroPage } from './pages/HeroPage';
import { AuthPage } from './pages/AuthPage';
import { AdminAuth } from './pages/AdminAuth';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ReportIncident } from './pages/ReportIncident';
import { IssueDetail } from './pages/IssueDetail';
import { Shield } from 'lucide-react';
import { useAuth } from './context/AuthContext';

/* ---------- Page Transition Wrapper ---------- */
const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for a premium feel
        }}
    >
        {children}
    </motion.div>
);

/* ---------- Protected Route Component ---------- */
const ProtectedRoute = ({ children, requiredRole }) => {
    const { session, userRole, loading } = useAuth();

    if (loading) return null;

    if (!session) {
        return <Navigate to={requiredRole === 'admin' ? "/admin-auth" : "/auth"} replace />;
    }

    const isAdmin = userRole === 'admin';
    const isRegularUser = userRole && userRole !== 'admin';

    // Handle Admin routes
    if (requiredRole === 'admin' && !isAdmin) {
        return <Navigate to="/home" replace />;
    }

    // Handle Student/Staff routes
    if (requiredRole === 'student' && isAdmin) {
        return <Navigate to="/admin-dashboard" replace />;
    }

    return <>{children}</>;
};

/* ---------- Public Route Component ---------- */
const PublicRoute = ({ children }) => {
    const { session, userRole, loading } = useAuth();

    if (loading) return null;

    if (session && userRole) {
        return <Navigate to={userRole === 'admin' ? "/admin-dashboard" : "/home"} replace />;
    }

    return <>{children}</>;
};

function App() {
    const { loading } = useAuth();
    const location = useLocation();

    // Check for environment variables immediately
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#0B0B0B', color: '#E65A1F', padding: '20px', textAlign: 'center'
            }}>
                <Shield size={64} style={{ marginBottom: '24px' }} />
                <h1 style={{ fontSize: '24px', marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>Configuration Error</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '500px', marginBottom: '32px' }}>
                    Required environment variables are missing.
                </p>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public Access */}
                <Route path="/home" element={<PageWrapper><Layout><HeroPage /></Layout></PageWrapper>} />

                {/* Authentication - Wrapped in PublicRoute to redirect if already logged in */}
                <Route path="/auth" element={
                    <PublicRoute>
                        <PageWrapper><AuthPage /></PageWrapper>
                    </PublicRoute>
                } />

                <Route path="/admin-auth" element={
                    <PublicRoute>
                        <PageWrapper><AdminAuth /></PageWrapper>
                    </PublicRoute>
                } />

                {/* Student Protected Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute requiredRole="student">
                        <PageWrapper><Layout><Dashboard /></Layout></PageWrapper>
                    </ProtectedRoute>
                } />
                <Route path="/report" element={
                    <ProtectedRoute requiredRole="student">
                        <PageWrapper><Layout><ReportIncident /></Layout></PageWrapper>
                    </ProtectedRoute>
                } />
                <Route path="/issue/:id" element={
                    <ProtectedRoute requiredRole="student">
                        <PageWrapper><Layout><IssueDetail /></Layout></PageWrapper>
                    </ProtectedRoute>
                } />

                {/* Admin Protected Routes */}
                <Route path="/admin-dashboard" element={
                    <ProtectedRoute requiredRole="admin">
                        <PageWrapper><Layout><AdminDashboard /></Layout></PageWrapper>
                    </ProtectedRoute>
                } />
                <Route path="/admin/issue/:id" element={
                    <ProtectedRoute requiredRole="admin">
                        <PageWrapper><Layout><IssueDetail /></Layout></PageWrapper>
                    </ProtectedRoute>
                } />

                {/* Root Redirection - Start at Auth Page as requested */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
}

export default App;
