'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Order, SiteSettings } from '@/types';
import { INITIAL_SETTINGS } from '@/lib/constants';
import { Printer, ArrowLeft, Flame, ShieldCheck } from 'lucide-react';

export default function OrderInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/orders/${id}`).then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ])
      .then(([orderRes, settRes]) => {
        if (orderRes.order) setOrder(orderRes.order);
        if (settRes.settings) setSettings(settRes.settings);
      })
      .catch((err) => console.error('Error fetching invoice:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-stone-600 text-xs font-semibold">
        Generating tax invoice...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-stone-600 text-xs">
        Order not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 py-10 px-4 print:p-0 print:bg-white text-stone-900">
      
      {/* Print Controls Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => window.history.back()}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={() => window.print()}
          className="px-5 py-2 rounded-full bg-maroon-900 text-gold-100 font-bold text-xs hover:bg-maroon-800 transition-colors shadow-sm flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-gold-300" />
          <span>Print Tax Invoice</span>
        </button>
      </div>

      {/* Main Printable Sheet */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-lg border border-stone-200 print:shadow-none print:border-none print:p-0 space-y-8">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-stone-200 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-maroon-900 text-gold-300 flex items-center justify-center">
                <Flame className="w-4 h-4 text-gold-400" />
              </div>
              <h1 className="font-serif font-black text-2xl text-maroon-950 tracking-tight">
                {settings.brand_name.split('—')[0]?.trim()}
              </h1>
            </div>
            <p className="text-xs text-stone-500">{settings.brand_tagline}</p>
            <p className="text-[11px] text-stone-500 pt-1">{settings.contact_address}</p>
            <p className="text-[11px] text-stone-500">
              Email: {settings.contact_email} | Phone: {settings.contact_phone}
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className="font-serif font-bold text-lg text-stone-800 uppercase tracking-widest block">
              Tax Invoice
            </span>
            <p className="font-mono font-bold text-sm text-maroon-900">
              Invoice #{order.order_number}
            </p>
            <p className="text-xs text-stone-500">
              Date: {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-800 mt-1">
              Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
            </span>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-stone-400 uppercase tracking-wider block text-[10px]">
              Billed & Shipped To:
            </span>
            <p className="font-serif font-bold text-stone-900 text-sm">{order.customer_name}</p>
            <p className="text-stone-600">{order.shipping_address}</p>
            <p className="text-stone-600">{order.city}, {order.state} — {order.pin_code}</p>
            <p className="text-stone-600">Mobile: +91 {order.customer_phone}</p>
            <p className="text-stone-600">Email: {order.customer_email}</p>
          </div>

          <div className="space-y-1 text-right">
            <span className="font-bold text-stone-400 uppercase tracking-wider block text-[10px]">
              Fulfillment Status:
            </span>
            <p className="font-semibold text-stone-900">{order.order_status}</p>
            {order.courier_name && <p className="text-stone-600">Courier: {order.courier_name}</p>}
            {order.tracking_number && (
              <p className="font-mono text-stone-600">AWB: {order.tracking_number}</p>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 font-bold uppercase text-[10px] text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-4">Item Description</th>
                <th className="py-2.5 px-4">SKU</th>
                <th className="py-2.5 px-4 text-center">Qty</th>
                <th className="py-2.5 px-4 text-right">Unit Price</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 px-4 font-medium text-stone-900">{item.product_name}</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-stone-500">{item.product_sku}</td>
                  <td className="py-2.5 px-4 text-center">{item.quantity}</td>
                  <td className="py-2.5 px-4 text-right font-mono">₹{item.unit_price}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold">
                    ₹{item.total_price.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-64 space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold text-stone-900">
                ₹{order.subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.coupon_code}):</span>
                <span className="font-mono">-₹{order.discount_amount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Charges:</span>
              <span className="font-mono font-semibold text-stone-900">
                {order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_fee}`}
              </span>
            </div>

            <div className="flex justify-between text-base font-bold text-maroon-950 pt-2 border-t border-stone-200">
              <span>Grand Total:</span>
              <span className="font-mono">₹{order.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="border-t border-stone-200 pt-6 flex justify-between items-center text-[10px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-700" />
            <span>48-Hour Fragile Replacement Guarantee Included</span>
          </div>
          <span>Computer generated invoice. No physical signature required.</span>
        </div>

      </div>

    </div>
  );
}
