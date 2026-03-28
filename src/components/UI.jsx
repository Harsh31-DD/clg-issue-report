import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

/**
 * Toast Notification System
 */
const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 4000) => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), duration);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-premium-lg text-white pointer-events-auto min-w-[300px]"
                        >
                            <ToastIcon type={toast.type} />
                            <div className="flex-1 text-sm font-medium">{toast.message}</div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-white/30 hover:text-white transition-colors cursor-pointer p-1"
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
        case 'success': return <CheckCircle size={20} className="text-accent-green" />;
        case 'error': return <AlertCircle size={20} className="text-red-500" />;
        case 'warning': return <AlertCircle size={20} className="text-highlight-yellow" />;
        default: return <Info size={20} className="text-primary-cyan" />;
    }
};

/**
 * Premium Button component
 */
export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading,
    disabled,
    iconOnly = false,
    className = '',
    ...props
}) => {
    const variants = {
        primary: "bg-gradient-to-br from-primary-cyan to-accent-green text-bg-dark shadow-[0_4px_12px_rgba(91,238,252,0.2)]",
        secondary: "bg-white/[0.03] text-text-white border border-white/10 hover:bg-white/[0.08]",
        ghost: "bg-transparent text-white/40 hover:text-white hover:bg-white/5",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
    };

    const sizes = {
        sm: iconOnly ? "p-2 text-xs" : "px-4 py-2 text-xs",
        md: iconOnly ? "p-2.5 text-sm" : "px-6 py-2.5 text-sm",
        lg: iconOnly ? "p-3.5 text-base" : "px-8 py-3.5 text-base"
    };

    return (
        <motion.button
            whileHover={!disabled && !loading ? { y: -1 } : {}}
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
            className={`flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <Loader2 className="animate-spin" size={18} /> : children}
        </motion.button>
    );
};

/**
 * Premium Input component
 */
export const Input = ({ className = '', ...props }) => (
    <div className="w-full">
        <input
            {...props}
            className={`w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-3.5 text-white text-[14px] outline-none transition-all duration-300 focus:border-primary-cyan/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(91,238,252,0.05)] placeholder:text-white/20 ${className}`}
        />
    </div>
);

/**
 * Premium Glass Card
 */
export const GlassyCard = ({ children, className = '', hoverable = true }) => (
    <motion.div
        whileHover={hoverable ? { y: -4 } : {}}
        className={`glass-card ${className}`}
    >
        {children}
    </motion.div>
);

/**
 * Global Center Loading
 */
export const GlobalLoading = () => {
    return (
        <div className="fixed inset-0 bg-bg-dark flex items-center justify-center z-[10000]">
            <div className="flex flex-col items-center gap-6">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    className="w-12 h-12 border-2 border-primary-cyan/10 border-t-primary-cyan rounded-full shadow-[0_0_20px_rgba(91,238,252,0.2)]"
                />
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase"
                >
                    Loading System
                </motion.span>
            </div>
        </div>
    );
};

export const Badge = ({ children, variant = 'neutral' }) => {
    const variants = {
        neutral: "bg-white/5 text-white/40",
        success: "bg-accent-green/10 text-accent-green-500 hover:bg-accent-green/20",
        warning: "bg-highlight-yellow/10 text-highlight-yellow hover:bg-highlight-yellow/20",
        error: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
        primary: "bg-primary-cyan/10 text-primary-cyan hover:bg-primary-cyan/20",
        // Direct Status Mappings requested by user
        pending: "bg-[#EEE638]/10 text-[#EEE638] border border-[#EEE638]/20",       // Yellow
        noted: "bg-[#5BEEFC]/10 text-[#5BEEFC] border border-[#5BEEFC]/20",         // Blue
        in_progress: "bg-status-orange/10 text-status-orange border border-status-orange/20",   // Orange
        resolved: "bg-accent-green/10 text-accent-green border border-accent-green/20"       // Green
    };

    return (
        <span className={`px-2.5 py-0.5 rounded border border-transparent text-[10px] font-black uppercase tracking-widest ${variants[variant] || variants.neutral}`}>
            {children}
        </span>
    );
};
