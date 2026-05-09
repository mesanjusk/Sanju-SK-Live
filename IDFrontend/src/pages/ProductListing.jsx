import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaFilter, FaTimes, FaSearch, FaSort } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import api from '../api';

const SORT_OPTIONS = [
  { value: '', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [religions, setReligions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('919999999999');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    religion: searchParams.get('religion') || '',
    sort: searchParams.get('sort') || '',
  });

  const loadDropdowns = async () => {
    const [catRes, subRes, relRes, confiRes] = await Promise.all([
      api.get('/api/categories'),
      api.get('/api/subcategories'),
      api.get('/api/religions/GetReligionList'),
      api.get('/api/confi/GetConfiList'),
    ]);
    setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.result || []);
    setSubcategories(Array.isArray(subRes.data) ? subRes.data : subRes.data?.result || []);
    setReligions(relRes.data?.result || []);
    if (confiRes.data?.success && confiRes.data.result.length > 0) {
      const c = confiRes.data.result[0];
      setWhatsappNumber(c.whatsappNumber || c.phone || '919999999999');
    }
  };

  const loadProducts = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = {};
      if (f.search) params.search = f.search;
      if (f.category) params.category = f.category;
      if (f.subcategory) params.subcategory = f.subcategory;
      if (f.religion) params.religion = f.religion;
      if (f.sort) params.sort = f.sort;
      const res = await api.get('/api/listings', { params });
      const data = Array.isArray(res.data) ? res.data : res.data?.result || [];
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    loadProducts(filters);
    const newParams = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) newParams[k] = v; });
    setSearchParams(newParams, { replace: true });
  }, [filters]);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters({ search: '', category: '', subcategory: '', religion: '', sort: '' });

  const activeCount = [filters.category, filters.subcategory, filters.religion].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Category</h3>
        <div className="space-y-1">
          <button
            onClick={() => setFilter('category', '')}
            className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${!filters.category ? 'bg-[#25D366]/10 font-semibold text-[#128C7E]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => { setFilter('category', cat.category_uuid || cat._id); setFilter('subcategory', ''); }}
              className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${filters.category === (cat.category_uuid || cat._id) ? 'bg-[#25D366]/10 font-semibold text-[#128C7E]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      {subcategories.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Subcategory</h3>
          <div className="space-y-1">
            <button onClick={() => setFilter('subcategory', '')} className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${!filters.subcategory ? 'bg-[#25D366]/10 font-semibold text-[#128C7E]' : 'text-gray-600 hover:bg-gray-50'}`}>All</button>
            {subcategories.map((s) => (
              <button key={s._id} onClick={() => setFilter('subcategory', s.subcategory_uuid || s._id)} className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${filters.subcategory === (s.subcategory_uuid || s._id) ? 'bg-[#25D366]/10 font-semibold text-[#128C7E]' : 'text-gray-600 hover:bg-gray-50'}`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Religion */}
      {religions.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Religion / Occasion</h3>
          <div className="space-y-1">
            <button onClick={() => setFilter('religion', '')} className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${!filters.religion ? 'bg-[#25D366]/10 font-semibold text-[#128C7E]' : 'text-gray-600 hover:bg-gray-50'}`}>All</button>
            {religions.map((r) => (
              <button key={r._id} onClick={() => setFilter('religion', r.religion_uuid || r._id)} className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${filters.religion === (r.religion_uuid || r._id) ? 'bg-[#25D366]/10 font-semibold text-[#128C7E]' : 'text-gray-600 hover:bg-gray-50'}`}>
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeCount > 0 && (
        <button onClick={clearFilters} className="w-full rounded-xl border border-red-200 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">All Products</h1>
          <p className="mt-1 text-sm text-gray-500">{loading ? '...' : `${products.length} products found`}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top bar: Search + Sort + Filter toggle */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Search products..."
              className="input-field pl-9"
            />
          </div>

          <select
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            className="input-field w-full sm:w-48"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-[#25D366] hover:text-[#128C7E] transition-colors lg:hidden"
          >
            <FaFilter className="text-xs" />
            Filters {activeCount > 0 && <span className="rounded-full bg-[#25D366] px-1.5 py-0.5 text-xs text-white">{activeCount}</span>}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar — desktop */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Filters</h2>
                {activeCount > 0 && (
                  <span className="rounded-full bg-[#25D366] px-2 py-0.5 text-xs font-bold text-white">{activeCount}</span>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile sidebar drawer */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden" onClick={() => setSidebarOpen(false)}>
              <div className="absolute inset-0 bg-black/40" />
              <aside className="relative ml-auto h-full w-72 overflow-y-auto bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100">
                    <FaTimes />
                  </button>
                </div>
                <FilterPanel />
              </aside>
            </div>
          )}

          {/* Products grid */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => <LoadingSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 text-5xl">🔍</div>
                <h3 className="font-serif text-xl font-semibold text-gray-700">No products found</h3>
                <p className="mt-2 text-sm text-gray-500">Try different filters or search terms.</p>
                <button onClick={clearFilters} className="mt-4 btn-whatsapp">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} whatsappNumber={whatsappNumber} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
