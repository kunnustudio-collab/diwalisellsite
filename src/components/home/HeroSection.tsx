'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { SiteSettings } from '@/types';
import { DiyaFlame } from '@/components/ui/DiyaFlame';
import { GoldenParticles } from '@/components/ui/GoldenParticles';
import { Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  settings: SiteSettings;
  onExploreClick?: () => void;
}

export function HeroSection({ settings, onExploreClick }: Props) {
  if (!settings.hero_enabled) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-maroon-950 via-maroon-900 to-maroon-950 text-white min-h-[580px] sm:min-h-[640px] flex items-center border-b border-gold-500/20">
      {/* Floating Golden Particles */}
      <GoldenParticles count={24} />

      {/* Decorative Traditional Rangoli Radial Glow Pattern in Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-400 via-transparent to-transparent blur-2xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-7 text-center lg:text-left space-y-6"
          >
            {/* Festive Badge with Diya */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-maroon-800/80 border border-gold-400/40 shadow-diya text-xs sm:text-sm font-medium text-gold-200">
              <DiyaFlame className="w-4 h-5" />
              <span>Shubh Deepavali 2026 Collection</span>
              <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
            </div>

            {/* Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-ivory-50 leading-[1.15]">
              {settings.hero_heading}
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-gold-100/90 font-normal max-w-2xl leading-relaxed">
              {settings.hero_subheading}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href={settings.hero_cta_primary_link || '#products'}
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 text-maroon-950 font-bold text-sm tracking-wide shadow-festive hover:from-gold-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{settings.hero_cta_primary_text || 'Shop Festive Collection'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href={settings.hero_cta_secondary_link || '#featured'}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-gold-400/50 bg-maroon-900/60 hover:bg-maroon-800/80 text-gold-200 font-semibold text-sm transition-all text-center"
              >
                {settings.hero_cta_secondary_text || 'Explore Bestsellers'}
              </a>
            </div>

            {/* Authentic Trust Micro-proofs */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gold-200/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Ready Stock for Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>✦ Authentic Brass & Handcrafted Decor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>✦ Safe Fragile Delivery Guarantee</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual Collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Golden Aura Ring */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-gold-600 via-amber-400 to-saffron-500 rounded-3xl opacity-30 blur-xl animate-pulse-glow" />

              {/* Main Festive Feature Image */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-gold-400/40 shadow-2xl bg-maroon-900 aspect-square sm:aspect-[4/3] lg:aspect-square">
                <Image
                  src={settings.hero_image_url || 'https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=1200&q=80'}
                  alt="Diwali Decorative Lights and Brass Diyas"
                  fill
                  priority
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Subtle Image Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/80 via-transparent to-transparent" />

                {/* Floating Diya Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-maroon-950/90 backdrop-blur-md p-3.5 rounded-xl border border-gold-400/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DiyaFlame className="w-7 h-9" />
                    <div>
                      <h4 className="text-sm font-semibold text-gold-100">Handcrafted Artisanal Diyas</h4>
                      <p className="text-[11px] text-gold-300/80">Pure Brass & Terracotta Craft</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gold-400 bg-gold-400/10 px-2.5 py-1 rounded-full border border-gold-400/30">
                    From ₹499
                  </span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
