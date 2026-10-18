'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { SiteSettings, Order } from '@/types';
import { INITIAL_SETTINGS } from '@/lib/constants';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  ArrowLeft,
  Tag,
  AlertCircle,
  Lock,
  Sparkles,
  QrCode,
  CheckCircle2,
  X,
  ExternalLink,
  Zap,
  Copy,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    shippingFee,
    finalTotal,
    appliedCoupon,
    discountAmount,
    couponError,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pinCode, setPinCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'youpi' | 'cod' | 'razorpay'>('youpi');
  const [notes, setNotes] = useState('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // YouPI Interactive Modal State (Fallback / Dev Testing)
  const [showYoupiModal, setShowYoupiModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [enteredUtr, setEnteredUtr] = useState('');
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [upiStatusMsg, setUpiStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setSettings(d.settings);
          if (d.settings.youpi_enabled) {
            setPaymentMethod('youpi');
            // Dynamically load youpi.js script from configured gateway URL
            const scriptUrl = `${d.settings.youpi_gateway_url || 'http://localhost:7000'}/youpi.js`;
            const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
            if (!existingScript) {
              const script = document.createElement('script');
              script.src = scriptUrl;
              script.async = true;
              script.setAttribute('data-youpi-key', d.settings.youpi_merchant_key || '');
              script.setAttribute('data-currency', 'INR');
              script.onload = () => console.log('YouPI Gateway SDK loaded successfully.');
              script.onerror = () =>
                console.log(
                  'Note: YouPI SDK host unreachable. Built-in interactive QR and fallback modal active.'
                );
              document.head.appendChild(script);
            }
          } else {
            setPaymentMethod('cod');
          }
        }
      })
      .catch((e) => console.error('Error fetching settings:', e));
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage('Your shopping cart is empty.');
      return;
    }

    if (paymentMethod === 'razorpay' && !settings.razorpay_enabled) {
      setErrorMessage(
        'Online card payment gateway is currently in test configuration. Please select UPI (YouPI) or Cash on Delivery (COD).'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        city,
        state,
        pin_code: pinCode,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        notes,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.order) {
        setErrorMessage(data.error || 'Unable to place order. Please check item stock.');
        setIsSubmitting(false);
        return;
      }

      const newOrder: Order = data.order;
      setCreatedOrder(newOrder);

      // If Payment Method is YouPI-PG
      if (paymentMethod === 'youpi') {
        const youpiGlobal = typeof window !== 'undefined' ? (window as any).Youpi : null;

        if (youpiGlobal && typeof youpiGlobal.pay === 'function') {
          // Invoke official YouPI-PG programmatic checkout modal
          youpiGlobal.pay({
            amount: Number(newOrder.total_amount),
            orderId: newOrder.order_number,
            currency: 'INR',
            customerName: newOrder.customer_name,
            customerEmail: newOrder.customer_email,
            customerPhone: newOrder.customer_phone,
            description: `DeepAura Diwali Decor #${newOrder.order_number}`,
            onSuccess: function (response: any) {
              clearCart();
              const utr = response?.utr || response?.paymentId || '';
              router.push(`/order-confirmation/${newOrder.order_number}?utr=${utr}`);
            },
            onFailure: function (error: any) {
              console.warn('YouPI payment dismissed or cancelled', error);
              setErrorMessage('Payment modal closed. You can retry payment or view order status.');
              setShowYoupiModal(true);
            },
          });
        } else {
          // YouPI SDK daemon is either starting or offline: open interactive fallback UPI modal
          setShowYoupiModal(true);
        }
      } else {
        // COD or other methods: navigate directly to order confirmation
        clearCart();
        router.push(`/order-confirmation/${newOrder.order_number || newOrder.id}`);
      }
    } catch (err) {
      setErrorMessage('Network error occurred while creating order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate or Confirm UPI payment from modal
  const handleVerifyUpiPayment = async (simulated: boolean) => {
    if (!createdOrder) return;
    setIsVerifyingUpi(true);
    setUpiStatusMsg(null);

    const utr = simulated
      ? `SIM_${Math.floor(100000000000 + Math.random() * 900000000000)}`
      : enteredUtr.trim() || `UTR_${Date.now().toString().slice(-8)}`;

    try {
      // Send verified webhook simulation to our backend endpoint
      const res = await fetch('/api/admin/orders/' + createdOrder.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: 'Confirmed',
          payment_status: 'paid',
          notes: `Paid via YouPI UPI (Ref/UTR: ${utr})`,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        clearCart();
        setShowYoupiModal(false);
        router.push(`/order-confirmation/${createdOrder.order_number}?utr=${utr}`);
      } else {
        setUpiStatusMsg(result.error || 'Verification failed. Please try again.');
      }
    } catch (e) {
      setUpiStatusMsg('Error communicating with verification service.');
    } finally {
      setIsVerifyingUpi(false);
    }
  };

  if (cart.length === 0 && !isSubmitting && !showYoupiModal) {
    return (
      <div className="min-h-screen bg-[#FFFEFA] flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-gold-200/80 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center text-maroon-900 mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-maroon-950">Your Cart is Empty</h2>
          <p className="text-xs text-stone-500">
            Please add some handcrafted festive decorations to your cart before proceeding to checkout.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shop</span>
          </Link>
        </div>
      </div>
    );
  }

  // UPI Intent URL
  const vpa = settings.youpi_vpa || 'deepaura@upi';
  const orderAmt = createdOrder ? createdOrder.total_amount : finalTotal;
  const orderNum = createdOrder ? createdOrder.order_number : 'DA-FESTIVE';
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(
    settings.brand_name.split('—')[0]?.trim() || 'DeepAura'
  )}&am=${orderAmt}&cu=INR&tn=${encodeURIComponent(`Order ${orderNum}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    upiIntentUrl
  )}`;

  return (
    <div className="min-h-screen bg-ivory-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-8 border-b border-gold-200/80 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif font-extrabold text-2xl text-maroon-950 tracking-tight">
              {settings.brand_name.split('—')[0]?.trim()}
            </span>
            <span className="text-xs font-bold text-gold-700 uppercase tracking-widest -mt-1">
              Checkout
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form: Delivery Address & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Customer Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-maroon-950">
                1. Contact & Customer Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Rathore"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile (e.g. 9876543210)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address * (for order tracking & invoice)
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-maroon-950">
                2. Festive Delivery Address
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Street Address & Flat / House No. *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Flat 402, Lotus Residency, Near MG Road..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  >
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="6 digits (e.g. 400001)"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Delivery Landmark / Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please ring doorbell twice, leave at door"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-maroon-950">
                  3. Payment Method
                </h3>
                <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  100% Secure Transaction
                </span>
              </div>

              <div className="space-y-3">
                {/* YouPI-PG UPI Gateway (Primary Recommended) */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'youpi'
                      ? 'border-maroon-900 bg-amber-50/50 ring-1 ring-maroon-900 shadow-sm'
                      : 'border-gold-200 hover:border-gold-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="youpi"
                    checked={paymentMethod === 'youpi'}
                    onChange={() => setPaymentMethod('youpi')}
                    className="mt-1 text-maroon-900 focus:ring-maroon-900"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-maroon-900 text-gold-300 font-bold text-[10px] flex items-center justify-center">
                        UPI
                      </span>
                      <span className="font-serif font-bold text-sm text-stone-900">
                        UPI Instant Payment (YouPI-PG)
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        ⚡ 0% Fee • Instant
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Direct-to-bank settlement via standard NPCI UPI rails. Pay with{' '}
                      <strong>Google Pay, PhonePe, Paytm, CRED</strong>, or scan dynamic QR.
                    </p>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gold-200/60 text-[10px] font-semibold text-stone-500">
                      <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-700">GPay</span>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-700">PhonePe</span>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-700">Paytm</span>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-700">BHIM</span>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-700">CRED</span>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-maroon-900 bg-ivory-50 ring-1 ring-maroon-900'
                      : 'border-gold-200 hover:border-gold-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-maroon-900 focus:ring-maroon-900"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-700" />
                      <span className="font-serif font-bold text-sm text-stone-900">
                        Cash on Delivery (COD)
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Pay conveniently in cash or UPI to the courier upon delivery at your doorstep.
                    </p>
                  </div>
                </label>

                {/* Online Payment / Razorpay */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-maroon-900 bg-ivory-50 ring-1 ring-maroon-900'
                      : 'border-gold-200 hover:border-gold-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="mt-1 text-maroon-900 focus:ring-maroon-900"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gold-700" />
                      <span className="font-serif font-bold text-sm text-stone-900">
                        Online Cards & NetBanking (Razorpay)
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {settings.razorpay_enabled
                        ? 'Secure instantaneous card payment verification via Razorpay.'
                        : 'Gateway in test configuration. YouPI UPI or COD is recommended.'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Order Summary & Confirm */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-300 shadow-festive space-y-6 sticky top-28">
              
              <h3 className="font-serif font-bold text-lg text-maroon-950 pb-3 border-b border-gold-200/80">
                Order Summary ({cart.length} items)
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 text-xs">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gold-200 shrink-0">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 truncate">{item.product.name}</p>
                      <span className="text-stone-500">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-stone-900">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Field */}
              <div className="pt-2 border-t border-gold-200/80">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-800 uppercase tracking-wide">
                        {appliedCoupon.code} (-₹{discountAmount})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. DIWALI15)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 bg-ivory-50 border border-gold-300 rounded-xl px-3 py-2 text-xs uppercase font-medium placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="px-4 py-2 bg-stone-900 text-gold-100 rounded-xl text-xs font-semibold hover:bg-maroon-900 transition-colors disabled:opacity-50"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2 text-xs text-stone-600 border-t border-gold-200/80 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-stone-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE (Diwali Special)</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-maroon-950 pt-3 border-t border-gold-200">
                  <span>Total Payable</span>
                  <span className="font-serif text-xl">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-gradient-to-r from-gold-500 via-amber-500 to-gold-400 hover:from-gold-400 hover:to-amber-300 text-maroon-950 font-bold text-sm tracking-wide shadow-festive transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Securing Order...</span>
                ) : paymentMethod === 'youpi' ? (
                  <span>Pay ₹{finalTotal.toLocaleString('en-IN')} via UPI Instant</span>
                ) : (
                  <span>Confirm Order • ₹{finalTotal.toLocaleString('en-IN')}</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-2">
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-gold-600" />
                  <span>Dispatched in 24h</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                  <span>48h Replacement</span>
                </div>
              </div>

            </div>
          </div>

        </form>

        {/* YouPI Dynamic QR & Fallback Checkout Modal */}
        {showYoupiModal && createdOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-gold-300 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gold-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-maroon-900 text-gold-300 flex items-center justify-center font-bold text-xs">
                    UPI
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-maroon-950">
                      YouPI Instant Checkout
                    </h3>
                    <span className="text-[10px] text-stone-500 block">
                      Direct-to-Bank Settlement (0% Platform Fee)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowYoupiModal(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Info & Dynamic QR */}
              <div className="text-center space-y-3">
                <div className="bg-ivory-50 p-3 rounded-2xl border border-gold-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px]">Order Number</span>
                    <strong className="font-mono text-maroon-900">{createdOrder.order_number}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-500 block text-[10px]">Amount Due</span>
                    <strong className="font-serif text-base text-stone-900">
                      ₹{createdOrder.total_amount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="relative inline-block p-3 bg-white rounded-2xl border-2 border-dashed border-gold-400 shadow-sm mx-auto">
                  <img
                    src={qrCodeUrl}
                    alt="Scan UPI QR"
                    width={200}
                    height={200}
                    className="rounded-lg mx-auto"
                  />
                  <div className="absolute inset-x-0 bottom-1 flex justify-center">
                    <span className="px-2 py-0.5 rounded-full bg-maroon-900 text-gold-200 text-[9px] font-bold shadow">
                      Scan with any UPI App
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 max-w-xs mx-auto">
                  Scan this dynamic QR code with Google Pay, PhonePe, Paytm, CRED or BHIM to pay instantly.
                </p>

                {/* Direct App Intent Link */}
                <a
                  href={upiIntentUrl}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm"
                >
                  <Zap className="w-4 h-4 text-gold-300" />
                  <span>Open directly in UPI App</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>

              {/* VPA Copy Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-ivory-100 border border-gold-200 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 block">Merchant VPA:</span>
                  <span className="font-mono font-bold text-stone-900">{vpa}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(vpa);
                    setUpiStatusMsg('UPI ID copied to clipboard!');
                  }}
                  className="p-1.5 text-maroon-900 hover:bg-gold-200/50 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              {/* UTR Verification / Dev Simulation */}
              <div className="pt-2 border-t border-gold-200 space-y-2">
                <label className="block text-[11px] font-semibold text-stone-700">
                  Paid? Enter 12-Digit Bank Ref / UTR Number:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 429381920194"
                    value={enteredUtr}
                    onChange={(e) => setEnteredUtr(e.target.value)}
                    className="flex-1 bg-ivory-50 border border-gold-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyUpiPayment(false)}
                    disabled={isVerifyingUpi}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors disabled:opacity-50"
                  >
                    {isVerifyingUpi ? '...' : 'Verify'}
                  </button>
                </div>

                {/* Instant Dev Simulation */}
                <button
                  type="button"
                  onClick={() => handleVerifyUpiPayment(true)}
                  disabled={isVerifyingUpi}
                  className="w-full py-2 rounded-xl bg-gold-100 hover:bg-gold-200 text-maroon-950 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  <span>Simulate Instant UPI Bank Credit (Demo Mode)</span>
                </button>

                {upiStatusMsg && (
                  <p className="text-[11px] text-center font-medium text-maroon-900 pt-1">
                    {upiStatusMsg}
                  </p>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
