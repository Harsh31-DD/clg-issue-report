import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlobalLoading } from './UI';

export const RequireAuth = ({ children, role }) => {
    const { session, userRole, loading } = useAuth();
    const location = useLocation();

    if (loading) return <GlobalLoading />;

    if (!session?.user) {
        return <Navigate to={role === 'admin' ? '/admin-auth' : '/auth'} state={{ from: location }} replace />;
    }

    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    const isStudentOrStaff = userRole === 'student' || userRole === 'staff';

    if (role === 'admin' && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    if (role === 'student' && !isStudentOrStaff && isAdmin) {
        return <Navigate to="/admin-dashboard" replace />;
    }

    return children ? children : <Outlet />;
};

export const RequireGuest = ({ children }) => {
    const { session, userRole, loading } = useAuth();

    if (loading) return <GlobalLoading />;

    if (session && userRole) {
        const isAdmin = userRole === 'admin' || userRole === 'super_admin';
        return <Navigate to={isAdmin ? '/admin-dashboard' : '/dashboard'} replace />;
    }

    return children ? children : <Outlet />;
};
