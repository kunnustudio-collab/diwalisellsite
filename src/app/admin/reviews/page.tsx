'use client';

import React, { useState, useEffect } from 'react';
import { Review } from '@/types';
import {
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Flag,
  Trash2,
  Reply,
  Bot,
  Sparkles,
  AlertCircle,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reply Modal State
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [aiSetupMessage, setAiSetupMessage] = useState<string | null>(null);

  // AI Summary State
  const [showAiSummaryModal, setShowAiSummaryModal] = useState(false);
  const [aiSummaryData, setAiSummaryData] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/admin/reviews?status=${statusFilter}`);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleModerate = async (
    id: string,
    action: 'approve' | 'reject' | 'flag' | 'delete' | 'reply',
    reply?: string
  ) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, replyText: reply }),
      });
      if (res.ok) {
        setAlertMsg({ type: 'success', text: `Review action "${action}" completed.` });
        fetchReviews();
      } else {
        setAlertMsg({ type: 'error', text: 'Failed to update review.' });
      }
    } catch (e) {
      setAlertMsg({ type: 'error', text: 'Network error moderating review.' });
    }
  };

  const handleOpenReplyModal = (review: Review) => {
    setReplyingReview(review);
    setReplyText(review.admin_reply || '');
    setAiSetupMessage(null);
  };

  const handleAiDraftReply = async () => {
    if (!replyingReview) return;
    setIsDraftingAi(true);
    setAiSetupMessage(null);

    try {
      const res = await fetch('/api/admin/reviews/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          reviewText: replyingReview.comment,
          customerName: replyingReview.customer_name,
          rating: replyingReview.rating,
        }),
      });

      const data = await res.json();
      if (data.draftReply) {
        setReplyText(data.draftReply);
      }
      if (data.setupMessage) {
        setAiSetupMessage(data.setupMessage);
      }
    } catch (err) {
      console.error('AI draft error:', err);
    } finally {
      setIsDraftingAi(false);
    }
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;

    await handleModerate(replyingReview.id, 'reply', replyText);
    setReplyingReview(null);
  };

  const handleRunAiSummary = async () => {
    setShowAiSummaryModal(true);
    setLoadingSummary(true);

    try {
      const res = await fetch('/api/admin/reviews/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'summarize' }),
      });
      const data = await res.json();
      setAiSummaryData(data);
    } catch (err) {
      console.error('AI summary error:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-maroon-950">
            Customer Review Moderation & AI Assistant
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Moderate genuine customer feedback, draft replies, analyze sentiment, and verify authentic reviews.
          </p>
        </div>

        <button
          onClick={handleRunAiSummary}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-maroon-900 via-maroon-800 to-saffron-700 text-gold-100 text-xs font-bold hover:shadow-festive transition-all flex items-center gap-2 self-start sm:self-auto border border-gold-400/30"
        >
          <Sparkles className="w-4 h-4 text-gold-300 animate-pulse" />
          <span>Launch AI Feedback Summary</span>
        </button>
      </div>

      {alertMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-2 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="font-bold hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gold-200 pb-2">
        {[
          { label: 'All Reviews', value: 'all' },
          { label: 'Pending Approval', value: 'pending' },
          { label: 'Approved & Live', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value as any)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              statusFilter === tab.value
                ? 'bg-maroon-900 text-gold-100 shadow-sm'
                : 'text-stone-600 hover:bg-gold-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gold-200 p-8 shadow-sm text-stone-400 text-xs">
            No reviews match the selected filter.
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-6 rounded-3xl bg-white border shadow-sm space-y-4 transition-all ${
                rev.is_flagged
                  ? 'border-rose-400 ring-2 ring-rose-200'
                  : 'border-gold-200/80 hover:border-gold-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex text-gold-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= rev.rating ? 'fill-current text-gold-500' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rev.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rev.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {rev.status}
                  </span>

                  {rev.is_sample && (
                    <span className="bg-stone-100 text-stone-600 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 border border-stone-200">
                      <Bot className="w-3 h-3 text-stone-400" />
                      <span>AI Demonstration Sample</span>
                    </span>
                  )}

                  {rev.is_flagged && (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      <span>Flagged For Review</span>
                    </span>
                  )}
                </div>

                <span className="text-xs text-stone-400">
                  Submitted {new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Title & Comment */}
              <div>
                <h4 className="font-serif font-bold text-base text-stone-900 mb-1">
                  {rev.title}
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed bg-ivory-50/50 p-3 rounded-xl border border-gold-100">
                  &quot;{rev.comment}&quot;
                </p>
              </div>

              {/* Customer Author */}
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span>By: <strong className="text-stone-900">{rev.customer_name}</strong></span>
                <span>•</span>
                <span>Email: <strong className="text-stone-700">{rev.customer_email}</strong></span>
                {rev.product_id && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-gold-800">Target Product ID: {rev.product_id}</span>
                  </>
                )}
              </div>

              {/* Store Response if present */}
              {rev.admin_reply && (
                <div className="p-3.5 rounded-2xl bg-ivory-100/90 border border-gold-300 text-xs text-stone-800">
                  <div className="flex items-center justify-between pb-1 border-b border-gold-200/60 mb-1.5">
                    <span className="font-serif font-bold text-maroon-900">
                      Published Store Response
                    </span>
                    <button
                      onClick={() => handleOpenReplyModal(rev)}
                      className="text-[10px] text-maroon-800 font-semibold hover:underline"
                    >
                      Edit Reply
                    </button>
                  </div>
                  <p>{rev.admin_reply}</p>
                </div>
              )}

              {/* Moderation Actions Bar */}
              <div className="pt-3 border-t border-gold-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {rev.status !== 'approved' && (
                    <button
                      onClick={() => handleModerate(rev.id, 'approve')}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>
                  )}

                  {rev.status !== 'rejected' && (
                    <button
                      onClick={() => handleModerate(rev.id, 'reject')}
                      className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleModerate(rev.id, 'flag')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      rev.is_flagged
                        ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        : 'bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{rev.is_flagged ? 'Unflag' : 'Flag Suspicious'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenReplyModal(rev)}
                    className="px-3.5 py-1.5 rounded-full bg-ivory-100 hover:bg-gold-100 text-maroon-900 border border-gold-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Reply className="w-3.5 h-3.5 text-gold-700" />
                    <span>{rev.admin_reply ? 'Edit Reply' : 'Reply with AI Draft'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Delete this review permanently?')) {
                        handleModerate(rev.id, 'delete');
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Reply Modal with AI Draft Option */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-maroon-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gold-300 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-gold-200">
              <h3 className="font-serif font-bold text-lg text-maroon-950">
                Reply to {replyingReview.customer_name}
              </h3>
              <button
                onClick={() => setReplyingReview(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div className="bg-ivory-50 p-3 rounded-xl border border-gold-200 text-xs text-stone-600">
              <strong className="block text-stone-900 mb-0.5">Customer Comment:</strong>
              &quot;{replyingReview.comment}&quot;
            </div>

            {aiSetupMessage && (
              <div className="p-3 rounded-xl bg-gold-50 border border-gold-200 text-stone-700 text-[11px] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-gold-700 shrink-0" />
                <span>{aiSetupMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveReply} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Store Response Message:
                  </label>
                  <button
                    type="button"
                    onClick={handleAiDraftReply}
                    disabled={isDraftingAi}
                    className="text-xs font-bold text-maroon-900 hover:text-gold-700 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                    <span>{isDraftingAi ? 'Drafting with AI...' : 'Auto-Draft Festive Reply'}</span>
                  </button>
                </div>

                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank you for choosing DeepAura for your Diwali celebrations..."
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-5 py-2 rounded-full border border-stone-300 text-stone-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm"
                >
                  Publish Response
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      {showAiSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-maroon-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gold-300 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-gold-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-600" />
                <h3 className="font-serif font-bold text-xl text-maroon-950">
                  AI Review Assistant Report
                </h3>
              </div>
              <button
                onClick={() => setShowAiSummaryModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            {loadingSummary ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-8 h-8 border-4 border-gold-400 border-t-maroon-900 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-stone-500 font-semibold">
                  Synthesizing genuine customer feedback...
                </p>
              </div>
            ) : aiSummaryData ? (
              <div className="space-y-4 text-xs">
                
                {aiSummaryData.setupMessage && (
                  <div className="p-3 rounded-xl bg-gold-50 border border-gold-200 text-stone-700 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gold-700 shrink-0" />
                    <span>{aiSummaryData.setupMessage}</span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-ivory-50 border border-gold-200 space-y-2">
                  <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] block">
                    Overall Customer Sentiment
                  </span>
                  <div className="font-serif font-bold text-lg text-maroon-950">
                    {aiSummaryData.sentiment}
                  </div>
                  <p className="text-stone-700 leading-relaxed">{aiSummaryData.summary}</p>
                </div>

                {aiSummaryData.highlights && (
                  <div className="space-y-2">
                    <span className="font-bold text-stone-700 block">Key Festive Findings:</span>
                    <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                      {aiSummaryData.highlights.map((h: string, idx: number) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-gold-200 flex justify-end">
                  <button
                    onClick={() => setShowAiSummaryModal(false)}
                    className="px-6 py-2 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800"
                  >
                    Close Report
                  </button>
                </div>

              </div>
            ) : null}

          </div>
        </div>
      )}

    </div>
  );
}
