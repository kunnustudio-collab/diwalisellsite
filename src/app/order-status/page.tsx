'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, Search, ArrowLeft, Sparkles } from 'lucide-react';

export default function OrderStatusLookupPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    router.push(`/order-status/${orderNumber.trim()}`);
  };

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-gold-300 shadow-festive space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gold-100 text-maroon-900 flex items-center justify-center mx-auto border border-gold-300">
            <Truck className="w-7 h-7 text-gold-700" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-maroon-950">
            Track Festive Order
          </h1>
          <p className="text-xs text-stone-500">
            Enter your DeepAura Order Number to check live courier & dispatch status.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Order Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DA-2026-8941"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-4 py-3 text-sm font-mono text-stone-900 uppercase placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-maroon-900 text-gold-100 font-bold text-xs tracking-wider uppercase hover:bg-maroon-800 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-gold-300" />
            <span>Lookup Status</span>
          </button>
        </form>

        <div className="pt-4 border-t border-gold-200/60 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-maroon-900 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Festive Store</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
