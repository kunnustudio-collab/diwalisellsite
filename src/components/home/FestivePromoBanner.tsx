'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SiteSettings } from '@/types';
import { useCart } from '@/context/CartContext';
import { Tag, Check, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  settings: SiteSettings;
}

export function FestivePromoBanner({ settings }: Props) {
  const { applyCoupon, setIsCartOpen } = useCart();
  const [copied, setCopied] = useState(false);

  if (!settings.promo_banner_enabled || !settings.show_promo_banner) return null;

  // Check date range if configured
  const now = new Date();
  if (settings.promo_start_date && new Date(settings.promo_start_date) > now) return null;
  if (settings.promo_end_date && new Date(settings.promo_end_date) < now) return null;

  const handleCopyAndApply = async () => {
    if (!settings.promo_banner_coupon) return;
    try {
      await navigator.clipboard.writeText(settings.promo_banner_coupon);
      setCopied(true);
      await applyCoupon(settings.promo_banner_coupon);
      setIsCartOpen(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-gold-400/40 bg-maroon-950 text-white min-h-[380px] flex items-center">
        
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0">
          <Image
            src={settings.promo_banner_image || 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1600&q=80'}
            alt="Diwali Festive Offer"
            fill
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-maroon-950 via-maroon-950/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 sm:p-12 md:p-16 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/20 border border-gold-400/50 text-gold-200 text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-gold-300" />
            <span>Limited Festive Promotion</span>
          </div>

          <h2 className="font-serif font-extrabold text-2xl sm:text-3xl md:text-4xl text-ivory-50 leading-tight">
            {settings.promo_banner_heading}
          </h2>

          <p className="text-sm sm:text-base text-gold-100/90 leading-relaxed">
            {settings.promo_banner_description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* Coupon Code Pill */}
            {settings.promo_banner_coupon && (
              <div className="flex items-center bg-white/10 backdrop-blur-md border border-gold-400/40 rounded-full pl-4 pr-1.5 py-1.5">
                <div className="flex items-center gap-1.5 mr-3">
                  <Tag className="w-4 h-4 text-gold-300" />
                  <span className="font-mono font-bold text-sm text-gold-200 uppercase tracking-wider">
                    {settings.promo_banner_coupon}
                  </span>
                </div>
                <button
                  onClick={handleCopyAndApply}
                  className="px-3.5 py-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-maroon-950 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-maroon-950" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <span>Copy Code</span>
                  )}
                </button>
              </div>
            )}

            {/* CTA Button */}
            <a
              href="#products"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 text-maroon-950 font-bold text-xs tracking-wide shadow-festive transition-all flex items-center gap-1.5 group"
            >
              <span>{settings.promo_banner_cta || 'Shop Offer Now'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
