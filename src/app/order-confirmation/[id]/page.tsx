'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Order } from '@/types';
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Calendar,
  ArrowRight,
  Printer,
  Sparkles,
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#9B1B30', '#E36414', '#FFD700'],
      });
    } catch (e) {
      // safe fallback
    }

    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.order) setOrder(d.order);
      })
      .catch((e) => console.error('Error loading order:', e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-gold-400 border-t-maroon-900 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-600">Retrieving order confirmation...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FFFEFA] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-gold-200/80 shadow-sm">
          <h2 className="font-serif font-bold text-xl text-stone-900">Order Not Found</h2>
          <p className="text-xs text-stone-500">
            We could not locate an order matching ID &quot;{id}&quot;.
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Estimated delivery calculation (3 business days ahead)
  const orderDate = new Date(order.created_at);
  const estDelivery = new Date(orderDate);
  estDelivery.setDate(orderDate.getDate() + 4);

  return (
    <div className="min-h-screen bg-ivory-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gold-300 shadow-festive text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 border border-gold-300 text-xs font-bold text-maroon-900 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Order Confirmed • Shubh Deepavali!</span>
          </div>

          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-maroon-950">
            Thank You, {order.customer_name}!
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
            Your festive decor order has been received and queued for handcrafted packing. A confirmation receipt has been sent to <strong className="text-stone-900">{order.customer_email}</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-stone-700">
            <div className="bg-ivory-100 px-4 py-2 rounded-full border border-gold-200">
              Order ID: <strong className="text-maroon-900 font-mono">{order.order_number}</strong>
            </div>
            <div className="bg-ivory-100 px-4 py-2 rounded-full border border-gold-200">
              Payment: <strong className="uppercase">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</strong>
            </div>
            <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Est. Delivery: {estDelivery.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-200/80 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-lg text-maroon-950 pb-3 border-b border-gold-200/60">
            Purchased Items Snapshot
          </h3>

          <div className="space-y-4">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-ivory-50/70 border border-gold-200/60 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gold-200 shrink-0 bg-white">
                    <Image src={item.product_image} alt="" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-sm">{item.product_name}</h4>
                    <span className="text-stone-500 font-mono text-[11px]">SKU: {item.product_sku}</span>
                    <span className="text-stone-600 block">Qty: {item.quantity} × ₹{item.unit_price}</span>
                  </div>
                </div>
                <span className="font-bold text-stone-900 text-sm">
                  ₹{item.total_price.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-gold-200/80 space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Applied ({order.coupon_code})</span>
                <span>-₹{order.discount_amount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-stone-900">
                {order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_fee}`}
              </span>
            </div>

            <div className="flex justify-between text-base font-bold text-maroon-950 pt-3 border-t border-gold-200">
              <span>Total Amount</span>
              <span className="font-serif text-lg">₹{order.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address & Status */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-200/80 shadow-sm space-y-4 text-xs">
          <h3 className="font-serif font-bold text-base text-maroon-950 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold-600" />
            <span>Delivery Destination</span>
          </h3>
          <div className="p-4 rounded-2xl bg-ivory-50 border border-gold-200/60 leading-relaxed text-stone-700">
            <p className="font-bold text-stone-900">{order.customer_name}</p>
            <p>{order.shipping_address}</p>
            <p>{order.city}, {order.state} — {order.pin_code}</p>
            <p className="text-stone-500 mt-1">Phone: +91 {order.customer_phone}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm text-center flex items-center justify-center gap-2"
          >
            <span>Continue Festive Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href={`/order-status/${order.order_number}`}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white border border-gold-400 text-maroon-950 text-xs font-bold hover:bg-gold-50 transition-colors shadow-sm text-center flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4 text-gold-700" />
            <span>Track Order Status</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-5 py-3 rounded-full border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>

      </div>
    </div>
  );
}
