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

          <div className="space-y-6">
            
            {/* YouPI-PG Sovereign Gateway */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-gold-50/40 to-white border border-gold-300 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gold-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-maroon-900 text-gold-300 flex items-center justify-center font-bold text-xs">
                    UPI
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-stone-900">
                        YouPI-PG Sovereign UPI Payment Gateway
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        0% Platform Fee
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500">
                      Direct-to-bank settlement via standard NPCI UPI rails. Open-source & self-hosted.
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
                  <input
                    type="checkbox"
                    checked={settings.youpi_enabled}
                    onChange={(e) => setSettings({ ...settings, youpi_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-maroon-900"></div>
                </label>
              </div>

              {settings.youpi_enabled && (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Gateway Base URL
                      </label>
                      <input
                        type="url"
                        placeholder="http://localhost:7000 or https://pay.yourdomain.com"
                        value={settings.youpi_gateway_url || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, youpi_gateway_url: e.target.value })
                        }
                        className="w-full bg-white border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono focus:ring-1 focus:ring-gold-500"
                      />
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        Host where your YouPI instance is running (serves <code>/youpi.js</code>).
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Merchant Public Key (<code>data-youpi-key</code>)
                      </label>
                      <input
                        type="text"
                        placeholder="yp_live_..."
                        value={settings.youpi_merchant_key || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, youpi_merchant_key: e.target.value })
                        }
                        className="w-full bg-white border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono focus:ring-1 focus:ring-gold-500"
                      />
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        Assigned merchant identifier from your YouPI dashboard.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Webhook HMAC-SHA256 Secret
                      </label>
                      <input
                        type="password"
                        placeholder="yp_sec_..."
                        value={settings.youpi_webhook_secret || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, youpi_webhook_secret: e.target.value })
                        }
                        className="w-full bg-white border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono focus:ring-1 focus:ring-gold-500"
                      />
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        Used to verify <code>X-Gateway-Signature: sha256=&lt;hex&gt;</code>.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Merchant UPI VPA (Direct Bank Destination)
                      </label>
                      <input
                        type="text"
                        placeholder="deepaura@upi"
                        value={settings.youpi_vpa || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, youpi_vpa: e.target.value })
                        }
                        className="w-full bg-white border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono focus:ring-1 focus:ring-gold-500"
                      />
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        Your direct bank UPI handle (GPay/PhonePe/BHIM/Bank ID).
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/90 rounded-xl border border-gold-200 text-xs space-y-1">
                    <span className="font-semibold text-stone-700 block">
                      Webhook Delivery Endpoint URL:
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="text-maroon-900 font-mono font-bold text-[11px] bg-ivory-100 px-2.5 py-1 rounded border border-gold-200 flex-1 truncate">
                        http://localhost:8080/api/webhooks/youpi
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/api/webhooks/youpi`;
                          navigator.clipboard.writeText(url);
                          setAlertMsg({ type: 'success', text: `Webhook URL copied: ${url}` });
                        }}
                        className="px-3 py-1 bg-maroon-900 text-gold-100 rounded-lg font-semibold text-[11px] hover:bg-maroon-800 transition-colors"
                      >
                        Copy URL
                      </button>
                    </div>
                    <span className="text-[10px] text-stone-500 block pt-1">
                      Configure this exact URL in your YouPI gateway settings. YouPI will dispatch cryptographic signed webhooks upon UPI bank credits.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Cash on Delivery */}
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl border border-gold-200 hover:border-gold-300 transition-colors bg-white">
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

            {/* Razorpay Online Payments */}
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl border border-gold-200 hover:border-gold-300 transition-colors bg-white">
              <input
                type="checkbox"
                checked={settings.razorpay_enabled}
                onChange={(e) => setSettings({ ...settings, razorpay_enabled: e.target.checked })}
                className="rounded text-maroon-900 focus:ring-maroon-900"
              />
              <div>
                <span className="font-bold text-xs text-stone-900 block">
                  Enable Razorpay Online Payments (Cards & NetBanking)
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
