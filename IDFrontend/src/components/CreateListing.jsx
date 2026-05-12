import { useState, useRef, useEffect } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import toast, { Toaster } from 'react-hot-toast';
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
} from 'react-icons/fa';

const BADGE_OPTIONS = ['', 'NEW', 'POPULAR', 'HOT', 'HOT DEAL'];

const emptyForm = {
  title: '',
  description: '',
  category: '',
  subcategory: '',
  religions: '',
  price: '',
  badge: '',
  youtubeUrl: '',
  instagramUrl: '',
  favorite: '0',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
};

const steps = [
  'Basic Info',
  'Pricing',
  'Images',
  'Media & SEO',
];

const CreateListing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(0);

  const [existingImageURLs, setExistingImageURLs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [quantityPricing, setQuantityPricing] = useState([]);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [dropdownData, setDropdownData] = useState({
    categories: [],
    subcategories: [],
    religions: [],
  });

  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalImageSrc, setModalImageSrc] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const user =
      location.state?.id || localStorage.getItem('User_name');

    if (!user) navigate('/login');
  }, []);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [catRes, subRes, relRes, listRes] =
          await Promise.all([
            api.get('/api/categories'),
            api.get('/api/subcategories'),
            api.get('/api/religions/GetReligionList'),
            api.get('/api/listings'),
          ]);

        setDropdownData({
          categories: Array.isArray(catRes.data)
            ? catRes.data
            : catRes.data?.result || [],

          subcategories: Array.isArray(subRes.data)
            ? subRes.data
            : subRes.data?.result || [],

          religions: relRes.data?.result || [],
        });

        setListings(listRes.data || []);
      } catch {
        toast.error('Failed to load dropdown data.');
      }
    };

    fetchDropdowns();
  }, []);

  const handleInput = (field) => (e) => {
    const value = e?.target?.value ?? e;

    if (
      field === 'price' &&
      value &&
      !/^\d*\.?\d*$/.test(value)
    )
      return;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ---------------- IMAGE ---------------- */

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    const valid = files.filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(
        f.type
      )
    );

    if (valid.length !== files.length) {
      toast('Some files skipped (invalid type).');
    }

    const totalAllowed =
      4 - existingImageURLs.length - images.length;

    if (valid.length > totalAllowed) {
      toast.error(
        `Max 4 images total. You can add ${totalAllowed} more.`
      );
      return;
    }

    setLoading(true);

    const compressed = [];

    for (const file of valid) {
      const blob = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      compressed.push(
        new File([blob], `${Date.now()}-${file.name}`, {
          type: blob.type,
        })
      );
    }

    const all = [...images, ...compressed];

    setImages(all);

    setPreviewImages(
      all.map((f) => ({
        url: URL.createObjectURL(f),
      }))
    );

    setLoading(false);
  };

  const removeNewImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);

    setImages(updated);

    setPreviewImages(
      updated.map((f) => ({
        url: URL.createObjectURL(f),
      }))
    );
  };

  const removeExistingImage = (idx) => {
    setExistingImageURLs((prev) =>
      prev.filter((_, i) => i !== idx)
    );
  };

  /* ---------------- TIERS ---------------- */

  const QUICK_QTYS = [100, 200, 500, 1000, 2000];
  const addQuickTiers = () =>
    setQuantityPricing(
      QUICK_QTYS.map((qty, i) => ({
        minQty: qty,
        maxQty: i < QUICK_QTYS.length - 1 ? QUICK_QTYS[i + 1] - 1 : '',
        price: '',
      }))
    );

  const addTier = () =>
    setQuantityPricing((prev) => [
      ...prev,
      {
        minQty: '',
        maxQty: '',
        price: '',
      },
    ]);

  const removeTier = (i) =>
    setQuantityPricing((prev) =>
      prev.filter((_, idx) => idx !== i)
    );

  const updateTier = (i, field, value) => {
    setQuantityPricing((prev) =>
      prev.map((t, idx) =>
        idx === i ? { ...t, [field]: value } : t
      )
    );
  };

  /* ---------------- VALIDATION ---------------- */

  const validateStep = () => {
    if (currentStep === 0) {
      if (!form.title) {
        toast.error('Title is required');
        return false;
      }

      if (!form.category) {
        toast.error('Category is required');
        return false;
      }
    }

    if (currentStep === 1) {
      const validTiers = quantityPricing.filter((t) => t.minQty && t.price);
      if (validTiers.length === 0) {
        toast.error('At least one quantity pricing tier is required');
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(form).forEach(([k, v]) =>
      formData.append(k, v)
    );

    images.forEach((img) =>
      formData.append('images', img)
    );

    if (existingImageURLs.length) {
      formData.append(
        'existingImages',
        JSON.stringify(existingImageURLs)
      );
    }

    const cleanedTiers = quantityPricing.filter(
      (t) => t.minQty && t.price
    );

    if (cleanedTiers.length) {
      formData.append(
        'quantityPricing',
        JSON.stringify(cleanedTiers)
      );
      const minPrice = Math.min(...cleanedTiers.map((t) => Number(t.price)));
      formData.set('price', minPrice);
    }

    try {
      if (editingId) {
        await api.put(
          `/api/listings/${editingId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        toast.success('Product updated');
      } else {
        await api.post('/api/listings', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },

          onUploadProgress: (ev) =>
            setUploadProgress(
              Math.round((ev.loaded * 100) / ev.total)
            ),
        });

        toast.success('Product created');
      }

      resetForm();

      const updated = await api.get('/api/listings');

      setListings(updated.data || []);
    } catch {
      toast.error('Submit failed.');
    }
  };

  /* ---------------- RESET ---------------- */

  const resetForm = () => {
    setForm(emptyForm);
    setImages([]);
    setExistingImageURLs([]);
    setPreviewImages([]);
    setQuantityPricing([]);
    setUploadProgress(0);
    setEditingId(null);
    setShowModal(false);
    setCurrentStep(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* ---------------- EDIT ---------------- */

  const handleEdit = (item) => {
    setEditingId(item._id);

    setForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      subcategory: item.subcategory || '',
      religions: item.religions || '',
      price: item.price || '',
      badge: item.badge || '',
      youtubeUrl: item.youtubeUrl || '',
      instagramUrl: item.instagramUrl || '',
      favorite: item.favorite || '0',
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      seoKeywords: item.seoKeywords || '',
    });

    setExistingImageURLs(item.images || []);

    setPreviewImages(
      (item.images || []).map((url) => ({
        url,
        existing: true,
      }))
    );

    setQuantityPricing(item.quantityPricing || []);

    setShowModal(true);
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    await api.delete(`/api/listings/${id}`);

    setListings(
      listings.filter((l) => l._id !== id)
    );

    toast.success('Deleted');
  };

  const getName = (uuid, type) => {
    const list = dropdownData[type];

    const key = {
      categories: 'category_uuid',
      subcategories: 'subcategory_uuid',
      religions: 'religion_uuid',
    }[type];

    return (
      list.find((i) => i[key] === uuid)?.name ||
      uuid ||
      '—'
    );
  };

  const filtered = listings.filter((l) =>
    l.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Toaster position="top-right" />

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Products
        </h2>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
        >
          <FaPlus className="text-xs" />
          Add Product
        </button>
      </div>

      {/* SEARCH */}

      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(e.target.value)
        }
        className="mb-4 w-full max-w-sm rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#25D366]"
      />

      {/* TABLE */}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">
                Images
              </th>
              <th className="px-4 py-3 text-left">
                Title
              </th>
              <th className="px-4 py-3 text-left">
                Category
              </th>
              <th className="px-4 py-3 text-left">
                Price
              </th>
              <th className="px-4 py-3 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr
                key={item._id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {(item.images || [])
                      .slice(0, 4)
                      .map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ))}
                  </div>
                </td>

                <td className="px-4 py-3 font-medium">
                  {item.title}
                </td>

                <td className="px-4 py-3">
                  {getName(
                    item.category,
                    'categories'
                  )}
                </td>

                <td className="px-4 py-3 font-semibold text-[#128C7E]">
                  ₹{item.price}
                </td>

                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleEdit(item)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"
                    >
                      <FaEdit className="text-xs" />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(item._id)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="border-b border-gray-100 px-6 py-5">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingId
                    ? 'Edit Product'
                    : 'Create Product'}
                </h3>

                <button
                  onClick={resetForm}
                  className="rounded-full bg-gray-100 p-2"
                >
                  ✕
                </button>
              </div>

              {/* STEPPER */}

              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className="flex flex-1 items-center"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                          currentStep >= index
                            ? 'bg-[#25D366] text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {currentStep > index ? (
                          <FaCheck />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <span className="mt-2 text-xs font-medium text-gray-600">
                        {step}
                      </span>
                    </div>

                    {index !== steps.length - 1 && (
                      <div
                        className={`mx-2 h-1 flex-1 rounded ${
                          currentStep > index
                            ? 'bg-[#25D366]'
                            : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* BODY */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              {/* STEP 1 */}

              {currentStep === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      Product Title *
                    </label>

                    <input
                      value={form.title}
                      onChange={handleInput('title')}
                      className="input-field"
                      placeholder="Enter title"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      Description
                    </label>

                    <textarea
                      value={form.description}
                      onChange={handleInput(
                        'description'
                      )}
                      className="input-field min-h-[120px]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <select
                      value={form.category}
                      onChange={handleInput(
                        'category'
                      )}
                      className="input-field"
                    >
                      <option value="">
                        Select category
                      </option>

                      {dropdownData.categories.map(
                        (c) => (
                          <option
                            key={c._id}
                            value={
                              c.category_uuid ||
                              c._id
                            }
                          >
                            {c.name}
                          </option>
                        )
                      )}
                    </select>

                    <select
                      value={form.subcategory}
                      onChange={handleInput(
                        'subcategory'
                      )}
                      className="input-field"
                    >
                      <option value="">
                        Select subcategory
                      </option>

                      {dropdownData.subcategories.map(
                        (s) => (
                          <option
                            key={s._id}
                            value={
                              s.subcategory_uuid ||
                              s._id
                            }
                          >
                            {s.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2 */}

              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <select
                      value={form.badge}
                      onChange={handleInput('badge')}
                      className="input-field"
                    >
                      {BADGE_OPTIONS.map((b) => (
                        <option
                          key={b}
                          value={b}
                        >
                          {b || 'No Badge'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TIERS */}

                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">
                        Quantity Pricing
                      </h4>
                      <button
                        type="button"
                        onClick={addQuickTiers}
                        className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        title="Pre-fill tiers: 100 / 200 / 500 / 1000 / 2000 qty — fill in rates"
                      >
                        ⚡ Quick: 100/200/500/1000/2000
                      </button>
                      <button
                        type="button"
                        onClick={addTier}
                        className="rounded-lg bg-gray-900 px-3 py-1 text-sm font-semibold text-white"
                      >
                        + Add Tier
                      </button>
                    </div>

                    {quantityPricing.map(
                      (tier, i) => (
                        <div
                          key={i}
                          className="mb-2 flex gap-2"
                        >
                          <input
                            type="number"
                            placeholder="Min"
                            value={tier.minQty}
                            onChange={(e) =>
                              updateTier(
                                i,
                                'minQty',
                                e.target.value
                              )
                            }
                            className="input-field"
                          />

                          <input
                            type="number"
                            placeholder="Max"
                            value={tier.maxQty}
                            onChange={(e) =>
                              updateTier(
                                i,
                                'maxQty',
                                e.target.value
                              )
                            }
                            className="input-field"
                          />

                          <input
                            type="number"
                            placeholder="Price"
                            value={tier.price}
                            onChange={(e) =>
                              updateTier(
                                i,
                                'price',
                                e.target.value
                              )
                            }
                            className="input-field"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeTier(i)
                            }
                            className="text-red-500"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3 */}

              {currentStep === 2 && (
                <div>
                  <label className="mb-3 block font-semibold">
                    Product Images
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-4"
                  />

                  <div className="flex flex-wrap gap-3">
                    {existingImageURLs.map(
                      (url, i) => (
                        <div
                          key={i}
                          className="relative"
                        >
                          <img
                            src={url}
                            className="h-24 w-24 rounded-2xl object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeExistingImage(i)
                            }
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      )
                    )}

                    {previewImages
                      .filter((p) => !p.existing)
                      .map((img, i) => (
                        <div
                          key={i}
                          className="relative"
                        >
                          <img
                            src={img.url}
                            className="h-24 w-24 rounded-2xl object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeNewImage(i)
                            }
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* STEP 4 */}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <input
                    value={form.youtubeUrl}
                    onChange={handleInput(
                      'youtubeUrl'
                    )}
                    className="input-field"
                    placeholder="YouTube URL"
                  />

                  <input
                    value={form.instagramUrl}
                    onChange={handleInput(
                      'instagramUrl'
                    )}
                    className="input-field"
                    placeholder="Instagram URL"
                  />

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <h4 className="mb-3 font-semibold">
                      SEO Settings
                    </h4>

                    <div className="space-y-3">
                      <input
                        value={form.seoTitle}
                        onChange={handleInput(
                          'seoTitle'
                        )}
                        className="input-field"
                        placeholder="SEO Title"
                      />

                      <textarea
                        value={form.seoDescription}
                        onChange={handleInput(
                          'seoDescription'
                        )}
                        className="input-field"
                        rows={3}
                        placeholder="SEO Description"
                      />

                      <input
                        value={form.seoKeywords}
                        onChange={handleInput(
                          'seoKeywords'
                        )}
                        className="input-field"
                        placeholder="Keywords"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER */}

              <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
                >
                  <FaChevronLeft />
                  Previous
                </button>

                {currentStep === steps.length - 1 ? (
                  <button
                    type="submit"
                    className="rounded-xl bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white"
                  >
                    {loading
                      ? `Uploading ${uploadProgress}%`
                      : editingId
                      ? 'Update Product'
                      : 'Create Product'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white"
                  >
                    Next
                    <FaChevronRight />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateListing;