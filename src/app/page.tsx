'use client';

import React, { useState, useEffect } from 'react';
import { Product, Category, SiteSettings } from '@/types';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { BenefitsStrip } from '@/components/home/BenefitsStrip';
import { ShopSection } from '@/components/home/ShopSection';
import { FeaturedCollection } from '@/components/home/FeaturedCollection';
import { FestivePromoBanner } from '@/components/home/FestivePromoBanner';
import { CustomerReviewsSection } from '@/components/home/CustomerReviewsSection';
import { FAQSection } from '@/components/home/FAQSection';
import { Footer } from '@/components/layout/Footer';
import { QuickViewModal } from '@/components/products/QuickViewModal';
import { INITIAL_SETTINGS } from '@/lib/constants';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Filter & Search state
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, settRes] = await Promise.all([
          fetch('/api/products').then((r) => r.json()),
          fetch('/api/settings').then((r) => r.json()),
        ]);

        if (prodRes.products) setProducts(prodRes.products);
        if (settRes.settings) setSettings(settRes.settings);

        // Fetch categories
        setCategories([
          { id: 'diwali-lights', name: 'Diwali Lights', slug: 'diwali-lights', sort_order: 1 },
          { id: 'diyas-lamps', name: 'Diyas & Lamps', slug: 'diyas-lamps', sort_order: 2 },
          { id: 'rangoli-toran', name: 'Rangoli & Toran', slug: 'rangoli-toran', sort_order: 3 },
          { id: 'gift-decoration', name: 'Gift & Decoration', slug: 'gift-decoration', sort_order: 4 },
        ]);
      } catch (err) {
        console.error('Error loading storefront data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFEFA]">
      {/* Announcement Bar */}
      <AnnouncementBar settings={settings} />

      {/* Main Navbar */}
      <Navbar
        settings={settings}
        activeCategory={activeCategory}
        onSelectCategory={(slug) => {
          setActiveCategory(slug);
          const el = document.getElementById('products');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSearchChange={(q) => {
          setSearchQuery(q);
          const el = document.getElementById('products');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main className="flex-1">
        {/* Full-width Hero Section */}
        <HeroSection
          settings={settings}
          onExploreClick={() => {
            const el = document.getElementById('products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 4 Benefits Strip */}
        <BenefitsStrip settings={settings} />

        {/* Featured Bestsellers Collection */}
        <FeaturedCollection
          products={products}
          settings={settings}
          onQuickView={(p) => setQuickViewProduct(p)}
        />

        {/* Festive Promo Banner with Coupon Code */}
        <FestivePromoBanner settings={settings} />

        {/* Shop All 10 Starter Products (Search, Category Filter, Sort) */}
        <ShopSection
          products={products}
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onQuickView={(p) => setQuickViewProduct(p)}
        />

        {/* Customer Reviews Section */}
        <CustomerReviewsSection settings={settings} />

        {/* Frequently Asked Questions */}
        <FAQSection settings={settings} />
      </main>

      {/* Footer */}
      <Footer settings={settings} />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
