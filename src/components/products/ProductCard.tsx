'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';

interface Props {
  product: Product;
  onQuickView: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: Props) {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isFavorited = wishlist.includes(product.id);
  const hasDiscount = Boolean(product.original_price && product.original_price > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 15;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };

  const fallbackImage =
    'https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className="group relative bg-white rounded-2xl border border-gold-200/70 shadow-sm hover:shadow-festive transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-100">
        <Link href={`/product/${product.slug || product.id}`}>
          <Image
            src={imgError ? fallbackImage : product.image_url || fallbackImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-maroon-700 text-gold-100 font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_featured && (
            <span className="bg-gold-500 text-maroon-950 font-bold text-[10px] px-2 py-0.5 rounded-full tracking-wide uppercase shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm z-10 ${
            isFavorited
              ? 'bg-maroon-700 text-white'
              : 'bg-white/80 text-stone-700 hover:bg-white hover:text-maroon-900'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Hover Button */}
        <button
          onClick={handleQuickViewClick}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-maroon-950/90 text-gold-100 hover:bg-maroon-900 text-xs font-semibold px-4 py-2 rounded-full shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all flex items-center gap-1.5 z-10"
        >
          <Eye className="w-3.5 h-3.5 text-gold-400" />
          <span>Quick View</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Rating & Stock */}
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1 text-gold-600">
              <Star className="w-3.5 h-3.5 fill-current text-gold-500" />
              <span className="font-bold text-stone-800">{product.rating || 4.8}</span>
              <span className="text-stone-600 font-medium">({product.reviews_count || 12})</span>
            </div>

            {isOutOfStock ? (
              <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                Only {product.stock} Left!
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                In Stock
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug || product.id}`}>
            <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-maroon-900 transition-colors line-clamp-1 mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-xs text-stone-600 line-clamp-2 mb-3">
            {product.short_description || product.description}
          </p>
        </div>

        <div>
          {/* Price & Add to Cart */}
          <div className="pt-2 border-t border-gold-200/50 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-extrabold text-lg text-maroon-950">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-stone-500 line-through">
                    ₹{product.original_price!.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-500">Free delivery eligible</span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-2.5 rounded-full shadow-sm transition-all flex items-center justify-center ${
                isOutOfStock
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-maroon-900 text-gold-100 hover:bg-maroon-800 hover:shadow-festive'
              }`}
              title={isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              aria-label={isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            >
              {isAdded ? (
                <Check className="w-4 h-4 animate-scale-up" />
              ) : (
                <ShoppingBag className="w-4 h-4 text-gold-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
