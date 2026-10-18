'use client';

import React, { useState, useEffect } from 'react';
import { SiteSettings } from '@/types';
import { INITIAL_SETTINGS } from '@/lib/constants';
import {
  Globe,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layout,
  Megaphone,
  Image as ImageIcon,
  Shield,
  Share2,
} from 'lucide-react';

export default function AdminContentPage() {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings(d.settings);
      })
      .catch((e) => console.error('Error fetching settings:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setAlertMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ type: 'success', text: 'Storefront content successfully updated and published!' });
      } else {
        setAlertMsg({ type: 'error', text: data.error || 'Failed to update content.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Network error saving storefront content.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-stone-500">
        Loading storefront content editor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-maroon-950">
            Storefront Content & Visuals
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Customize announcements, hero banners, headlines, promotional offers, and section visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-gold-300" />
          <span>{isSaving ? 'Publishing Changes...' : 'Save & Publish Live'}</span>
        </button>
      </div>

      {alertMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-2 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="font-bold hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* 1. Brand Identity */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gold-200">
            <Sparkles className="w-4 h-4 text-gold-700" />
            <h3 className="font-serif font-bold text-base text-maroon-950">
              1. Brand Identity & Headline
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Storefront Brand Name *
              </label>
              <input
                type="text"
                required
                value={settings.brand_name}
                onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={settings.brand_tagline}
                onChange={(e) => setSettings({ ...settings, brand_tagline: e.target.value })}
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Announcement Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gold-200">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-gold-700" />
              <h3 className="font-serif font-bold text-base text-maroon-950">
                2. Festive Announcement Bar
              </h3>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcement_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, announcement_enabled: e.target.checked })
                }
                className="rounded text-maroon-900"
              />
              <span>Display Announcement Bar</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Banner Offer Text
              </label>
              <input
                type="text"
                value={settings.announcement_text}
                onChange={(e) =>
                  setSettings({ ...settings, announcement_text: e.target.value })
                }
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Optional Sale Countdown Target Date (ISO / Date)
              </label>
              <input
                type="datetime-local"
                value={
                  settings.announcement_countdown_date
                    ? settings.announcement_countdown_date.slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcement_countdown_date: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Hero Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gold-200">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-gold-700" />
              <h3 className="font-serif font-bold text-base text-maroon-950">
                3. Full-Width Diwali Hero Section
              </h3>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.hero_enabled}
                onChange={(e) => setSettings({ ...settings, hero_enabled: e.target.checked })}
                className="rounded text-maroon-900"
              />
              <span>Display Hero Section</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Hero Main Heading *
              </label>
              <input
                type="text"
                required
                value={settings.hero_heading}
                onChange={(e) => setSettings({ ...settings, hero_heading: e.target.value })}
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Hero Subheading / Description
              </label>
              <textarea
                rows={2}
                value={settings.hero_subheading}
                onChange={(e) => setSettings({ ...settings, hero_subheading: e.target.value })}
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Primary CTA Button Label
                </label>
                <input
                  type="text"
                  value={settings.hero_cta_primary_text}
                  onChange={(e) =>
                    setSettings({ ...settings, hero_cta_primary_text: e.target.value })
                  }
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Hero Image URL
                </label>
                <input
                  type="text"
                  value={settings.hero_image_url}
                  onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Festive Promo Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gold-200">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gold-700" />
              <h3 className="font-serif font-bold text-base text-maroon-950">
                4. Mid-Page Festive Promo Banner
              </h3>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.promo_banner_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, promo_banner_enabled: e.target.checked })
                }
                className="rounded text-maroon-900"
              />
              <span>Display Promo Banner</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Banner Heading
                </label>
                <input
                  type="text"
                  value={settings.promo_banner_heading}
                  onChange={(e) =>
                    setSettings({ ...settings, promo_banner_heading: e.target.value })
                  }
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Featured Coupon Code
                </label>
                <input
                  type="text"
                  value={settings.promo_banner_coupon}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      promo_banner_coupon: e.target.value.toUpperCase().trim(),
                    })
                  }
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Banner Description
              </label>
              <textarea
                rows={2}
                value={settings.promo_banner_description}
                onChange={(e) =>
                  setSettings({ ...settings, promo_banner_description: e.target.value })
                }
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl p-3 text-xs text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* 5. Section Visibility Toggles */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-maroon-950 pb-2 border-b border-gold-200">
            5. Storefront Section Visibility
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-stone-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_featured}
                onChange={(e) => setSettings({ ...settings, show_featured: e.target.checked })}
                className="rounded text-maroon-900"
              />
              <span>Bestseller Collection</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_reviews}
                onChange={(e) => setSettings({ ...settings, show_reviews: e.target.checked })}
                className="rounded text-maroon-900"
              />
              <span>Customer Reviews</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_faqs}
                onChange={(e) => setSettings({ ...settings, show_faqs: e.target.checked })}
                className="rounded text-maroon-900"
              />
              <span>FAQ Accordion</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-gold-300" />
            <span>{isSaving ? 'Publishing Changes...' : 'Save & Publish Live'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
