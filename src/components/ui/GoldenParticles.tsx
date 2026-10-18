'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function GoldenParticles({ count = 18 }: { count?: number }) {
  const shouldReduceMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles only on client to avoid hydration mismatch
    const items: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 5 + 4,
      delay: Math.random() * 3,
    }));
    setParticles(items);
  }, [count]);

  if (shouldReduceMotion || particles.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-500 shadow-diya"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          animate={{
            y: [0, -60, -120],
            x: [0, (p.id % 2 === 0 ? 1 : -1) * 20, 0],
            opacity: [0, 0.8, 0],
            scale: [0.8, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
