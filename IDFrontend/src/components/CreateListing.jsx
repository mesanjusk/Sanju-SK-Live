import { useState, useRef, useEffect } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import toast, { Toaster } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit, FaEye } from 'react-icons/fa';

const BADGE_OPTIONS = ['', 'NEW', 'POPULAR', 'HOT', 'HOT DEAL'];

const emptyForm = {
  title: '', description: '', category: '', subcategory: '', religions: '',
  price: '', badge: '', youtubeUrl: '', instagramUrl: '', favorite: '0',
  seoTitle: '', seoDescription: '', seoKeywords: '',
};

const CreateListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [existingImageURLs, setExistingImageURLs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [quantityPricing, setQuantityPricing] = useState([]);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dropdownData, setDropdownData] = useState({ categories: [], subcategories: [], religions: [] });
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalImageSrc, setModalImageSrc] = useState(null);
  const [seoOpen, setSeoOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const user = location.state?.id || localStorage.getItem('User_name');
    if (!user) navigate('/login');
  }, []);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [catRes, subRes, relRes, listRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/subcategories'),
          api.get('/api/religions/GetReligionList'),
          api.get('/api/listings'),
        ]);
        setDropdownData({
          categories:   Array.isArray(catRes.data) ? catRes.data : catRes.data?.result || [],
          subcategories:Array.isArray(subRes.data) ? subRes.data : subRes.data?.result || [],
          religions:    relRes.data?.result || [],
        });
        setListings(listRes.data || []);
      } catch { toast.error('Failed to load dropdown data.'); }
    };
    fetchDropdowns();
  }, []);

  const handleInput = (field) => (e) => {
    const v = e?.target?.value ?? e;
    if (field === 'price' && v && !/^\d*\.?\d*$/.test(v)) return;
    setForm((prev) => ({ ...prev, [field]: v }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter((f) => ['image/jpeg','image/png','image/webp'].includes(f.type));
    if (valid.length !== files.length) toast('Some files skipped (invalid type).');
    const totalAllowed = 4 - existingImageURLs.length - images.length;
    if (valid.length > totalAllowed) {
      toast.error(`Max 4 images total. You can add ${totalAllowed} more.`);
      return;
    }
    setLoading(true);
    const compressed = [];
    for (const file of valid) {
      const blob = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
      compressed.push(new File([blob], `${Date.now()}-${file.name}`, { type: blob.type }));
    }
    const all = [...images, ...compressed];
    setImages(all);
    setPreviewImages(all.map((f) => ({ url: URL.createObjectURL(f) })));
    setLoading(false);
  };

  const removeNewImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    setImages(updated);
    setPreviewImages(updated.map((f) => ({ url: URL.createObjectURL(f) })));
  };

  const removeExistingImage = (idx) => {
    setExistingImageURLs((prev) => prev.filter((_, i) => i !== idx));
  };

  /* Quantity pricing helpers */
  const addTier = () => setQuantityPricing((prev) => [...prev, { minQty: '', maxQty: '', price: '' }]);
  const removeTier = (i) => setQuantityPricing((prev) => prev.filter((_, idx) => idx !== i));
  const updateTier = (i, field, value) => {
    setQuantityPricing((prev) => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.price) return toast.error('Title, category and price are required.');

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    images.forEach((img) => formData.append('images', img));
    if (existingImageURLs.length) formData.append('existingImages', JSON.stringify(existingImageURLs));

    const cleanedTiers = quantityPricing.filter((t) => t.minQty && t.price);
    if (cleanedTiers.length) formData.append('quantityPricing', JSON.stringify(cleanedTiers));

    try {
      if (editingId) {
        await api.put(`/api/listings/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/api/listings', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (ev) => setUploadProgress(Math.round((ev.loaded * 100) / ev.total)),
        });
        toast.success('Product created');
      }
      resetForm();
      const updated = await api.get('/api/listings');
      setListings(updated.data || []);
    } catch { toast.error('Submit failed.'); }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImages([]);
    setExistingImageURLs([]);
    setPreviewImages([]);
    setQuantityPricing([]);
    setUploadProgress(0);
    setEditingId(null);
    setShowModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title:          item.title || '',
      description:    item.description || '',
      category:       item.category || '',
      subcategory:    item.subcategory || '',
      religions:      item.religions || '',
      price:          item.price || '',
      badge:          item.badge || '',
      youtubeUrl:     item.youtubeUrl || '',
      instagramUrl:   item.instagramUrl || '',
      favorite:       item.favorite || '0',
      seoTitle:       item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      seoKeywords:    item.seoKeywords || '',
    });
    setExistingImageURLs(item.images || []);
    setImages([]);
    setPreviewImages((item.images || []).map((url) => ({ url, existing: true })));
    setQuantityPricing(item.quantityPricing || []);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/api/listings/${id}`);
    setListings(listings.filter((l) => l._id !== id));
    toast.success('Deleted');
  };

  const getName = (uuid, type) => {
    const list = dropdownData[type];
    const key = { categories: 'category_uuid', subcategories: 'subcategory_uuid', religions: 'religion_uuid' }[type];
    return list.find((i) => i[key] === uuid)?.name || uuid || '—';
  };

  const filtered = listings.filter((l) => l.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <Toaster position="top-right" />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-gray-900">Products</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#128C7E] transition-colors"
        >
          <FaPlus className="text-xs" /> Add Product
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#25D366]"
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Images</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Badge</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {(item.images || []).slice(0, 4).map((url, i) => (
                      <img key={i} src={url} alt="" className="h-10 w-10 cursor-pointer rounded-lg object-cover" onClick={() => setModalImageSrc(url)} />
                    ))}
                  </div>
                </td>
                <td className="max-w-[160px] truncate px-4 py-3 font-medium text-gray-800">{item.title}</td>
                <td className="px-4 py-3 text-gray-600">{getName(item.category, 'categories')}</td>
                <td className="px-4 py-3 font-semibold text-[#128C7E]">₹{item.price}</td>
                <td className="px-4 py-3">
                  {item.badge && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-[#128C7E]">{item.badge}</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"><FaEdit className="text-xs" /></button>
                    <button onClick={() => handleDelete(item._id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><FaTrash className="text-xs" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Image preview modal */}
      {modalImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setModalImageSrc(null)}>
          <img src={modalImageSrc} alt="Preview" className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-5 top-5 text-3xl text-white">&times;</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="font-serif text-xl font-bold text-gray-900">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={resetForm} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"><FaPlus className="rotate-45" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              {/* Basic info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Title *</label>
                  <input value={form.title} onChange={handleInput('title')} className="input-field" placeholder="Product title" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Description</label>
                  <textarea value={form.description} onChange={handleInput('description')} className="input-field min-h-[80px] resize-y" placeholder="Product description..." />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Category *</label>
                  <select value={form.category} onChange={handleInput('category')} className="input-field" required>
                    <option value="">Select category</option>
                    {dropdownData.categories.map((c) => <option key={c._id} value={c.category_uuid || c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Subcategory</label>
                  <select value={form.subcategory} onChange={handleInput('subcategory')} className="input-field">
                    <option value="">Select subcategory</option>
                    {dropdownData.subcategories.map((s) => <option key={s._id} value={s.subcategory_uuid || s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Religion / Occasion</label>
                  <select value={form.religions} onChange={handleInput('religions')} className="input-field">
                    <option value="">Select</option>
                    {dropdownData.religions.map((r) => <option key={r._id} value={r.religion_uuid || r._id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Base Price (₹) *</label>
                  <input value={form.price} onChange={handleInput('price')} className="input-field" placeholder="e.g. 49" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Badge</label>
                  <select value={form.badge} onChange={handleInput('badge')} className="input-field">
                    {BADGE_OPTIONS.map((b) => <option key={b} value={b}>{b || '— None —'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Featured</label>
                  <select value={form.favorite} onChange={handleInput('favorite')} className="input-field">
                    <option value="1">Yes — Featured</option>
                    <option value="0">No</option>
                  </select>
                </div>
              </div>

              {/* Quantity pricing tiers */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-600">Quantity Pricing Tiers</label>
                  <button type="button" onClick={addTier} className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-[#128C7E] hover:bg-green-100">+ Add Tier</button>
                </div>
                {quantityPricing.map((tier, i) => (
                  <div key={i} className="mb-2 flex items-center gap-2">
                    <input type="number" placeholder="Min qty" value={tier.minQty} onChange={(e) => updateTier(i, 'minQty', e.target.value)} className="input-field w-24" />
                    <input type="number" placeholder="Max qty" value={tier.maxQty} onChange={(e) => updateTier(i, 'maxQty', e.target.value)} className="input-field w-24" />
                    <input type="number" placeholder="Price ₹" value={tier.price} onChange={(e) => updateTier(i, 'price', e.target.value)} className="input-field w-24" />
                    <button type="button" onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600"><FaTrash className="text-xs" /></button>
                  </div>
                ))}
                {quantityPricing.length === 0 && <p className="text-xs text-gray-400">No tiers. Base price will be used.</p>}
              </div>

              {/* Images — up to 4 */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Product Images (max 4)
                </label>
                <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleImageUpload} className="mb-3 text-sm" />
                <div className="flex flex-wrap gap-2">
                  {existingImageURLs.map((url, i) => (
                    <div key={`ex-${i}`} className="group relative">
                      <img src={url} className="h-20 w-20 rounded-xl object-cover ring-2 ring-gray-200" alt="" />
                      <button type="button" onClick={() => removeExistingImage(i)} className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex">
                        <FaTrash className="text-[8px]" />
                      </button>
                    </div>
                  ))}
                  {previewImages.filter((p) => !p.existing).map((img, i) => (
                    <div key={`new-${i}`} className="group relative">
                      <img src={img.url} className="h-20 w-20 rounded-xl object-cover ring-2 ring-[#25D366]/40" alt="" />
                      <button type="button" onClick={() => removeNewImage(i)} className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex">
                        <FaTrash className="text-[8px]" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-400">{4 - existingImageURLs.length - images.length} slot(s) remaining</p>
              </div>

              {/* Media links */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">YouTube Video URL</label>
                  <input value={form.youtubeUrl} onChange={handleInput('youtubeUrl')} className="input-field" placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Instagram Post URL</label>
                  <input value={form.instagramUrl} onChange={handleInput('instagramUrl')} className="input-field" placeholder="https://instagram.com/p/..." />
                </div>
              </div>

              {/* SEO — collapsible */}
              <div>
                <button type="button" onClick={() => setSeoOpen((p) => !p)} className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-700">
                  {seoOpen ? '▼' : '▶'} SEO Settings (optional)
                </button>
                {seoOpen && (
                  <div className="mt-3 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <input value={form.seoTitle} onChange={handleInput('seoTitle')} className="input-field" placeholder="SEO Title" />
                    <textarea value={form.seoDescription} onChange={handleInput('seoDescription')} className="input-field resize-none" rows={2} placeholder="SEO Description" />
                    <input value={form.seoKeywords} onChange={handleInput('seoKeywords')} className="input-field" placeholder="keyword1, keyword2, ..." />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button type="button" onClick={resetForm} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="rounded-xl bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#128C7E] disabled:opacity-60 transition-colors">
                  {loading ? `Uploading… ${uploadProgress}%` : editingId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateListing;
