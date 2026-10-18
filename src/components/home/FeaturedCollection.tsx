'use client';

import React from 'react';
import { Product, SiteSettings } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { Sparkles } from 'lucide-react';

interface Props {
  products: Product[];
  settings: SiteSettings;
  onQuickView: (product: Product) => void;
}

export function FeaturedCollection({ products, settings, onQuickView }: Props) {
  if (!settings.show_featured) return null;

  const featured = products.filter((p) => p.is_featured && p.is_active);

  if (featured.length === 0) return null;

  return (
    <section id="featured" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-ivory-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 border border-gold-300 text-xs font-semibold text-maroon-900 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Curated For Festive Joy</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-maroon-950">
            Featured Festive Bestsellers
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Our most cherished handcrafted diyas, celestial fairy lights, and auspicious entrance torans.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
