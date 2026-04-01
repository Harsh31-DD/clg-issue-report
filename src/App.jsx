import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Context & Guards
import { useAuth } from './context/AuthContext';
import { RequireAuth, RequireGuest } from './components/RouteGuards';

// Layouts
import { PublicLayout } from './components/PublicLayout';
import { AuthLayout } from './components/AuthLayout';
import { AppLayout } from './components/AppLayout';

// Core Components
import { GlobalLoading } from './components/UI';

// Pages
const HeroPage = lazy(() => import('./pages/HeroPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AdminAuth = lazy(() => import('./pages/AdminAuth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ReportIncident = lazy(() => import('./pages/ReportIncident'));
const IssueDetail = lazy(() => import('./pages/IssueDetail'));

const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', height: '100%' }}
    >
        {children}
    </motion.div>
);

function App() {
    const { loading } = useAuth();
    const location = useLocation();

    return (
        <>
            <AnimatePresence mode="wait">
                {loading ? (
                    <GlobalLoading key="initial-loading" />
                ) : (
                    <Suspense fallback={<GlobalLoading />}>
                        <Routes location={location} key={location.pathname}>
                            {/* Public */}
                            <Route element={<PublicLayout />}>
                                <Route path="/home" element={<PageWrapper><HeroPage /></PageWrapper>} />
                                <Route path="/" element={<Navigate to="/home" replace />} />
                            </Route>

                            {/* Guest Only */}
                            <Route element={<RequireGuest><AuthLayout /></RequireGuest>}>
                                <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
                                <Route path="/admin-auth" element={<PageWrapper><AdminAuth /></PageWrapper>} />
                            </Route>

                            {/* Protected */}
                            <Route element={<AppLayout />}>
                                <Route element={<RequireAuth role="student" />}>
                                    <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
                                    <Route path="/report" element={<PageWrapper><ReportIncident /></PageWrapper>} />
                                    <Route path="/issue/:id" element={<PageWrapper><IssueDetail /></PageWrapper>} />
                                </Route>
                                <Route element={<RequireAuth role="admin" />}>
                                    <Route path="/admin-dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
                                    <Route path="/admin/issue/:id" element={<PageWrapper><IssueDetail /></PageWrapper>} />
                                </Route>
                            </Route>

                            <Route path="*" element={<Navigate to="/home" replace />} />
                        </Routes>
                    </Suspense>
                )}
            </AnimatePresence>
        </>
    );
}

export default App;
