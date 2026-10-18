'use client';

import React, { useState, useEffect } from 'react';
import { Review, SiteSettings } from '@/types';
import { Star, MessageSquare, Check, Sparkles, AlertCircle, Bot } from 'lucide-react';

interface Props {
  settings: SiteSettings;
  productId?: string;
}

export function CustomerReviewsSection({ settings, productId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  // Submission Form State
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const url = productId ? `/api/reviews?productId=${productId}` : `/api/reviews`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
        setTotalCount(data.totalCount || 0);
        setAverageRating(data.averageRating || 0);
        setDistribution(data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId || null,
          customer_name: formName,
          customer_email: formEmail,
          rating: formRating,
          title: formTitle,
          comment: formComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(data.message || 'Review submitted for moderation! Thank you.');
        setFormName('');
        setFormEmail('');
        setFormTitle('');
        setFormComment('');
        setFormRating(5);
        setTimeout(() => setShowForm(false), 3000);
      } else {
        setSubmitError(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      setSubmitError('Network error submitting review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settings.show_reviews) return null;

  return (
    <section id="reviews" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gold-200/80">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-700 uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Experiences</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-maroon-950">
            Real Festive Reviews
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Genuine verified experiences from Indian homes celebrating Diwali with DeepAura.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm self-start md:self-auto flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4 text-gold-300" />
          <span>{showForm ? 'Cancel Submission' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Review Submission Form Modal / Box */}
      {showForm && (
        <div className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-gold-300 shadow-festive max-w-2xl mx-auto">
          <h3 className="font-serif font-bold text-xl text-maroon-950 mb-1">
            Share Your Celebration Experience
          </h3>
          <p className="text-xs text-stone-500 mb-6">
            All reviews undergo verification by our store team to keep ratings 100% genuine.
          </p>

          {submitSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {submitError}
                </div>
              )}

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Your Overall Rating:
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= formRating ? 'fill-gold-500 text-gold-500' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-2 self-center">
                    {formRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditi Rao"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Email * (kept private)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aditi@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Review Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exquisite brass finish & fast delivery!"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Detailed Festive Feedback *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell other Diwali decorators about the build quality, flame illumination, packaging, and craftsmanship..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-gradient-to-r from-maroon-900 to-maroon-800 text-gold-100 text-xs font-bold hover:from-maroon-800 hover:to-maroon-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting for Review...' : 'Submit Review for Moderation'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Aggregate Rating Breakdown Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 bg-white rounded-3xl p-6 sm:p-8 border border-gold-200/80 shadow-sm items-center">
        
        {/* Left: Big Score */}
        <div className="lg:col-span-4 text-center lg:text-left lg:border-r lg:border-gold-200/80 lg:pr-8 space-y-2">
          <div className="font-serif font-extrabold text-5xl sm:text-6xl text-maroon-950">
            {totalCount > 0 ? averageRating.toFixed(1) : '5.0'}
          </div>
          <div className="flex items-center justify-center lg:justify-start gap-1 text-gold-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= Math.round(averageRating || 5) ? 'fill-current text-gold-500' : 'text-stone-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-stone-500">
            Based on {totalCount} authentic published customer reviews
          </p>
        </div>

        {/* Right: Distribution Bars */}
        <div className="lg:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const pct = totalCount > 0 ? (count / totalCount) * 100 : star === 5 ? 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-stone-600 font-semibold">{star} Stars</span>
                <div className="flex-1 bg-ivory-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gold-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-stone-400 text-right font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-stone-400">Loading festive reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-gold-200/80 p-8 shadow-sm max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center text-gold-600 mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h4 className="font-serif font-bold text-base text-stone-900">Be the First to Review!</h4>
          <p className="text-xs text-stone-500">
            Order your favorite Diwali decor today and share your review with thousands of festive shoppers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-gold-200/70 shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & sample label */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-gold-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-current text-gold-500' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>

                  {rev.is_sample && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                      <Bot className="w-3 h-3 text-stone-400" />
                      <span>AI-generated sample</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="font-serif font-bold text-sm text-stone-900 mb-1.5 line-clamp-1">
                  {rev.title}
                </h4>

                {/* Comment */}
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  &quot;{rev.comment}&quot;
                </p>

                {/* Admin Reply if present */}
                {rev.admin_reply && (
                  <div className="mb-3 p-2.5 rounded-lg bg-ivory-100/80 border-l-2 border-gold-500 text-[11px] text-stone-700">
                    <span className="font-bold text-maroon-900 block mb-0.5">
                      Store Response:
                    </span>
                    <span>{rev.admin_reply}</span>
                  </div>
                )}
              </div>

              {/* Author & Date */}
              <div className="pt-3 border-t border-gold-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="font-semibold text-stone-800">{rev.customer_name}</span>
                <span>{new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
