import React from 'react';
import { Outlet } from 'react-router-dom';
import { Win2KNavbar } from './Win2KNavbar';

export const PublicLayout = () => {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#008080',
            fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
        }}>
            <Win2KNavbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
};
