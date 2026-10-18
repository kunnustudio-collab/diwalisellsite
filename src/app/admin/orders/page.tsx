'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Order, OrderStatus } from '@/types';
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Printer,
  Truck,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Order for Status / Tracking Update Modal
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const q = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const s = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const res = await fetch(`/api/admin/orders?${q}${s}`);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleOpenUpdateModal = (order: Order) => {
    setUpdatingOrder(order);
    setNewStatus(order.order_status);
    setTrackingNumber(order.tracking_number || '');
    setCourierName(order.courier_name || 'Bluedart Express');
  };

  const handleSaveOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingOrder) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${updatingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: newStatus,
          tracking_number: trackingNumber.trim() || null,
          courier_name: courierName.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAlertMsg({
          type: 'success',
          text: `Order ${updatingOrder.order_number} status updated to ${newStatus}.`,
        });
        setUpdatingOrder(null);
        fetchOrders();
      } else {
        setAlertMsg({ type: 'error', text: data.error || 'Failed to update order status.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Error saving order update.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const exportToCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Status',
      'Payment Method',
      'Items Count',
      'Subtotal',
      'Discount',
      'Total Amount',
      'Tracking Number',
    ];

    const rows = orders.map((o) => [
      o.order_number,
      o.created_at,
      `"${o.customer_name}"`,
      o.customer_email,
      o.customer_phone,
      o.order_status,
      o.payment_method,
      o.items?.length || 0,
      o.subtotal,
      o.discount_amount,
      o.total_amount,
      o.tracking_number || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DeepAura_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-maroon-950">
            Order Fulfillment & Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track customer orders, manage statuses from Confirmation to Delivery, and assign AWB courier codes.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={orders.length === 0}
          className="px-5 py-2.5 rounded-full bg-white border border-gold-400 text-maroon-950 text-xs font-bold hover:bg-gold-50 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto disabled:opacity-40"
        >
          <Download className="w-4 h-4 text-gold-700" />
          <span>Export Orders (CSV)</span>
        </button>
      </div>

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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search Order ID, Name, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ivory-50 border border-gold-300 rounded-full py-2 pl-9 pr-4 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
          <Search className="w-4 h-4 text-gold-600 absolute left-3 top-2.5" />
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-stone-500 shrink-0">Status:</span>
          {['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter.toLowerCase() === st.toLowerCase()
                  ? 'bg-maroon-900 text-gold-100 shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gold-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase font-bold text-stone-500 bg-ivory-50 border-b border-gold-200">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-ivory-50/60 transition-colors">
                    
                    {/* ID & Date */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-maroon-900 block">
                        {order.order_number}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-900 block">
                        {order.customer_name}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        +91 {order.customer_phone}
                      </span>
                      <span className="text-[10px] text-stone-400 block truncate max-w-[120px]">
                        {order.customer_email}
                      </span>
                    </td>

                    {/* Destination */}
                    <td className="py-3.5 px-4">
                      <span className="text-stone-700 block truncate max-w-[140px]" title={order.shipping_address}>
                        {order.city}, {order.state}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        PIN: {order.pin_code}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-900">
                        {order.items?.length || 0} items
                      </span>
                      {order.items?.[0] && (
                        <span className="text-[10px] text-stone-500 block truncate max-w-[120px]">
                          {order.items[0].product_name}
                        </span>
                      )}
                    </td>

                    {/* Payment */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold uppercase text-[10px] block">
                        {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          order.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.order_status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.order_status === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.order_status === 'Processing'
                            ? 'bg-purple-100 text-purple-800'
                            : order.order_status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 text-right font-serif font-bold text-sm text-stone-900">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenUpdateModal(order)}
                          className="p-1.5 rounded-lg bg-ivory-100 hover:bg-gold-100 text-maroon-900 transition-colors"
                          title="Update Status & Tracking"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/orders/${order.order_number}/invoice`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status & Tracking Modal */}
      {updatingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-maroon-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-gold-300 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-gold-200">
              <div>
                <h3 className="font-serif font-bold text-lg text-maroon-950">
                  Update Order: {updatingOrder.order_number}
                </h3>
                <span className="text-xs text-stone-500">
                  Customer: {updatingOrder.customer_name}
                </span>
              </div>
              <button
                onClick={() => setUpdatingOrder(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOrderStatus} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Change Order Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                >
                  <option value="Pending">Pending (Received)</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing (Festive Packing)</option>
                  <option value="Shipped">Shipped (In Transit)</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Courier Partner Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bluedart / Delhivery / DTDC"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  AWB Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. BD987123456IN"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-mono font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gold-200">
                <button
                  type="button"
                  onClick={() => setUpdatingOrder(null)}
                  className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Update Status'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
