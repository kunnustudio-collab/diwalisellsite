'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Flame,
  LayoutDashboard,
  Package,
  Percent,
  ShoppingBag,
  MessageSquare,
  Globe,
  HelpCircle,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(!isLoginPage);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoginPage) return;

    fetch('/api/admin/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.admin) {
          setAdminUser(data.admin);
        }
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-gold-400 border-t-maroon-900 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-600">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products (Max 10)', href: '/admin/products', icon: Package },
    { name: 'Discounts & Coupons', href: '/admin/discounts', icon: Percent },
    { name: 'Order Management', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Reviews & AI Assist', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Storefront Content', href: '/admin/content', icon: Globe },
    { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
    { name: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-100/70 flex flex-col lg:flex-row text-stone-900 font-sans">
      
      {/* Mobile Top Navbar */}
      <div className="lg:hidden bg-maroon-950 text-gold-100 p-4 flex items-center justify-between border-b border-gold-500/20 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-maroon-900 flex items-center justify-center border border-gold-400">
            <Flame className="w-4 h-4 text-gold-400" />
          </div>
          <span className="font-serif font-bold text-lg text-ivory-50">DeepAura Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg bg-maroon-900 text-gold-200"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-maroon-950 text-gold-100 flex flex-col justify-between border-r border-gold-500/30 transition-transform lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-gold-500/20 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-maroon-900 to-saffron-600 flex items-center justify-center border border-gold-400 shadow-festive">
              <Flame className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-ivory-50 leading-tight">
                DeepAura
              </h2>
              <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-widest block">
                Festive Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gold-500 text-maroon-950 shadow-md font-bold'
                      : 'text-gold-100/80 hover:bg-maroon-900 hover:text-gold-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-gold-500/20 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-maroon-900/60 hover:bg-maroon-900 text-gold-200 text-xs font-medium border border-gold-500/20 transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="px-2 pt-1 flex items-center justify-between text-xs text-gold-200/60">
            <div className="truncate">
              <span className="block font-semibold text-gold-200 truncate">{adminUser?.full_name || 'Admin'}</span>
              <span className="text-[10px] text-stone-400 truncate">{adminUser?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-rose-950 text-rose-400 hover:text-rose-300 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="hidden lg:flex bg-white border-b border-gold-200/80 h-16 px-8 items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-600" />
            <span className="font-serif font-bold text-sm text-stone-900">
              Diwali Season Store Management
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ivory-100 hover:bg-gold-100 text-maroon-950 border border-gold-300 text-xs font-bold transition-colors"
            >
              <span>View Customer Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-900 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        {/* Child Pages */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
