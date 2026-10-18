'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, SiteSettings } from '@/types';
import { useCart } from '@/context/CartContext';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerReviewsSection } from '@/components/home/CustomerReviewsSection';
import { ProductCard } from '@/components/products/ProductCard';
import { QuickViewModal } from '@/components/products/QuickViewModal';
import {
  Star,
  ShoppingBag,
  Zap,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Heart,
} from 'lucide-react';

interface Props {
  product: Product;
  relatedProducts: Product[];
  settings: SiteSettings;
}

export function ProductDetailClient({ product, relatedProducts, settings }: Props) {
  const router = useRouter();
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>(product.image_url);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const allImages = [product.image_url, ...(product.additional_images || [])];
  const hasDiscount = Boolean(product.original_price && product.original_price > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const isFavorited = wishlist.includes(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFEFA]">
      <AnnouncementBar settings={settings} />
      <Navbar settings={settings} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-8">
          <Link href="/" className="hover:text-maroon-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/#products" className="hover:text-maroon-900">
            Products
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Main Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-16">
          
          {/* Left: Gallery & Zoom Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden border-2 border-gold-300 shadow-sm bg-ivory-100">
              <Image
                src={selectedImage || product.image_url}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {hasDiscount && (
                  <span className="bg-maroon-700 text-gold-100 font-bold text-xs px-3 py-1 rounded-full shadow-md">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.is_featured && (
                  <span className="bg-gold-500 text-maroon-950 font-bold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Festive Bestseller
                  </span>
                )}
              </div>

              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all ${
                  isFavorited
                    ? 'bg-maroon-700 text-white'
                    : 'bg-white/80 text-stone-700 hover:bg-white hover:text-maroon-900'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail selector */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img
                        ? 'border-maroon-800 scale-105 shadow-md'
                        : 'border-gold-300/80 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Buying Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex text-gold-500">
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
                <span className="font-bold text-stone-900">{product.rating || 4.8}</span>
                <span className="text-stone-500">
                  ({product.reviews_count || 12} verified customer reviews)
                </span>
                <span className="text-stone-300">|</span>
                <span className="font-mono text-stone-500 text-[11px]">SKU: {product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="font-serif font-extrabold text-2xl sm:text-3xl md:text-4xl text-maroon-950 leading-tight">
                {product.name}
              </h1>

              {/* Price & Stock */}
              <div className="flex items-baseline gap-4 pt-1">
                <span className="font-serif font-black text-3xl sm:text-4xl text-maroon-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-base text-stone-400 line-through">
                    ₹{product.original_price!.toLocaleString('en-IN')}
                  </span>
                )}
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    Sold Out
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    In Stock ({product.stock} units available)
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-500">
                Inclusive of all taxes. Free express shipping on orders above ₹{settings.free_shipping_threshold}.
              </p>

              {/* Description */}
              <div className="pt-2 text-stone-700 text-xs sm:text-sm leading-relaxed space-y-2 border-t border-gold-200/80">
                <p>{product.description}</p>
              </div>

              {/* Specifications Box */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-ivory-50 p-4 rounded-2xl border border-gold-300/70 space-y-2 text-xs">
                  <h4 className="font-serif font-bold text-stone-900">Product Specifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-gold-200/40">
                        <span className="text-stone-500 font-medium">{key}:</span>
                        <span className="text-stone-900 font-semibold text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector & CTAs */}
            <div className="space-y-4 pt-6 border-t border-gold-200/80">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-stone-700">Quantity:</span>
                <div className="flex items-center border border-gold-300 rounded-full bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    className="px-3.5 py-1.5 text-stone-600 hover:bg-gold-50 transition-colors font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold text-stone-900 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="px-3.5 py-1.5 text-stone-600 hover:bg-gold-50 transition-colors font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`py-3.5 px-6 rounded-full font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-maroon-900 text-gold-100 hover:bg-maroon-800 hover:shadow-festive'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-gold-300" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="py-3.5 px-6 rounded-full font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-maroon-950 shadow-festive transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Buy Now • ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                </button>
              </div>

              {/* Value Guarantees Strip */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gold-200/60 text-center text-[11px] text-stone-600">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-ivory-100/60">
                  <Truck className="w-4 h-4 text-gold-700" />
                  <span className="font-semibold">Free Delivery</span>
                  <span className="text-[10px] text-stone-500">Above ₹{settings.free_shipping_threshold}</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-ivory-100/60">
                  <ShieldCheck className="w-4 h-4 text-gold-700" />
                  <span className="font-semibold">Transit Safe</span>
                  <span className="text-[10px] text-stone-500">Multi-layer pack</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-ivory-100/60">
                  <RotateCcw className="w-4 h-4 text-gold-700" />
                  <span className="font-semibold">48h Guarantee</span>
                  <span className="text-[10px] text-stone-500">Damage replaced</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products from Catalog */}
        {relatedProducts.length > 0 && (
          <div className="py-12 border-t border-gold-200/80">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-maroon-950 mb-6">
              Complete Your Diwali Celebration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Product Specific Reviews */}
        <CustomerReviewsSection settings={settings} productId={product.id} />
      </main>

      <Footer settings={settings} />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
