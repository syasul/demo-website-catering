import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'gold' | 'dark';
    glow?: boolean;
    hover?: boolean;
    as?: 'div' | 'section' | 'article';
    style?: React.CSSProperties;
    onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    variant = 'default',
    glow = false,
    hover = false,
    as: Tag = 'div',
    style,
    onClick,
}) => {
    // Map variants to css classes
    const variantClass = {
        default: 'glass-card',
        gold:    'glass-card-gold',
        dark:    'glass-card-dark',
    }[variant];

    // Glow classes
    const glowClass = glow
        ? variant === 'gold'
            ? 'shadow-[0_0_32px_rgba(173,138,78,0.25)] border-gold/35'
            : 'shadow-[0_0_32px_rgba(255,255,255,0.08)] border-white/20'
        : '';

    // Framer motion tag mapping
    const motionTags = {
        div: motion.div,
        section: motion.section,
        article: motion.article,
    };
    const Component = motionTags[Tag] || motion.div;

    return (
        <Component
            className={`rounded-2xl border ${variantClass} ${glowClass} ${className}`}
            style={style}
            whileHover={hover ? {
                y: -5,
                boxShadow: variant === 'gold'
                    ? '0 12px 30px rgba(173, 138, 78, 0.35), 0 0 20px rgba(173, 138, 78, 0.2)'
                    : '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.05)',
                borderColor: variant === 'gold' ? 'rgba(173, 138, 78, 0.6)' : 'rgba(255, 255, 255, 0.25)'
            } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={onClick}
        >
            {children}
        </Component>
    );
};
