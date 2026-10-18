'use client';

import React from 'react';
import { SiteSettings } from '@/types';
import { Sparkles, ShieldCheck, ShoppingCart, Headphones } from 'lucide-react';

interface Props {
  settings: SiteSettings;
}

export function BenefitsStrip({ settings }: Props) {
  if (!settings.show_benefits) return null;

  const benefits = [
    {
      icon: Sparkles,
      title: 'Festive Collection',
      description: 'Handpicked handcrafted diyas, fairy lights, and auspicious decor.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Checkout',
      description: settings.cod_enabled
        ? 'Cash on Delivery & encrypted digital transactions across India.'
        : 'Encrypted safe digital payments.',
    },
    {
      icon: ShoppingCart,
      title: 'Easy Ordering',
      description: `Free delivery on orders above ₹${settings.free_shipping_threshold}. Dispatched within 24 hours.`,
    },
    {
      icon: Headphones,
      title: 'Customer Support',
      description: 'Dedicated festive care assistance via WhatsApp & Email.',
    },
  ];

  return (
    <section className="bg-ivory-100/70 border-b border-gold-500/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {benefits.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/70 border border-gold-200/60 shadow-sm hover:shadow-festive transition-shadow"
            >
              <div className="w-11 h-11 rounded-lg bg-maroon-900/10 border border-gold-400/40 flex items-center justify-center shrink-0 text-maroon-900">
                <Icon className="w-5 h-5 text-gold-700" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-stone-900 tracking-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
