'use client';

import React, { useState, useEffect } from 'react';
import { FAQ, SiteSettings } from '@/types';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  settings: SiteSettings;
}

export function FAQSection({ settings }: Props) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/faqs')
      .then((res) => res.json())
      .then((data) => {
        if (data.faqs) setFaqs(data.faqs);
      })
      .catch((err) => console.error('Error fetching FAQs:', err));
  }, []);

  if (!settings.show_faqs || faqs.length === 0) return null;

  return (
    <section id="faqs" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-gold-200/80">
      
      {/* Title */}
      <div className="text-center mb-12 space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-700 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Clear Answers & Festive Support</span>
        </div>
        <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-maroon-950">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-stone-600">
          Everything you need to know about deliveries, cash on delivery, and our 48-hour return guarantee.
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-2xl border border-gold-200/80 bg-white shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-ivory-50/70 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-serif font-semibold text-sm sm:text-base text-stone-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gold-600 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-maroon-900' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-gold-100">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Need more help card */}
      <div className="mt-10 p-5 rounded-2xl bg-ivory-100/70 border border-gold-300/60 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <h4 className="font-serif font-bold text-sm text-maroon-950">Have a custom question about your order?</h4>
          <p className="text-xs text-stone-600">Our festive customer care concierge is here to assist you.</p>
        </div>
        <a
          href={`https://wa.me/919876543210`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors whitespace-nowrap"
        >
          Chat on WhatsApp →
        </a>
      </div>

    </section>
  );
}
