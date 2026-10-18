'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Order, OrderStatus } from '@/types';
import {
  Truck,
  CheckCircle,
  Clock,
  Package,
  Home,
  MapPin,
  ArrowLeft,
  XCircle,
  Sparkles,
} from 'lucide-react';

export default function OrderStatusTrackingPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.order) setOrder(d.order);
      })
      .catch((e) => console.error('Error fetching order:', e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-gold-400 border-t-maroon-900 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-600">Retrieving order status...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-ivory-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gold-300 shadow-sm text-center space-y-4">
          <h2 className="font-serif font-bold text-xl text-stone-900">Order Not Found</h2>
          <p className="text-xs text-stone-500">
            No order found matching &quot;{id}&quot;. Please verify the order number.
          </p>
          <Link
            href="/order-status"
            className="px-6 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold inline-block"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  const steps: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'Confirmed', label: 'Order Confirmed', icon: CheckCircle },
    { status: 'Processing', label: 'Festive Packing', icon: Package },
    { status: 'Shipped', label: 'Handed to Courier', icon: Truck },
    { status: 'Delivered', label: 'Delivered to Home', icon: Home },
  ];

  const getStepIndex = (st: OrderStatus) => {
    switch (st) {
      case 'Pending':
        return 0;
      case 'Confirmed':
        return 0;
      case 'Processing':
        return 1;
      case 'Shipped':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.order_status);
  const isCancelled = order.order_status === 'Cancelled' || order.order_status === 'Refunded';

  return (
    <div className="min-h-screen bg-ivory-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-maroon-900 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>

          <span className="font-mono text-xs font-bold bg-maroon-900 text-gold-200 px-3 py-1 rounded-full border border-gold-400/40">
            {order.order_number}
          </span>
        </div>

        {/* Status Timeline Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gold-300 shadow-festive space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-700 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Tracking</span>
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-maroon-950">
              Order Status: <span className="text-gold-700">{order.order_status}</span>
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Ordered on {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Special banner for cancelled/refunded */}
          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <strong className="block font-bold">This order is {order.order_status}.</strong>
                <span>If you have questions regarding cancellation or refunds, contact support@deepaura.com.</span>
              </div>
            </div>
          ) : (
            /* Visual Stepper Timeline */
            <div className="py-4">
              <div className="grid grid-cols-4 gap-2 relative">
                
                {/* Horizontal Progress Line */}
                <div className="absolute top-5 left-6 right-6 h-1 bg-stone-200 -z-0">
                  <div
                    className="h-1 bg-gradient-to-r from-gold-500 to-amber-500 transition-all duration-700"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-maroon-900 text-gold-200 shadow-md ring-4 ring-gold-200'
                            : 'bg-white border-2 border-stone-300 text-stone-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs mt-2.5 font-semibold ${
                          isCurrent ? 'text-maroon-950 font-bold' : isCompleted ? 'text-stone-800' : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Courier & AWB Details */}
          {order.tracking_number && (
            <div className="p-4 rounded-2xl bg-ivory-50 border border-gold-300/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-gold-700 shrink-0" />
                <div>
                  <span className="font-bold text-stone-900 block">Courier: {order.courier_name || 'Bluedart Express'}</span>
                  <span className="text-stone-600 font-mono">AWB Tracking No: {order.tracking_number}</span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-[11px]">
                In Transit
              </span>
            </div>
          )}
        </div>

        {/* Order Items Snapshot */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-200/80 shadow-sm space-y-4 text-xs">
          <h3 className="font-serif font-bold text-base text-maroon-950 pb-2 border-b border-gold-200">
            Package Contents
          </h3>

          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-gold-100 last:border-none">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gold-200 shrink-0">
                    <Image src={item.product_image} alt="" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900">{item.product_name}</h4>
                    <span className="text-stone-500">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-stone-900">
                  ₹{item.total_price.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-200/80 shadow-sm space-y-2 text-xs">
          <h3 className="font-serif font-bold text-base text-maroon-950 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold-600" />
            <span>Delivering To</span>
          </h3>
          <div className="text-stone-700 leading-relaxed">
            <p className="font-bold text-stone-900">{order.customer_name}</p>
            <p>{order.shipping_address}, {order.city}, {order.state} — {order.pin_code}</p>
            <p className="text-stone-500 mt-1">Phone: +91 {order.customer_phone}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
