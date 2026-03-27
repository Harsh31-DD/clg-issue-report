import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--sp-6)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorative Elements */}
            <div style={{
                position: 'absolute',
                top: '5%',
                left: '-10%',
                width: '600px',
                height: '600px',
                background: 'rgba(91, 238, 252, 0.03)',
                filter: 'blur(120px)',
                borderRadius: '50%',
                zIndex: 0
            }} />

            <div style={{
                position: 'absolute',
                bottom: '5%',
                right: '-10%',
                width: '500px',
                height: '500px',
                background: 'rgba(22, 246, 134, 0.02)',
                filter: 'blur(100px)',
                borderRadius: '50%',
                zIndex: 0
            }} />

            <div style={{
                width: '100%',
                maxWidth: '480px',
                position: 'relative',
                zIndex: 1
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '40px'
                    }}
                >
                    {/* Brand/Logo */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'linear-gradient(135deg, #5BEEFC, #16F686)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 30px rgba(91, 238, 252, 0.2)'
                        }}>
                            <Shield size={32} color="white" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{
                                color: 'white',
                                fontSize: '28px',
                                fontWeight: '900',
                                margin: 0,
                                fontFamily: 'Outfit',
                                letterSpacing: '-0.02em'
                            }}>CIRTS</h2>
                            <p style={{
                                color: 'rgba(255,255,255,0.2)',
                                fontSize: '10px',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                letterSpacing: '0.4em',
                                margin: '8px 0 0 0'
                            }}>Issue Reporting System</p>
                        </div>
                    </div>

                    {/* Content Container */}
                    <div style={{ width: '100%' }}>
                        <Outlet />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
