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
    const variantClass = {
        default: 'glass-card',
        gold: 'glass-card-gold',
        dark: 'glass-card-dark',
    }[variant];

    const glowStyle = glow
        ? { boxShadow: '0 0 32px rgba(173,138,78,0.2), 0 8px 32px rgba(0,0,0,0.35)' }
        : undefined;

    return (
        <motion.div
            className={`rounded-2xl ${variantClass} ${className}`}
            style={glowStyle}
            whileHover={hover ? { y: -4, boxShadow: '0 0 40px rgba(173,138,78,0.25), 0 16px 48px rgba(0,0,0,0.4)' } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};
