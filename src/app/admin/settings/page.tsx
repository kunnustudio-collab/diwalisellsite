'use client';

import React, { useState, useEffect } from 'react';
import { SiteSettings } from '@/types';
import { INITIAL_SETTINGS } from '@/lib/constants';
import {
  Settings,
  Save,
  CheckCircle,
  Truck,
  CreditCard,
  Shield,
  Phone,
  Bot,
  AlertCircle,
  Lock,
} from 'lucide-react';

export default function AdminSettingsPage() {
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
        setAlertMsg({ type: 'success', text: 'Store settings successfully saved!' });
      } else {
        setAlertMsg({ type: 'error', text: data.error || 'Failed to update settings.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Error saving settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-stone-500">Loading store settings...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-maroon-950">
            Store Settings & Logistics
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure delivery charges, payment options, customer contact info, and legal policies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-gold-300" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {alertMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-2 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)}>✕</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Logistics & Delivery */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gold-200">
            <Truck className="w-4 h-4 text-gold-700" />
            <h3 className="font-serif font-bold text-base text-maroon-950">
              1. Shipping & Free Delivery Threshold
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Standard Shipping Charge (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.shipping_charge}
                onChange={(e) =>
                  setSettings({ ...settings, shipping_charge: Number(e.target.value) })
                }
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Free Express Shipping Order Threshold (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.free_shipping_threshold}
                onChange={(e) =>
                  setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })
                }
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">
                Orders equal or exceeding this value will automatically receive FREE delivery.
              </span>
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gold-200">
            <CreditCard className="w-4 h-4 text-gold-700" />
            <h3 className="font-serif font-bold text-base text-maroon-950">
              2. Payment Gateways
            </h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.cod_enabled}
                onChange={(e) => setSettings({ ...settings, cod_enabled: e.target.checked })}
                className="rounded text-maroon-900 focus:ring-maroon-900"
              />
              <div>
                <span className="font-bold text-xs text-stone-900 block">
                  Enable Cash on Delivery (COD)
                </span>
                <span className="text-[11px] text-stone-500">
                  Allows customers to pay in cash or UPI to the courier upon delivery.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.razorpay_enabled}
                onChange={(e) => setSettings({ ...settings, razorpay_enabled: e.target.checked })}
                className="rounded text-maroon-900 focus:ring-maroon-900"
              />
              <div>
                <span className="font-bold text-xs text-stone-900 block">
                  Enable Razorpay Online Payments (UPI, Cards & NetBanking)
                </span>
                <span className="text-[11px] text-stone-500">
                  Requires NEXT_PUBLIC_RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env.local.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gold-200">
            <Phone className="w-4 h-4 text-gold-700" />
            <h3 className="font-serif font-bold text-base text-maroon-950">
              3. Store Support & Contact Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Support Phone / WhatsApp
              </label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Registered Physical Address
            </label>
            <input
              type="text"
              value={settings.contact_address}
              onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
              className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900"
            />
          </div>
        </div>

        {/* Customer Policies */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gold-200">
            <Shield className="w-4 h-4 text-gold-700" />
            <h3 className="font-serif font-bold text-base text-maroon-950">
              4. Store Policies & Guarantees
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Shipping Policy
              </label>
              <textarea
                rows={3}
                value={settings.policies.shipping}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    policies: { ...settings.policies, shipping: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl p-3 text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Returns & Replacement Policy
              </label>
              <textarea
                rows={3}
                value={settings.policies.returns}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    policies: { ...settings.policies, returns: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl p-3 text-xs text-stone-900"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-gold-300" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
