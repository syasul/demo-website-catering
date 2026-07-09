import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBlobProps {
    color: string;   // e.g. '#AD8A4E'
    size?: number;   // diameter in px, default 400
    x?: string;      // CSS position left/right, e.g. '-10%'
    y?: string;      // CSS position top/bottom
    delay?: number;  // animation delay in seconds
    opacity?: number;
}

export const AnimatedBlob: React.FC<AnimatedBlobProps> = ({
    color,
    size = 400,
    x = '0%',
    y = '0%',
    delay = 0,
    opacity = 0.25,
}) => {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: size,
                height: size,
                background: color,
                filter: `blur(${Math.floor(size * 0.2)}px)`,
                opacity,
                left: x,
                top: y,
                zIndex: 0,
            }}
            animate={{ y: [0, 30, 0], scale: [1, 1.05, 1] }}
            transition={{
                duration: 8,
                delay,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
            }}
        />
    );
};
