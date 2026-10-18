'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { SiteSettings } from '@/types';
import { ShoppingBag, Heart, Search, Menu, X, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  settings: SiteSettings;
  activeCategory?: string;
  onSelectCategory?: (categorySlug: string) => void;
  onSearchChange?: (query: string) => void;
}

export function Navbar({ settings, activeCategory = 'all', onSelectCategory, onSearchChange }: Props) {
  const { itemCount, wishlist, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Shop All', slug: 'all' },
    { name: 'Diwali Lights', slug: 'diwali-lights' },
    { name: 'Diyas & Lamps', slug: 'diyas-lamps' },
    { name: 'Rangoli & Toran', slug: 'rangoli-toran' },
    { name: 'Gift & Decoration', slug: 'gift-decoration' },
  ];

  const handleCategoryClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-ivory-50/95 backdrop-blur-md border-b border-gold-500/20 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-maroon-900 hover:text-gold-600 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo & Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-maroon-900 via-maroon-800 to-saffron-600 flex items-center justify-center shadow-festive border border-gold-400/40">
                <Flame className="w-5 h-5 text-gold-300 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl sm:text-2xl text-maroon-950 tracking-tight group-hover:text-gold-700 transition-colors">
                  {settings.brand_name.split('—')[0]?.trim() || 'DeepAura'}
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-gold-700 -mt-1">
                  Diwali Decor
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links (Filter the 10 products!) */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-3">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'home'
                  ? 'text-maroon-900 bg-gold-100 font-semibold'
                  : 'text-stone-700 hover:text-maroon-900 hover:bg-gold-50'
              }`}
            >
              Home
            </Link>
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`/#products`}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  activeCategory === cat.slug
                    ? 'text-maroon-900 bg-gold-200/80 font-semibold border border-gold-400/40'
                    : 'text-stone-700 hover:text-maroon-900 hover:bg-gold-50'
                }`}
              >
                {cat.name}
              </a>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-stone-700 hover:text-maroon-900 transition-colors"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <a
              href="#products"
              onClick={() => onSelectCategory && onSelectCategory('wishlist')}
              className="relative p-2 text-stone-700 hover:text-maroon-900 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-maroon-700 text-gold-100 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </a>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-maroon-900 to-maroon-800 text-gold-100 px-3.5 py-2 rounded-full shadow-festive hover:from-maroon-800 hover:to-maroon-700 transition-all border border-gold-500/30"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-4 h-4 text-gold-300" />
              <span className="hidden sm:inline text-xs font-semibold tracking-wide uppercase">Cart</span>
              <span className="bg-gold-500 text-maroon-950 text-xs font-bold px-1.5 py-0.2 rounded-full min-w-[20px] text-center">
                {itemCount}
              </span>
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gold-500/20 py-3"
            >
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search LED lights, brass diyas, torans, puja thali..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (onSearchChange) onSearchChange(e.target.value);
                  }}
                  className="w-full bg-white border border-gold-300/80 rounded-full py-2.5 pl-11 pr-24 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gold-500 shadow-sm"
                  autoFocus
                />
                <Search className="w-4 h-4 text-gold-600 absolute left-4" />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-1.5 bg-maroon-900 text-gold-100 rounded-full text-xs font-semibold hover:bg-maroon-800 transition-colors"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-ivory-50 border-b border-gold-500/20 px-6 py-6 shadow-xl"
          >
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-stone-800 hover:text-maroon-900 py-1"
              >
                Home
              </Link>
              {categories.map((cat) => (
                <a
                  key={cat.slug}
                  href="#products"
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="text-base font-medium text-stone-700 hover:text-maroon-900 py-1"
                >
                  {cat.name}
                </a>
              ))}
              <div className="pt-4 border-t border-gold-200/60 flex flex-col space-y-2">
                <a
                  href="#reviews"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-stone-600 hover:text-maroon-900"
                >
                  Customer Reviews
                </a>
                <a
                  href="#faqs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-stone-600 hover:text-maroon-900"
                >
                  Frequently Asked Questions
                </a>
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-gold-700 font-semibold pt-2"
                >
                  Store Owner Login →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
