'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { X, Star, ShoppingBag, Check, ShieldCheck, Truck } from 'lucide-react';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: Props) {
  const { addToCart } = useCart();
  const [selectedImg, setSelectedImg] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const currentImage = selectedImg || product.image_url;
  const allImages = [product.image_url, ...(product.additional_images || [])];
  const hasDiscount = Boolean(product.original_price && product.original_price > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-maroon-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gold-300 overflow-hidden max-h-[90vh] flex flex-col md:flex-row"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 hover:text-maroon-900 shadow-sm"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Product Images */}
          <div className="w-full md:w-1/2 p-6 bg-ivory-100/60 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-gold-300/60 shadow-sm bg-white">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {hasDiscount && (
                <span className="absolute top-3 left-3 bg-maroon-700 text-gold-100 font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1 max-w-full">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      currentImage === img ? 'border-maroon-800 scale-105' : 'border-gold-300 opacity-70'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details & Purchase */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Rating */}
              <div className="flex items-center gap-1.5 text-xs text-gold-600 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.rating || 5)
                          ? 'fill-current text-gold-500'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-stone-800">{product.rating || 4.8}</span>
                <span className="text-stone-500">({product.reviews_count || 12} reviews)</span>
              </div>

              {/* Title */}
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-maroon-950 mb-2">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-serif font-extrabold text-2xl text-maroon-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-stone-400 line-through">
                    ₹{product.original_price!.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  In Stock ({product.stock} available)
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Specifications snippet */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-ivory-50 p-3 rounded-xl border border-gold-200/60 mb-6 text-xs space-y-1">
                  {Object.entries(product.specifications).slice(0, 3).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium text-stone-500">{key}:</span>
                      <span className="font-semibold text-stone-800">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t border-gold-200/60">
              <div className="flex items-center gap-4">
                {/* Quantity selector */}
                <div className="flex items-center border border-gold-300 rounded-full overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-1.5 text-stone-600 hover:bg-gold-50 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-sm font-semibold text-stone-800 min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3.5 py-1.5 text-stone-600 hover:bg-gold-50 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-3 px-6 rounded-full font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-maroon-900 to-maroon-800 text-gold-100 hover:from-maroon-800 hover:to-maroon-700'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Festive Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-gold-300" />
                      <span>Add to Cart • ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* View Full Product Details Link */}
              <div className="text-center">
                <Link
                  href={`/product/${product.slug || product.id}`}
                  onClick={onClose}
                  className="text-xs text-maroon-800 hover:text-gold-700 font-semibold underline underline-offset-4"
                >
                  View full specifications & customer reviews →
                </Link>
              </div>

              {/* Trust micro badges */}
              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2">
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-gold-600" />
                  <span>Free shipping above ₹999</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                  <span>48h Replacement Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
