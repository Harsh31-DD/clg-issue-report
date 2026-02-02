import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export const AuthLayout = ({ children }) => {
    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0B0B0B',
            backgroundImage: 'radial-gradient(at 0% 0%, rgba(122, 15, 26, 0.1) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(230, 90, 31, 0.05) 0px, transparent 50%)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorative Elements */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '5%',
                width: '400px',
                height: '400px',
                background: 'rgba(230, 90, 31, 0.03)',
                filter: 'blur(100px)',
                borderRadius: '50%',
                zIndex: 0
            }} />

            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '5%',
                width: '300px',
                height: '300px',
                background: 'rgba(122, 15, 26, 0.05)',
                filter: 'blur(80px)',
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
                        gap: '32px'
                    }}
                >
                    {/* Brand/Logo */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            background: 'linear-gradient(135deg, #E65A1F, #FDA136)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(230, 90, 31, 0.3)'
                        }}>
                            <Shield size={28} color="white" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{
                                color: 'white',
                                fontSize: '24px',
                                fontWeight: '800',
                                margin: 0,
                                fontFamily: 'Outfit'
                            }}>CIRTS</h2>
                            <p style={{
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '11px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                margin: '4px 0 0 0'
                            }}>College Incident Registry</p>
                        </div>
                    </div>

                    {/* Content Container */}
                    <div style={{ width: '100%' }}>
                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
