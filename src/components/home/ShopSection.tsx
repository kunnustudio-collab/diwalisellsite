'use client';

import React, { useMemo, useState } from 'react';
import { Product, Category } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { useCart } from '@/context/CartContext';
import { Search, SlidersHorizontal, Heart, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  products: Product[];
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickView: (product: Product) => void;
}

export function ShopSection({
  products,
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onQuickView,
}: Props) {
  const { wishlist } = useCart();
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filter by Wishlist if selected
    if (activeCategory === 'wishlist') {
      list = list.filter((p) => wishlist.includes(p.id));
    }
    // Filter by Category
    else if (activeCategory && activeCategory !== 'all') {
      list = list.filter((p) => p.category_id === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.short_description && p.short_description.toLowerCase().includes(q))
      );
    }

    // In stock only filter
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return list;
  }, [products, activeCategory, searchQuery, inStockOnly, sortBy, wishlist]);

  return (
    <section id="products" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      
      {/* Title & Headline */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gold-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-700 uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grand Diwali Catalog</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-maroon-950">
            {activeCategory === 'wishlist'
              ? 'Your Saved Wishlist'
              : 'Handcrafted Festive Decor'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Displaying exactly {filteredProducts.length} of {products.length} curated festive decorations.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gold-600" />
            <span>Sort by:</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-gold-300 rounded-full px-3.5 py-1.5 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-gold-500 shadow-sm"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-maroon-900 text-gold-100 shadow-md'
              : 'bg-white text-stone-700 border border-gold-300/80 hover:bg-gold-50'
          }`}
        >
          All ({products.length})
        </button>

        {categories.map((cat) => {
          const count = products.filter((p) => p.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-maroon-900 text-gold-100 shadow-md'
                  : 'bg-white text-stone-700 border border-gold-300/80 hover:bg-gold-50'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}

        <button
          onClick={() => onSelectCategory('wishlist')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeCategory === 'wishlist'
              ? 'bg-maroon-900 text-gold-100 shadow-md'
              : 'bg-white text-stone-700 border border-gold-300/80 hover:bg-gold-50'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Wishlist ({wishlist.length})</span>
        </button>
      </div>

      {/* Active Filter Pills / Search Notice */}
      {(searchQuery.trim() || inStockOnly || activeCategory !== 'all') && (
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
          <span className="text-stone-500">Active filters:</span>
          {activeCategory !== 'all' && (
            <span className="bg-gold-100 text-maroon-900 px-3 py-1 rounded-full border border-gold-300 font-medium flex items-center gap-1">
              Category: {activeCategory}
              <button onClick={() => onSelectCategory('all')} className="ml-1 hover:text-rose-600 font-bold">×</button>
            </span>
          )}
          {searchQuery.trim() && (
            <span className="bg-gold-100 text-maroon-900 px-3 py-1 rounded-full border border-gold-300 font-medium flex items-center gap-1">
              Search: &quot;{searchQuery}&quot;
              <button onClick={() => onSearchChange('')} className="ml-1 hover:text-rose-600 font-bold">×</button>
            </span>
          )}
          <button
            onClick={() => {
              onSelectCategory('all');
              onSearchChange('');
              setInStockOnly(false);
            }}
            className="text-maroon-800 underline font-semibold hover:text-gold-700"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-gold-200/80 p-8 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-gold-50 flex items-center justify-center text-gold-600 border border-gold-200">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">No Festive Products Found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {activeCategory === 'wishlist'
                ? 'You have not added any festive products to your wishlist yet. Click the heart icon on any product to save it!'
                : `We couldn't find matches for "${searchQuery}". Try searching for lights, brass diyas, or garlands.`}
            </p>
          </div>
          <button
            onClick={() => {
              onSelectCategory('all');
              onSearchChange('');
            }}
            className="px-6 py-2 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm"
          >
            View All 10 Starter Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </section>
  );
}
