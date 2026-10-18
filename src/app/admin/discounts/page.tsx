'use client';

import React, { useState, useEffect } from 'react';
import { Discount, DiscountType } from '@/types';
import {
  Percent,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Check,
  X,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit / Create Modal State
  const [editingDiscount, setEditingDiscount] = useState<Partial<Discount> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDiscounts = async () => {
    try {
      const res = await fetch('/api/admin/discounts');
      const data = await res.json();
      if (data.discounts) {
        setDiscounts(data.discounts);
      }
    } catch (err) {
      console.error('Error fetching discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleToggleActive = async (discount: Discount) => {
    try {
      const res = await fetch(`/api/admin/discounts/${discount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !discount.is_active }),
      });
      if (res.ok) {
        setAlertMsg({
          type: 'success',
          text: `Coupon "${discount.code}" is now ${!discount.is_active ? 'Active' : 'Disabled'}.`,
        });
        fetchDiscounts();
      }
    } catch (e) {
      setAlertMsg({ type: 'error', text: 'Failed to toggle discount state.' });
    }
  };

  const handleDelete = async (discount: Discount) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${discount.code}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/discounts/${discount.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAlertMsg({ type: 'success', text: `Coupon "${discount.code}" was deleted.` });
        fetchDiscounts();
      } else {
        setAlertMsg({ type: 'error', text: 'Failed to delete coupon.' });
      }
    } catch (e) {
      setAlertMsg({ type: 'error', text: 'Network error deleting coupon.' });
    }
  };

  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiscount) return;

    setIsSaving(true);
    setAlertMsg(null);

    try {
      const url = isNew ? '/api/admin/discounts' : `/api/admin/discounts/${editingDiscount.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDiscount),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAlertMsg({
          type: 'success',
          text: `Coupon "${data.discount.code}" successfully saved!`,
        });
        setEditingDiscount(null);
        fetchDiscounts();
      } else {
        setAlertMsg({ type: 'error', text: data.error || 'Failed to save coupon.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Error saving coupon.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-maroon-950">
            Advanced Discount Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Create and schedule percentage or flat rupee promo codes with cart thresholds, caps, and redemption limits.
          </p>
        </div>

        <button
          onClick={() => {
            setIsNew(true);
            setEditingDiscount({
              code: 'DIWALI2026',
              type: 'percentage',
              value: 15,
              min_cart_value: 999,
              max_discount_amount: 500,
              max_redemptions: 200,
              is_active: true,
              starts_at: new Date().toISOString().split('T')[0],
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              allow_combine: false,
            });
          }}
          className="px-5 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-gold-300" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Alert Notification */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-2 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="font-bold hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {/* Discounts Table */}
      <div className="bg-white rounded-3xl border border-gold-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase font-bold text-stone-500 bg-ivory-50 border-b border-gold-200">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount Value</th>
                <th className="py-3.5 px-4">Min. Cart Value</th>
                <th className="py-3.5 px-4">Max Cap</th>
                <th className="py-3.5 px-4">Usage & Limits</th>
                <th className="py-3.5 px-4">Validity Period</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-100">
              {discounts.map((d) => {
                const now = new Date();
                const isExpired = d.expires_at && new Date(d.expires_at) < now;

                return (
                  <tr key={d.id} className="hover:bg-ivory-50/60 transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gold-600" />
                        <span className="font-mono font-bold text-sm text-maroon-900 uppercase">
                          {d.code}
                        </span>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {d.type === 'percentage' ? `${d.value}% OFF` : `₹${d.value} Flat OFF`}
                    </td>

                    {/* Min Cart */}
                    <td className="py-3.5 px-4 text-stone-700">
                      ₹{d.min_cart_value.toLocaleString('en-IN')}
                    </td>

                    {/* Max Cap */}
                    <td className="py-3.5 px-4 text-stone-700">
                      {d.max_discount_amount ? `₹${d.max_discount_amount}` : 'No limit'}
                    </td>

                    {/* Usage */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-900">{d.current_redemptions}</span>
                      <span className="text-stone-400">
                        {d.max_redemptions ? ` / ${d.max_redemptions} uses` : ' / unlimited'}
                      </span>
                    </td>

                    {/* Validity */}
                    <td className="py-3.5 px-4 text-stone-600 text-[11px]">
                      {d.expires_at ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>Expires: {new Date(d.expires_at).toLocaleDateString('en-IN')}</span>
                        </div>
                      ) : (
                        <span>No expiry</span>
                      )}
                      {isExpired && (
                        <span className="text-rose-600 font-bold block text-[10px]">Expired</span>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(d)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                          d.is_active && !isExpired
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {d.is_active && !isExpired ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setIsNew(false);
                            setEditingDiscount(d);
                          }}
                          className="p-1.5 rounded-lg bg-ivory-100 hover:bg-gold-100 text-maroon-900 transition-colors"
                          title="Edit Coupon"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(d)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {editingDiscount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-maroon-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gold-300 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-gold-200">
              <h3 className="font-serif font-bold text-xl text-maroon-950">
                {isNew ? 'Create New Discount Coupon' : `Edit Coupon: ${editingDiscount.code}`}
              </h3>
              <button
                onClick={() => setEditingDiscount(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDiscount.code || ''}
                    onChange={(e) =>
                      setEditingDiscount({
                        ...editingDiscount,
                        code: e.target.value.toUpperCase().trim(),
                      })
                    }
                    placeholder="e.g. DIWALI15"
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={editingDiscount.type || 'percentage'}
                    onChange={(e) =>
                      setEditingDiscount({
                        ...editingDiscount,
                        type: e.target.value as DiscountType,
                      })
                    }
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Rupee Discount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingDiscount.value ?? ''}
                    onChange={(e) =>
                      setEditingDiscount({
                        ...editingDiscount,
                        value: Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 15 or 100"
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Min. Cart Value (₹) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingDiscount.min_cart_value ?? 0}
                    onChange={(e) =>
                      setEditingDiscount({
                        ...editingDiscount,
                        min_cart_value: Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 999"
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingDiscount.max_discount_amount ?? ''}
                    onChange={(e) =>
                      setEditingDiscount({
                        ...editingDiscount,
                        max_discount_amount: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="e.g. 500"
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* Dates & Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Max Global Redemptions
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingDiscount.max_redemptions ?? ''}
                    onChange={(e) =>
                      setEditingDiscount({
                        ...editingDiscount,
                        max_redemptions: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="e.g. 500 uses"
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={
                      editingDiscount.expires_at
                        ? editingDiscount.expires_at.split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setEditingDiscount({
                        ...editingDiscount,
                        expires_at: e.target.value ? `${e.target.value}T23:59:59.000Z` : null,
                      })
                    }
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={editingDiscount.is_active ?? true}
                    onChange={(e) =>
                      setEditingDiscount({
                        ...editingDiscount,
                        is_active: e.target.checked,
                      })
                    }
                    className="rounded text-maroon-900 focus:ring-maroon-900"
                  />
                  <span>Active & Ready for Checkout</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gold-200">
                <button
                  type="button"
                  onClick={() => setEditingDiscount(null)}
                  className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving Coupon...' : 'Save Discount Coupon'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
