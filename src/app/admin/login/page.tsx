'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@deepaura.com');
  const [password, setPassword] = useState('DeepAura@Festive2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin');
      } else {
        setError(data.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-maroon-950 via-maroon-900 to-maroon-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-2 border-gold-400/40 space-y-6">
        
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-maroon-900 text-gold-300 flex items-center justify-center mx-auto border-2 border-gold-400 shadow-festive">
            <Flame className="w-7 h-7 text-gold-400" />
          </div>
          <h1 className="font-serif font-extrabold text-2xl text-maroon-950">
            DeepAura Admin Portal
          </h1>
          <p className="text-xs text-stone-500">
            Secure management console for products, orders, discounts & festive content.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium"
              />
              <Mail className="w-4 h-4 text-gold-600 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ivory-50 border border-gold-300 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium"
              />
              <Lock className="w-4 h-4 text-gold-600 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-maroon-900 to-maroon-800 text-gold-100 font-bold text-xs tracking-wider uppercase hover:from-maroon-800 hover:to-maroon-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-gold-300" />
              </>
            )}
          </button>
        </form>

        {/* Development Helper Box */}
        <div className="p-3.5 rounded-xl bg-gold-50 border border-gold-200 text-stone-700 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-maroon-900">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-700" />
            <span>Development Mode Credentials</span>
          </div>
          <p className="text-stone-600">
            Default Email: <strong className="font-mono text-stone-900">admin@deepaura.com</strong>
          </p>
          <p className="text-stone-600">
            Default Password: <strong className="font-mono text-stone-900">DeepAura@Festive2026</strong>
          </p>
          <p className="text-[10px] text-stone-500 pt-1">
            Configurable in <code className="bg-gold-200/60 px-1 py-0.5 rounded font-mono">.env.local</code> via <code className="bg-gold-200/60 px-1 py-0.5 rounded font-mono">INITIAL_ADMIN_PASSWORD</code>.
          </p>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-stone-500 hover:text-maroon-900 underline underline-offset-4"
          >
            ← Return to Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}
