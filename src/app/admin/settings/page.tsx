'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  AlertCircle,
  Lock,
  QrCode,
  Upload,
  Trash2,
  Plus,
  Copy,
  ExternalLink,
  Zap,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // UPI State
  const [newSecondaryVpa, setNewSecondaryVpa] = useState('');
  const [uploadingQr, setUploadingQr] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings(d.settings);
      })
      .catch((e) => console.error('Error fetching settings:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'qr');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setSettings((prev) => ({ ...prev, upi_qr_image_url: data.url }));
        setAlertMsg({ type: 'success', text: 'Custom UPI QR Code image uploaded successfully!' });
      } else {
        setAlertMsg({ type: 'error', text: data.error || 'QR image upload failed.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Network error uploading QR image.' });
    } finally {
      setUploadingQr(false);
    }
  };

  const handleAddSecondaryVpa = () => {
    const vpa = newSecondaryVpa.trim();
    if (!vpa) return;
    const current = settings.upi_secondary_vpas || [];
    if (current.includes(vpa)) {
      setAlertMsg({ type: 'error', text: 'This UPI ID is already added.' });
      return;
    }
    setSettings({
      ...settings,
      upi_secondary_vpas: [...current, vpa],
    });
    setNewSecondaryVpa('');
  };

  const handleRemoveSecondaryVpa = (index: number) => {
    const current = settings.upi_secondary_vpas || [];
    setSettings({
      ...settings,
      upi_secondary_vpas: current.filter((_, i) => i !== index),
    });
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
            Configure payment gateways, UPI IDs, custom QR codes, shipping thresholds, and customer policies.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
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

        {/* Payment Gateways Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gold-200">
            <CreditCard className="w-4 h-4 text-gold-700" />
            <h3 className="font-serif font-bold text-base text-maroon-950">
              2. Payment Gateway Controls (ON / OFF) & UPI Configuration
            </h3>
          </div>

          <div className="space-y-6">
            
            {/* Direct UPI Payments & QR Code Customization */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/60 via-gold-50/30 to-white border border-gold-300 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gold-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-maroon-900 text-gold-300 flex items-center justify-center font-bold text-xs shadow-sm">
                    UPI
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-stone-900">
                        Direct UPI & QR Code Payment Gateway
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Zero Gateway Surcharge
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500">
                      Customers pay directly via GPay, PhonePe, Paytm, CRED or scan QR and enter 12-digit UTR.
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
                  <input
                    type="checkbox"
                    checked={settings.upi_gateway_enabled ?? true}
                    onChange={(e) =>
                      setSettings({ ...settings, upi_gateway_enabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-maroon-900"></div>
                </label>
              </div>

              {(settings.upi_gateway_enabled ?? true) && (
                <div className="space-y-4 pt-1">
                  
                  {/* Primary UPI ID & Merchant Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Primary UPI ID (VPA) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. merchant@upi or 9876543210@paytm"
                        value={settings.upi_vpa || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, upi_vpa: e.target.value })
                        }
                        className="w-full bg-white border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono focus:ring-1 focus:ring-gold-500"
                      />
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        Your main bank UPI handle where customer payments are credited.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Merchant Account / Display Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DeepAura Festive Store"
                        value={settings.upi_merchant_name || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, upi_merchant_name: e.target.value })
                        }
                        className="w-full bg-white border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:ring-1 focus:ring-gold-500"
                      />
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        Business name displayed inside customer UPI apps upon payment initiation.
                      </span>
                    </div>
                  </div>

                  {/* Secondary / Additional UPI IDs */}
                  <div className="p-4 bg-white/90 rounded-2xl border border-gold-200/90 space-y-3">
                    <label className="block text-xs font-semibold text-stone-800">
                      Secondary / Backup UPI IDs (Optional)
                    </label>
                    <p className="text-[10px] text-stone-500 -mt-2">
                      Add additional UPI handles (e.g. PhonePe, GPay, Paytm) for customers who prefer specific payment apps.
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add another UPI ID (e.g. deepaura@okhdfcbank)"
                        value={newSecondaryVpa}
                        onChange={(e) => setNewSecondaryVpa(e.target.value)}
                        className="flex-1 bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddSecondaryVpa}
                        className="px-4 py-2 bg-maroon-900 text-gold-100 rounded-xl text-xs font-bold hover:bg-maroon-800 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add UPI</span>
                      </button>
                    </div>

                    {settings.upi_secondary_vpas && settings.upi_secondary_vpas.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {settings.upi_secondary_vpas.map((vpa, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ivory-100 border border-gold-200 text-xs font-mono text-stone-800"
                          >
                            <span>{vpa}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSecondaryVpa(idx)}
                              className="text-stone-400 hover:text-rose-600 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Custom QR Code Image Upload (PNG / JPG) */}
                  <div className="p-4 bg-white/90 rounded-2xl border border-gold-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-semibold text-stone-800">
                          Custom UPI QR Code Image (Upload PNG / JPG)
                        </label>
                        <span className="text-[10px] text-stone-500 block">
                          Upload your bank’s official QR code standee or poster (PNG / JPG format). If uploaded, customers will see this exact QR code image at checkout.
                        </span>
                      </div>
                      
                      <label className="px-4 py-2 bg-maroon-900 hover:bg-maroon-800 text-gold-100 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingQr ? 'Uploading...' : 'Upload QR Image'}</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={handleQrUpload}
                          disabled={uploadingQr}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {settings.upi_qr_image_url ? (
                      <div className="flex items-center gap-4 p-3 bg-ivory-50 rounded-xl border border-gold-300">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gold-300 bg-white shrink-0">
                          <Image
                            src={settings.upi_qr_image_url}
                            alt="Custom QR Code"
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs text-stone-900 block truncate">
                            Custom QR Code Active
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono block truncate">
                            {settings.upi_qr_image_url}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                            ✓ Currently displayed to customers at checkout
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, upi_qr_image_url: null })}
                          className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-ivory-50 rounded-xl border border-gold-200 text-xs text-stone-600 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-gold-700 shrink-0" />
                        <span>
                          No custom QR image uploaded. The checkout will automatically generate a dynamic vector QR code linked to your primary UPI ID (<strong>{settings.upi_vpa || 'deepaura@upi'}</strong>).
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Instructions for Customers */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Customer Payment Guidance / Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={settings.upi_instructions || ''}
                      onChange={(e) =>
                        setSettings({ ...settings, upi_instructions: e.target.value })
                      }
                      placeholder="Guidance shown to customers on checkout modal..."
                      className="w-full bg-white border border-gold-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </div>

                </div>
              )}
            </div>

            {/* YouPI-PG Gateway (Self-Hosted Sovereign Gateway) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gold-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gold-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-stone-900 text-gold-300 flex items-center justify-center font-bold text-xs">
                    YP
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-stone-900">
                        YouPI-PG Sovereign Server Integration (Webhook Automation)
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500">
                      Connect your self-hosted YouPI daemon process for automated SMS/Gmail bank credit verification.
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono focus:ring-1 focus:ring-gold-500"
                      />
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
                        className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono focus:ring-1 focus:ring-gold-500"
                      />
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
                        className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono focus:ring-1 focus:ring-gold-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-ivory-50 rounded-xl border border-gold-200 text-xs space-y-1">
                    <span className="font-semibold text-stone-700 block">
                      Webhook Delivery Endpoint URL:
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="text-maroon-900 font-mono font-bold text-[11px] bg-white px-2.5 py-1 rounded border border-gold-200 flex-1 truncate">
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
                  </div>
                </div>
              )}
            </div>

            {/* Cash on Delivery */}
            <div className="p-4 rounded-2xl border border-gold-200 hover:border-gold-300 transition-colors bg-white flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-stone-900 block">
                  Enable Cash on Delivery (COD)
                </span>
                <span className="text-[11px] text-stone-500">
                  Allows customers to pay in cash or UPI to the courier upon delivery at their doorstep.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cod_enabled}
                  onChange={(e) => setSettings({ ...settings, cod_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-maroon-900"></div>
              </label>
            </div>

            {/* Razorpay Online Payments */}
            <div className="p-4 rounded-2xl border border-gold-200 hover:border-gold-300 transition-colors bg-white flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-stone-900 block">
                  Enable Razorpay Online Payments (Cards & NetBanking)
                </span>
                <span className="text-[11px] text-stone-500">
                  Credit/Debit Cards & NetBanking. Requires NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.razorpay_enabled}
                  onChange={(e) => setSettings({ ...settings, razorpay_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-maroon-900"></div>
              </label>
            </div>

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
