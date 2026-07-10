import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'gold' | 'dark';
    glow?: boolean;
    hover?: boolean;
    as?: 'div' | 'section' | 'article';
    onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    variant = 'default',
    glow = false,
    hover = false,
    onClick,
}) => {
    return (
        <motion.div
            className={`rounded-2xl bg-white border border-gray-200 shadow-sm ${className}`}
            whileHover={hover ? { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};
