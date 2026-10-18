'use client';

import React, { useState, useEffect } from 'react';
import { FAQ } from '@/types';
import { HelpCircle, Plus, Edit, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react';

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQ> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/admin/faqs');
      const data = await res.json();
      if (data.faqs) setFaqs(data.faqs);
    } catch (e) {
      console.error('Error fetching FAQs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    try {
      const url = isNew ? '/api/admin/faqs' : `/api/admin/faqs/${editingFaq.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFaq),
      });

      if (res.ok) {
        setAlertMsg({ type: 'success', text: 'FAQ successfully saved!' });
        setEditingFaq(null);
        fetchFaqs();
      } else {
        setAlertMsg({ type: 'error', text: 'Failed to save FAQ.' });
      }
    } catch (e) {
      setAlertMsg({ type: 'error', text: 'Error saving FAQ.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAlertMsg({ type: 'success', text: 'FAQ deleted.' });
        fetchFaqs();
      }
    } catch (e) {
      setAlertMsg({ type: 'error', text: 'Failed to delete FAQ.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-maroon-950">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage customer help questions covering deliveries, COD, and returns.
          </p>
        </div>

        <button
          onClick={() => {
            setIsNew(true);
            setEditingFaq({
              question: '',
              answer: '',
              category: 'General',
              sort_order: faqs.length + 1,
              is_active: true,
            });
          }}
          className="px-5 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-gold-300" />
          <span>Add New FAQ</span>
        </button>
      </div>

      {alertMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)}>✕</button>
        </div>
      )}

      {/* FAQs List */}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="p-5 rounded-2xl bg-white border border-gold-200 shadow-sm flex items-start justify-between gap-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gold-700 bg-gold-100 px-2 py-0.5 rounded">
                {faq.category}
              </span>
              <h4 className="font-serif font-bold text-sm text-stone-900 mt-1">{faq.question}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">{faq.answer}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsNew(false);
                  setEditingFaq(faq);
                }}
                className="p-1.5 rounded-lg bg-ivory-100 hover:bg-gold-100 text-maroon-900"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(faq.id)}
                className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-maroon-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gold-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gold-200">
              <h3 className="font-serif font-bold text-lg text-maroon-950">
                {isNew ? 'Create New FAQ' : 'Edit FAQ'}
              </h3>
              <button onClick={() => setEditingFaq(null)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={editingFaq.question || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingFaq.category || 'General'}
                  onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                  placeholder="e.g. Shipping, Payment, Ordering"
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Answer *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingFaq.answer || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl p-3 text-xs text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="px-5 py-2 rounded-full border border-stone-300 text-stone-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
