'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  Package,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => console.error('Error fetching dashboard:', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-gold-400 border-t-maroon-900 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 mt-2">Loading store analytics...</p>
      </div>
    );
  }

  const { metrics, topSelling, lowStockProducts, recentOrders, chartData } = data || {};

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-maroon-950">
            Diwali Store Overview
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time sales, order fulfillment, and inventory analytics for DeepAura.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm"
          >
            Manage Products ({metrics?.activeProductsCount || 0}/10 Active)
          </Link>
          <Link
            href="/admin/discounts"
            className="px-4 py-2 rounded-full bg-white border border-gold-400 text-maroon-950 text-xs font-bold hover:bg-gold-50 transition-colors shadow-sm"
          >
            Manage Discounts
          </Link>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Confirmed Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-gold-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 block">Confirmed Revenue</span>
            <span className="font-serif font-extrabold text-2xl text-maroon-950 mt-1 block">
              ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
              From {metrics?.totalOrders || 0} customer orders
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white border border-gold-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 block">Total Orders</span>
            <span className="font-serif font-extrabold text-2xl text-stone-900 mt-1 block">
              {metrics?.totalOrders || 0}
            </span>
            <span className="text-[10px] text-stone-500 font-medium mt-1 block">
              {metrics?.deliveredOrders || 0} Delivered
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-maroon-100 text-maroon-900 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-2xl bg-white border border-gold-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 block">Pending Fulfillment</span>
            <span className="font-serif font-extrabold text-2xl text-amber-900 mt-1 block">
              {metrics?.pendingOrders || 0}
            </span>
            <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
              Awaiting packing / courier
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Storefront Active Products (Strict 10 Max Limit) */}
        <div className="p-5 rounded-2xl bg-white border border-gold-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 block">Active Products</span>
            <span className="font-serif font-extrabold text-2xl text-stone-900 mt-1 block">
              {metrics?.activeProductsCount || 0} / 10
            </span>
            <span className="text-[10px] text-stone-500 font-medium mt-1 block">
              Enforced maximum 10 active
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Grid: Sales Activity Chart & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales Breakdown / Recent Activity */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gold-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-600" />
              <h3 className="font-serif font-bold text-base text-maroon-950">
                Daily Sales Revenue Breakdown
              </h3>
            </div>
            <span className="text-xs text-stone-400">Actual Order Records</span>
          </div>

          {chartData && chartData.length > 0 ? (
            <div className="space-y-3 pt-2">
              {chartData.map((d: any) => {
                const max = Math.max(...chartData.map((c: any) => c.revenue), 1);
                const pct = (d.revenue / max) * 100;
                return (
                  <div key={d.date} className="flex items-center gap-4 text-xs">
                    <span className="w-24 font-mono text-stone-600">{d.date}</span>
                    <div className="flex-1 bg-ivory-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-gold-500 h-3 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-bold text-stone-900 w-20 text-right">
                      ₹{d.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-stone-400">
              No orders placed yet. Place your first test checkout to populate the sales chart!
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-serif font-bold text-base text-maroon-950">
              Inventory Watchlist (≤ 20)
            </h3>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {lowStockProducts && lowStockProducts.length > 0 ? (
              lowStockProducts.map((p: any) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-ivory-50 border border-gold-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-gold-200 shrink-0">
                      <Image src={p.image_url} alt="" fill className="object-cover" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-stone-900 truncate">{p.name}</p>
                      <span className="text-[10px] text-stone-500">{p.sku}</span>
                    </div>
                  </div>
                  <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full text-[11px] shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500 py-6 text-center">
                All 10 products have healthy inventory levels.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Best-Performing Products based on Actual Orders */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-lg text-maroon-950">
          Best-Performing Products (From Actual Order Records)
        </h3>

        {topSelling && topSelling.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topSelling.map((prod: any) => (
              <div
                key={prod.id}
                className="p-4 rounded-2xl bg-ivory-50 border border-gold-200/70 text-xs space-y-2"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gold-200">
                  <Image src={prod.image} alt="" fill className="object-cover" />
                </div>
                <h4 className="font-bold text-stone-900 truncate">{prod.name}</h4>
                <div className="flex justify-between text-stone-600 pt-1 border-t border-gold-200/60">
                  <span>Units Sold:</span>
                  <strong className="text-stone-900">{prod.quantity}</strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Revenue:</span>
                  <strong className="text-maroon-900">₹{prod.revenue.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500 py-4 text-center">
            No product sales data recorded yet. Top-sellers will automatically calculate as customer orders arrive.
          </p>
        )}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gold-200/80">
          <h3 className="font-serif font-bold text-lg text-maroon-950">
            Recent Customer Orders
          </h3>
          <Link
            href="/admin/orders"
            className="text-xs text-maroon-900 hover:text-gold-700 font-bold flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-bold text-stone-500 bg-ivory-50 border-b border-gold-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-maroon-900">
                      {order.order_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{order.customer_name}</div>
                      <div className="text-[10px] text-stone-400">{order.customer_phone}</div>
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold">
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        {order.order_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-stone-900">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-stone-500">
            No orders have been submitted yet.
          </div>
        )}
      </div>

    </div>
  );
}
