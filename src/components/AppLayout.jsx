import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../context/AuthContext';

export const AppLayout = () => {
    const { userRole } = useAuth();
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    return (
        <div className="flex min-h-screen bg-transparent text-white font-sans">
            {/* Sidebar (Fixed Area) */}
            <Sidebar />

            <div className="flex-1 ml-[280px] flex flex-col min-w-0 relative">
                {/* Header (Sticky Area) */}
                <Header />

                {/* Content Area */}
                <main className="pt-[calc(80px+theme(spacing.10))] p-10 flex-1 overflow-y-auto w-full max-w-[1600px] mx-auto relative z-10">
                    <Outlet />
                </main>

                {/* Background Decor */}
                <div className="fixed top-1/4 -right-[10%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(91,238,252,0.03)_0%,transparent_70%)] z-0 pointer-events-none" />
                <div className="fixed bottom-0 -left-[5%] w-[30%] h-[30%] bg-[radial-gradient(circle,rgba(22,246,134,0.02)_0%,transparent_70%)] z-0 pointer-events-none" />
            </div>
        </div>
    );
};
