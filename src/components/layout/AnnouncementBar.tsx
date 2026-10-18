'use client';

import React, { useEffect, useState } from 'react';
import { SiteSettings } from '@/types';
import { Sparkles, Clock } from 'lucide-react';

interface Props {
  settings: SiteSettings;
}

export function AnnouncementBar({ settings }: Props) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!settings.announcement_countdown_date) return;

    const target = new Date(settings.announcement_countdown_date).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [settings.announcement_countdown_date]);

  if (!settings.announcement_enabled) return null;

  return (
    <div className="relative bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-900 text-gold-100 text-xs sm:text-sm py-2 px-4 shadow-sm z-40 border-b border-gold-500/20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center">
        <div className="flex items-center gap-1.5 font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
          <span>{settings.announcement_text}</span>
        </div>

        {timeLeft && (
          <div className="flex items-center gap-2 bg-maroon-950/60 px-2.5 py-0.5 rounded-full border border-gold-400/30 text-xs text-gold-200">
            <Clock className="w-3 h-3 text-gold-400" />
            <span className="font-mono font-semibold">
              Sale Ends: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
