import React from 'react';
import { Outlet } from 'react-router-dom';

export const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-transparent text-white font-sans bg-[radial-gradient(at_0%_0%,rgba(22,246,134,0.03)_0px,transparent_50%),radial-gradient(at_100%_0%,rgba(91,238,252,0.05)_0px,transparent_50%)] bg-fixed overflow-hidden">
            <main>
                <Outlet />
            </main>
        </div>
    );
};
