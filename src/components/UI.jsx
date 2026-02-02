import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

/**
 * Toast Notification System
 */
const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 4000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), duration);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'none'
            }}>
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            style={{
                                pointerEvents: 'auto',
                                minWidth: '300px',
                                background: 'rgba(15, 15, 20, 0.9)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '12px',
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                color: 'white'
                            }}
                        >
                            <ToastIcon type={toast.type} />
                            <div style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>{toast.message}</div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastIcon = ({ type }) => {
    switch (type) {
        case 'success': return <CheckCircle size={20} color="#10b981" />;
        case 'error': return <AlertCircle size={20} color="#ef4444" />;
        case 'warning': return <AlertCircle size={20} color="#f59e0b" />;
        default: return <Info size={20} color="#3b82f6" />;
    }
};

/**
 * Premium UI Components
 */

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading,
    style,
    ...props
}) => {
    const baseStyle = {
        padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 32px' : '10px 24px',
        borderRadius: '10px',
        fontWeight: '600',
        fontSize: size === 'sm' ? '14px' : '15px',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        border: 'none',
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        opacity: loading || props.disabled ? 0.6 : 1
    };

    const variants = {
        primary: {
            background: 'linear-gradient(135deg, #E65A1F, #FDA136)',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(230, 90, 31, 0.2)'
        },
        secondary: {
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: '#EDEDF3',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        outline: {
            backgroundColor: 'transparent',
            border: '1.5px solid #FDA136',
            color: '#FDA136'
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'rgba(237, 237, 243, 0.5)'
        }
    };

    const combinedStyle = { ...baseStyle, ...variants[variant], ...style };

    return (
        <button
            {...props}
            disabled={loading || props.disabled}
            style={combinedStyle}
            onMouseEnter={(e) => {
                if (!loading && !props.disabled) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    if (variant === 'primary') {
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(230, 90, 31, 0.35)';
                        e.currentTarget.style.filter = 'brightness(1.08)';
                    } else if (variant === 'secondary') {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    } else if (variant === 'outline') {
                        e.currentTarget.style.backgroundColor = 'rgba(253, 161, 54, 0.1)';
                    }
                }
            }}
            onMouseLeave={(e) => {
                if (!loading && !props.disabled) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.filter = 'none';
                    if (variant === 'primary') {
                        e.currentTarget.style.boxShadow = variants.primary.boxShadow;
                    } else if (variant === 'secondary') {
                        e.currentTarget.style.backgroundColor = variants.secondary.backgroundColor;
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    } else if (variant === 'outline') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }
                }
            }}
        >
            {loading ? (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid rgba(255,255,255,0.2)',
                        borderTop: '2px solid white',
                        borderRadius: '50%'
                    }}
                />
            ) : children}
        </button>
    );
};

export const Input = ({ style, ...props }) => (
    <input
        {...props}
        style={{
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '12px 14px',
            color: '#FFFFFF',
            fontSize: '15px',
            outline: 'none',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fontFamily: 'inherit',
            ...style
        }}
        onFocus={(e) => {
            e.currentTarget.style.borderColor = '#FDA136';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(253, 161, 54, 0.12)';
            e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
        }}
    />
);

export const GlassyCard = ({ children, style, hoverable = false }) => {
    return (
        <motion.div
            whileHover={hoverable ? {
                y: -4,
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderColor: 'rgba(253, 161, 54, 0.15)',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(253, 161, 54, 0.1)'
            } : {}}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                ...style
            }}
        >
            {children}
        </motion.div>
    );
};
