'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, Category } from '@/types';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Upload,
  Star,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit / Create Modal State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const activeCount = products.filter((p) => p.is_active).length;

  const handleToggleActive = async (product: Product) => {
    const willBeActive = !product.is_active;

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: willBeActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({
          type: 'success',
          text: `"${product.name}" is now ${willBeActive ? 'Active' : 'Inactive'}.`,
        });
        fetchProducts();
      } else {
        setAlertMsg({ type: 'error', text: data.error || 'Failed to update active state.' });
      }
    } catch (e) {
      setAlertMsg({ type: 'error', text: 'Network error updating product status.' });
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !product.is_featured }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error('Error toggling featured:', e);
    }
  };

  const getProductImages = (prod: Partial<Product> | null): string[] => {
    if (!prod) return [];
    const list = [prod.image_url, ...(prod.additional_images || [])].filter(Boolean) as string[];
    return Array.from(new Set(list));
  };

  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingProduct) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const current = getProductImages(editingProduct);
    const filesArray = Array.from(files);
    setUploadingImage(true);

    const formData = new FormData();
    filesArray.forEach((f) => formData.append('files', f));
    formData.append('type', 'product');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.urls && data.urls.length > 0) {
        const merged = [...current, ...data.urls];
        setEditingProduct((prev) => ({
          ...prev,
          image_url: merged[0] || '',
          additional_images: merged.slice(1),
        }));
        setAlertMsg({
          type: 'success',
          text: `Uploaded ${data.urls.length} image(s)! Total: ${merged.length} images.`,
        });
      } else {
        setAlertMsg({ type: 'error', text: data.error || 'Image upload failed.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Network error uploading images.' });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!editingProduct || !newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    const current = getProductImages(editingProduct);
    if (current.includes(url)) {
      setAlertMsg({ type: 'error', text: 'This image URL is already in the gallery.' });
      return;
    }
    const merged = [...current, url];
    setEditingProduct((prev) => ({
      ...prev,
      image_url: merged[0],
      additional_images: merged.slice(1),
    }));
    setNewImageUrl('');
  };

  const handleSetCoverImage = (index: number) => {
    if (!editingProduct) return;
    const current = getProductImages(editingProduct);
    if (index === 0 || index >= current.length) return;
    const selected = current[index];
    const remaining = current.filter((_, i) => i !== index);
    const reordered = [selected, ...remaining];
    setEditingProduct((prev) => ({
      ...prev,
      image_url: reordered[0],
      additional_images: reordered.slice(1),
    }));
  };

  const handleRemoveProductImage = (index: number) => {
    if (!editingProduct) return;
    const current = getProductImages(editingProduct);
    const filtered = current.filter((_, i) => i !== index);
    setEditingProduct((prev) => ({
      ...prev,
      image_url: filtered[0] || '',
      additional_images: filtered.slice(1),
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSaving(true);
    setAlertMsg(null);

    try {
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAlertMsg({
          type: 'success',
          text: `Product "${data.product.name}" successfully saved!`,
        });
        setEditingProduct(null);
        fetchProducts();
      } else {
        setAlertMsg({
          type: 'error',
          text: data.error || 'Failed to save product.',
        });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Error saving product.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-maroon-950">
            Product Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage and expand your complete Diwali product catalog without limits. Add unlimited items, update inventory, prices, and high-definition galleries.
          </p>
        </div>

        <button
          onClick={() => {
            setIsNew(true);
            setEditingProduct({
              name: '',
              price: 599,
              original_price: 999,
              sku: `DA-SKU-${Date.now().toString().slice(-4)}`,
              stock: 30,
              category_id: 'diwali-lights',
              is_active: true,
              is_featured: false,
              description: '',
              short_description: '',
              image_url:
                'https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=800&q=80',
            });
          }}
          className="px-5 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-gold-300" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Unlimited Active Products Status Banner */}
      <div className="p-4 rounded-2xl bg-white border border-gold-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-100 text-maroon-900 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-gold-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-sm text-maroon-950">
                Catalog: {activeCount} Active Products ({products.length} Total)
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Unlimited Mode
              </span>
            </div>
            <p className="text-xs text-stone-600">
              No product limit — you can add, upload and activate as many products as you want for your festive store.
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-maroon-900 bg-gold-50 border border-gold-200 px-3 py-1.5 rounded-xl">
          Active Storefront Items: {activeCount}
        </div>
      </div>

      {/* Alert Notification */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-2 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="font-bold hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-gold-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase font-bold text-stone-500 bg-ivory-50 border-b border-gold-200">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU & Category</th>
                <th className="py-3.5 px-4">Price / Original</th>
                <th className="py-3.5 px-4">Inventory</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4">Active</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-ivory-50/60 transition-colors">
                  {/* Image & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gold-200 shrink-0 bg-stone-100">
                        <Image src={p.image_url} alt="" fill unoptimized className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-stone-900 line-clamp-1">{p.name}</h4>
                        <span className="text-[11px] text-stone-500 flex items-center gap-1">
                          <Star className="w-3 h-3 text-gold-500 fill-current" />
                          <span>{p.rating || 5}</span>
                          <span>({p.reviews_count || 0} reviews)</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* SKU & Category */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-stone-700 block font-semibold">{p.sku}</span>
                    <span className="text-[10px] text-gold-700 uppercase tracking-wider font-bold">
                      {p.category_id}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4">
                    <span className="font-serif font-bold text-stone-900 block text-sm">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    {p.original_price ? (
                      <span className="text-[11px] text-stone-400 line-through">
                        ₹{p.original_price.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400">No discount</span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        p.stock <= 0
                          ? 'bg-rose-100 text-rose-800'
                          : p.stock <= 15
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>

                  {/* Featured Toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        p.is_featured
                          ? 'bg-gold-500 text-maroon-950'
                          : 'bg-stone-100 text-stone-400 hover:text-stone-700'
                      }`}
                      title={p.is_featured ? 'Featured on homepage' : 'Not featured'}
                    >
                      <Star className={`w-4 h-4 ${p.is_featured ? 'fill-current' : ''}`} />
                    </button>
                  </td>

                  {/* Active Toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                        p.is_active
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsNew(false);
                          setEditingProduct(p);
                        }}
                        className="p-1.5 rounded-lg bg-ivory-100 hover:bg-gold-100 text-maroon-900 transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-maroon-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-gold-300 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-gold-200">
              <h3 className="font-serif font-bold text-xl text-maroon-950">
                {isNew ? 'Add New Festive Product' : `Edit: ${editingProduct.name}`}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.price ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Original Price (₹) (Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.original_price ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        original_price: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="e.g. 999"
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Inventory Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.stock ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* SKU & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    SKU Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, sku: e.target.value })
                    }
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs font-mono font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category_id || 'diwali-lights'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category_id: e.target.value,
                      })
                    }
                    className="w-full bg-ivory-50 border border-gold-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  >
                    <option value="diwali-lights">Diwali Lights</option>
                    <option value="diyas-lamps">Diyas & Lamps</option>
                    <option value="rangoli-toran">Rangoli & Toran</option>
                    <option value="gift-decoration">Gift & Decoration</option>
                  </select>
                </div>
              </div>

              {/* Product Photo Gallery (Unlimited Images • PNG & JPG Mix) */}
              <div className="p-4 rounded-2xl bg-ivory-50/80 border border-gold-300 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-maroon-950">
                      Product Photo Gallery (Unlimited Images) *
                    </label>
                    <span className="text-[10px] text-stone-500 block">
                      Mix PNG and JPG images freely. First image serves as the Main Storefront Cover.
                    </span>
                  </div>
                  
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full self-start sm:self-auto bg-gold-100 text-maroon-900 border border-gold-300">
                    {getProductImages(editingProduct).length} Images Added
                  </span>
                </div>

                {/* Upload Buttons & URL Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://... or /uploads/...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 bg-white border border-gold-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={!newImageUrl.trim()}
                      className="px-3 py-2 bg-stone-800 text-gold-100 rounded-xl text-xs font-semibold hover:bg-maroon-900 transition-colors disabled:opacity-40"
                    >
                      Add URL
                    </button>
                  </div>

                  <label className="px-4 py-2 bg-maroon-900 hover:bg-maroon-800 text-gold-100 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload PNG / JPG Images'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleMultiImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image Grid Preview */}
                {getProductImages(editingProduct).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                    {getProductImages(editingProduct).map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-xl overflow-hidden border-2 aspect-square bg-white shadow-sm transition-all ${
                          idx === 0
                            ? 'border-maroon-900 ring-2 ring-gold-400'
                            : 'border-gold-200 hover:border-gold-400'
                        }`}
                      >
                        <Image
                          src={imgUrl}
                          alt={`Product Image ${idx + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />

                        {/* Top Badge: Main Cover */}
                        {idx === 0 ? (
                          <div className="absolute top-1.5 left-1.5 z-10">
                            <span className="px-1.5 py-0.5 rounded-full bg-maroon-900 text-gold-200 text-[9px] font-bold shadow">
                              ★ Main Cover
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetCoverImage(idx)}
                            title="Set as Main Cover Image"
                            className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-black/60 hover:bg-maroon-900 text-gold-100 text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Set Main
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveProductImage(idx)}
                          title="Delete this image"
                          className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        <div className="absolute bottom-1 right-1.5 z-10 text-[9px] font-mono text-white/90 bg-black/50 px-1 rounded">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-stone-400 border-2 border-dashed border-gold-300 rounded-xl bg-white/60">
                    No images added yet. Click &quot;Upload PNG / JPG Images&quot; or paste an image URL above.
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-ivory-50 border border-gold-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              {/* Active & Featured Checkboxes */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active ?? true}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_active: e.target.checked,
                      })
                    }
                    className="rounded text-maroon-900 focus:ring-maroon-900"
                  />
                  <span>Active on Storefront (Visible to Customers)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured ?? false}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_featured: e.target.checked,
                      })
                    }
                    className="rounded text-maroon-900 focus:ring-maroon-900"
                  />
                  <span>Mark as Featured Bestseller</span>
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gold-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving Product...' : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
