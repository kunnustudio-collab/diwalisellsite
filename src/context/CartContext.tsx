'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem, Discount } from '@/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  // Coupon
  appliedCoupon: Discount | null;
  discountAmount: number;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  
  // Totals
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
  finalTotal: number;
  itemCount: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'deepaura_festive_cart_v1';
const WISHLIST_STORAGE_KEY = 'deepaura_festive_wishlist_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Discount | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Settings defaults
  const freeShippingThreshold = 999;
  const standardShipping = 99;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (e) {
      console.error('Failed to load storage data', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart, isInitialized]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist, isInitialized]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const initialQty = Math.min(product.stock, quantity);
        if (initialQty <= 0) return prev;
        return [...prev, { product, quantity: initialQty }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const clamped = Math.min(item.product.stock, quantity);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponError(null);
  };

  // Re-calculate coupon discount on cart change
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  useEffect(() => {
    if (appliedCoupon) {
      if (subtotal < appliedCoupon.min_cart_value) {
        setCouponError(
          `Cart total is now below minimum ₹${appliedCoupon.min_cart_value} for coupon "${appliedCoupon.code}".`
        );
        setDiscountAmount(0);
      } else {
        let calc = 0;
        if (appliedCoupon.type === 'percentage') {
          calc = (subtotal * appliedCoupon.value) / 100;
        } else {
          calc = appliedCoupon.value;
        }
        if (appliedCoupon.max_discount_amount && calc > appliedCoupon.max_discount_amount) {
          calc = appliedCoupon.max_discount_amount;
        }
        if (calc > subtotal) calc = subtotal;
        setDiscountAmount(Math.round(calc * 100) / 100);
        setCouponError(null);
      }
    } else {
      setDiscountAmount(0);
    }
  }, [subtotal, appliedCoupon]);

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.valid && data.discount) {
        setAppliedCoupon(data.discount);
        setDiscountAmount(data.discountAmount);
        setCouponError(null);
        return true;
      } else {
        setCouponError(data.message || 'Invalid discount coupon.');
        return false;
      }
    } catch (err) {
      setCouponError('Unable to validate coupon right now.');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponError(null);
  };

  const shippingFee = subtotal === 0 ? 0 : subtotal >= freeShippingThreshold ? 0 : standardShipping;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        discountAmount,
        couponError,
        applyCoupon,
        removeCoupon,
        subtotal,
        shippingFee,
        freeShippingThreshold,
        finalTotal,
        itemCount,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
