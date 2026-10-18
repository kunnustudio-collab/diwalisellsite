'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteSettings } from '@/types';
import { Flame, Mail, Phone, MapPin, Send, Check, ShieldCheck, Heart } from 'lucide-react';

interface Props {
  settings: SiteSettings;
}

export function Footer({ settings }: Props) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [policyModal, setPolicyModal] = useState<{ title: string; content: string } | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const openPolicy = (type: 'shipping' | 'returns' | 'privacy' | 'terms') => {
    const titles = {
      shipping: 'Shipping & Delivery Policy',
      returns: 'Returns & 48-Hour Replacement Policy',
      privacy: 'Privacy & Security Policy',
      terms: 'Terms of Service',
    };
    setPolicyModal({
      title: titles[type],
      content: settings.policies[type] || 'Standard festive policy applies.',
    });
  };

  return (
    <footer className="bg-gradient-to-b from-maroon-950 via-maroon-900 to-maroon-950 text-gold-100 border-t border-gold-500/30">
      
      {/* Top Festive Newsletter Section */}
      <div className="border-b border-gold-500/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-gold-400">
            Join the DeepAura Festive Circle
          </span>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-ivory-50">
            Get Exclusive Diwali Discounts & Decor Inspiration
          </h3>
          <p className="text-xs sm:text-sm text-gold-200/80 max-w-xl mx-auto">
            Subscribe to receive secret flash coupon codes and early access to handcrafted festival items.
          </p>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2 pt-2">
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 bg-maroon-900/80 border border-gold-400/40 rounded-full px-4 py-2.5 text-xs text-white placeholder-gold-300/60 focus:outline-none focus:ring-1 focus:ring-gold-400 shadow-inner"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-gold-500 hover:bg-gold-400 text-maroon-950 font-bold text-xs tracking-wide shadow-festive transition-colors flex items-center gap-1.5"
            >
              {subscribed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Joined!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Subscribe</span>
                </>
              )}
            </button>
          </form>
          {subscribed && (
            <p className="text-xs text-emerald-300 font-medium animate-fade-in">
              ✨ Welcome! Use code <strong className="text-gold-200">DIWALI15</strong> on your first order.
            </p>
          )}
        </div>
      </div>

      {/* Main Links Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Brand Information */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center">
              <Flame className="w-4 h-4 text-gold-400" />
            </div>
            <span className="font-serif font-bold text-xl text-ivory-50 tracking-tight">
              {settings.brand_name}
            </span>
          </div>
          <p className="text-xs text-gold-200/80 leading-relaxed max-w-sm">
            {settings.brand_tagline}. Dedicated to bringing authentic, radiant Indian festival aesthetics into modern homes with uncompromising craftsmanship.
          </p>

          <div className="space-y-2 text-xs text-gold-200/90 pt-2">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-gold-400 shrink-0" />
              <span>{settings.contact_phone} (Mon–Sat, 9AM–9PM)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-gold-400 shrink-0" />
              <span>{settings.contact_email}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <span>{settings.contact_address}</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-gold-300 uppercase tracking-wider">
            Festive Categories
          </h4>
          <ul className="space-y-2 text-xs text-gold-100/80">
            <li>
              <a href="/#products" className="hover:text-gold-300 transition-colors">
                Diwali String Lights
              </a>
            </li>
            <li>
              <a href="/#products" className="hover:text-gold-300 transition-colors">
                Artisanal Brass Diyas
              </a>
            </li>
            <li>
              <a href="/#products" className="hover:text-gold-300 transition-colors">
                Royal Entrance Torans
              </a>
            </li>
            <li>
              <a href="/#products" className="hover:text-gold-300 transition-colors">
                Puja Thalis & Garlands
              </a>
            </li>
            <li>
              <a href="/#products" className="hover:text-gold-300 transition-colors">
                Festival Gifting Hampers
              </a>
            </li>
          </ul>
        </div>

        {/* Customer Care & Policies */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-gold-300 uppercase tracking-wider">
            Policies & Care
          </h4>
          <ul className="space-y-2 text-xs text-gold-100/80">
            <li>
              <button
                onClick={() => openPolicy('shipping')}
                className="hover:text-gold-300 transition-colors text-left"
              >
                Shipping & Delivery
              </button>
            </li>
            <li>
              <button
                onClick={() => openPolicy('returns')}
                className="hover:text-gold-300 transition-colors text-left"
              >
                48h Damage Replacement
              </button>
            </li>
            <li>
              <button
                onClick={() => openPolicy('privacy')}
                className="hover:text-gold-300 transition-colors text-left"
              >
                Privacy & Data Security
              </button>
            </li>
            <li>
              <button
                onClick={() => openPolicy('terms')}
                className="hover:text-gold-300 transition-colors text-left"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <Link href="/order-status" className="hover:text-gold-300 transition-colors text-left text-gold-400 font-semibold">
                Track Your Order →
              </Link>
            </li>
          </ul>
        </div>

        {/* Social & Admin Portal */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-gold-300 uppercase tracking-wider">
            Connect With Us
          </h4>
          <div className="flex flex-col space-y-2 text-xs text-gold-100/80">
            <a
              href={settings.social_links.instagram}
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold-300 transition-colors"
            >
              Instagram @deepauradecor
            </a>
            <a
              href={settings.social_links.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold-300 transition-colors"
            >
              WhatsApp Support
            </a>
            <a
              href={settings.social_links.facebook}
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold-300 transition-colors"
            >
              Facebook Page
            </a>
            <a
              href={settings.social_links.youtube}
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold-300 transition-colors"
            >
              YouTube Decor Guides
            </a>
            <div className="pt-3 border-t border-gold-500/20">
              <Link
                href="/admin/login"
                className="text-[11px] text-gold-400 hover:text-gold-200 font-medium underline underline-offset-4"
              >
                Owner / Admin Portal Login
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gold-500/20 py-6 px-4 text-center text-xs text-gold-200/60 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-3">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-gold-400" />
          <span>100% Genuine Handcrafted Festive Catalog • Made for India</span>
        </div>
        <p>
          © {new Date().getFullYear()} {settings.brand_name}. All rights reserved.
        </p>
      </div>

      {/* Policy Modal */}
      {policyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-stone-900 shadow-2xl border border-gold-300 space-y-4">
            <h3 className="font-serif font-bold text-xl text-maroon-950">
              {policyModal.title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-h-60 overflow-y-auto">
              {policyModal.content}
            </p>
            <div className="pt-2 text-right">
              <button
                onClick={() => setPolicyModal(null)}
                className="px-6 py-2 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors"
              >
                Close Policy
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
