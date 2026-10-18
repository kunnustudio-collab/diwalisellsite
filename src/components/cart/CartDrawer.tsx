'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { X, Trash2, ArrowRight, Tag, Sparkles, ShoppingBag, Check } from 'lucide-react';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    freeShippingThreshold,
    finalTotal,
    appliedCoupon,
    discountAmount,
    couponError,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setIsApplying(true);
    await applyCoupon(couponCodeInput.trim());
    setIsApplying(false);
  };

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-maroon-950/60 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-gold-300"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gold-200/80 bg-ivory-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-maroon-900 text-gold-300 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">Festive Cart</h3>
                  <span className="text-xs text-stone-500">
                    {cart.length} {cart.length === 1 ? 'item' : 'items'} selected
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-stone-400 hover:text-maroon-900 rounded-full hover:bg-gold-50 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="bg-gold-50/70 p-3.5 border-b border-gold-200/60 text-xs">
              {amountToFreeShipping > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-stone-700 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                    <span>
                      Add <strong className="text-maroon-900 font-bold">₹{amountToFreeShipping}</strong> more to unlock <strong className="text-emerald-700">FREE Express Delivery</strong>!
                    </span>
                  </p>
                  <div className="w-full bg-gold-200/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-gold-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Yay! Your order qualifies for FREE Express Delivery!</span>
                </p>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-ivory-100 flex items-center justify-center text-gold-600 border border-gold-200">
                    <ShoppingBag className="w-8 h-8 opacity-60" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-stone-800">Your Festive Cart is Empty</h4>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                      Bring light and prosperity into your home this Diwali with our handcrafted lamps, brass diyas and garlands.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 shadow-md transition-colors"
                  >
                    Start Shopping →
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 rounded-xl bg-ivory-50/60 border border-gold-200/70"
                  >
                    {/* Item Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gold-200 shrink-0 bg-white">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.product.slug || item.product.id}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-serif font-bold text-xs sm:text-sm text-stone-900 hover:text-maroon-900 line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="font-serif font-bold text-sm text-maroon-950">
                          ₹{item.product.price}
                        </span>
                        {item.product.original_price && (
                          <span className="text-[11px] text-stone-400 line-through">
                            ₹{item.product.original_price}
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-gold-300 rounded-md bg-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs font-bold text-stone-600 hover:bg-gold-50"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="px-2 py-0.5 text-xs font-bold text-stone-600 hover:bg-gold-50 disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-bold text-stone-700">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout Area */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-gold-200/80 bg-ivory-50 space-y-4">
                
                {/* Coupon Code Section */}
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-emerald-800 uppercase tracking-wide">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-emerald-700 ml-1.5">
                            (-₹{discountAmount})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Coupon code (e.g. DIWALI15)"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value)}
                          className="w-full bg-white border border-gold-300 rounded-lg py-2 pl-8 pr-3 text-xs uppercase font-medium placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                        <Tag className="w-3.5 h-3.5 text-gold-600 absolute left-2.5 top-2.5" />
                      </div>
                      <button
                        type="submit"
                        disabled={isApplying || !couponCodeInput.trim()}
                        className="px-4 py-2 bg-stone-900 hover:bg-maroon-900 text-gold-100 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                      >
                        {isApplying ? 'Applying...' : 'Apply'}
                      </button>
                    </form>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-rose-600 mt-1.5 font-medium">{couponError}</p>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="space-y-1.5 text-xs text-stone-600 border-t border-gold-200/60 pt-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-900">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Festive Coupon Discount</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-stone-900">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm sm:text-base font-bold text-maroon-950 pt-2 border-t border-gold-200">
                    <span>Total Amount</span>
                    <span className="font-serif">₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-900 text-gold-100 font-bold text-sm tracking-wide shadow-festive hover:from-maroon-800 hover:to-maroon-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-gold-300" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
