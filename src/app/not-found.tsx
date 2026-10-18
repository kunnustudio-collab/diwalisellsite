import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { DiyaFlame } from '@/components/ui/DiyaFlame';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-3xl border border-gold-300 shadow-festive space-y-6">
        
        <div className="flex justify-center">
          <DiyaFlame className="w-12 h-14" />
        </div>

        <div className="space-y-2">
          <span className="font-serif font-black text-6xl text-maroon-950 block">404</span>
          <h1 className="font-serif font-bold text-2xl text-maroon-900">
            Page Not Found
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            The festive celebration page you are looking for has been moved, renamed, or is unavailable.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Festive Shop</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
