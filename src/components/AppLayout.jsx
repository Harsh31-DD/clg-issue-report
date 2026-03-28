import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-transparent text-white font-sans">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-[280px]">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content */}
                <main className="pt-[80px] p-4 sm:p-6 lg:p-10 flex-1 w-full max-w-[1600px] mx-auto relative z-10">
                    <Outlet />
                </main>

                {/* Background Decor */}
                <div className="fixed top-1/4 -right-[10%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(91,238,252,0.03)_0%,transparent_70%)] z-0 pointer-events-none" />
                <div className="fixed bottom-0 -left-[5%] w-[30%] h-[30%] bg-[radial-gradient(circle,rgba(22,246,134,0.02)_0%,transparent_70%)] z-0 pointer-events-none" />
            </div>
        </div>
    );
};
