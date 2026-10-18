'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function DiyaFlame({ className = 'w-6 h-8' }: { className?: string }) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Outer Glow */}
      <div className="absolute -inset-1 bg-amber-400/30 rounded-full blur-md animate-pulse-glow" />

      {/* Diya Clay Base */}
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Flame */}
        <motion.g
          animate={{
            scale: [1, 1.05, 0.98, 1.03, 1],
            rotate: [-1, 1.5, -0.8, 1, 0],
            y: [0, -1, 0.5, -0.5, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '50% 65%' }}
        >
          {/* Flame outer yellow */}
          <path
            d="M50 10C50 10 32 36 32 55C32 68 40 76 50 76C60 76 68 68 68 55C68 36 50 10 50 10Z"
            fill="url(#flameOuter)"
          />
          {/* Flame inner core bright */}
          <path
            d="M50 25C50 25 38 43 38 56C38 64 43 70 50 70C57 70 62 64 62 56C62 43 50 25 50 25Z"
            fill="url(#flameInner)"
          />
          {/* Core white highlight */}
          <ellipse cx="50" cy="58" rx="5" ry="8" fill="#FFFBEB" />
        </motion.g>

        {/* Diya Clay Oil Bowl */}
        <path
          d="M12 72C12 72 25 102 50 102C75 102 88 72 88 72C88 72 82 76 50 76C18 76 12 72 12 72Z"
          fill="url(#clayGradient)"
        />
        {/* Brass Rim */}
        <ellipse cx="50" cy="74" rx="38" ry="4" fill="url(#brassRim)" />

        <defs>
          <radialGradient id="flameOuter" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="45%" stopColor="#FF9F1C" />
            <stop offset="90%" stopColor="#E71D36" />
          </radialGradient>
          <radialGradient id="flameInner" cx="50%" cy="50%" r="40%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFE494" />
            <stop offset="100%" stopColor="#F48C06" />
          </radialGradient>
          <linearGradient id="clayGradient" x1="12" y1="72" x2="88" y2="102" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8C2D19" />
            <stop offset="0.5" stopColor="#B34424" />
            <stop offset="1" stopColor="#5E1B0E" />
          </linearGradient>
          <linearGradient id="brassRim" x1="12" y1="74" x2="88" y2="74" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4AF37" />
            <stop offset="0.5" stopColor="#FBE49B" />
            <stop offset="1" stopColor="#B89426" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
