import {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FaFilter,
  FaTimes,
  FaSearch,
  FaSort,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import api from '../api';

import MobileHeader from '../components/mobile/MobileHeader';
import MobileBottomNav from '../components/mobile/MobileBottomNav';
import MobileSearchBar from '../components/mobile/MobileSearchBar';
import ExploreGrid from '../components/mobile/ExploreGrid';

const SORT_OPTIONS = [
  { value: '', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const PRODUCTS_PER_PAGE = 9;

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [religions, setReligions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [whatsappNumber, setWhatsappNumber] =
    useState('919999999999');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    religion: searchParams.get('religion') || '',
    sort: searchParams.get('sort') || '',
  });

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );

  const [currentPage, setCurrentPage] = useState(1);

  /* ---------------------------------- */
  /* Debounced Search */
  /* ---------------------------------- */

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchTerm,
      }));
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* ---------------------------------- */
  /* Load Dropdowns */
  /* ---------------------------------- */

  const loadDropdowns = async () => {
    try {
      const [catRes, subRes, relRes, confiRes] =
        await Promise.all([
          api.get('/api/categories'),
          api.get('/api/subcategories'),
          api.get('/api/religions/GetReligionList'),
          api.get('/api/confi/GetConfiList'),
        ]);

      setCategories(
        Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.result || []
      );

      setSubcategories(
        Array.isArray(subRes.data)
          ? subRes.data
          : subRes.data?.result || []
      );

      setReligions(relRes.data?.result || []);

      if (
        confiRes.data?.success &&
        confiRes.data.result.length > 0
      ) {
        const c = confiRes.data.result[0];

        setWhatsappNumber(
          c.whatsappNumber ||
            c.phone ||
            '919999999999'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------------------------- */
  /* Load Products */
  /* ---------------------------------- */

  const loadProducts = useCallback(async (f) => {
    setLoading(true);
    setError('');

    try {
      const params = {};

      if (f.search) params.search = f.search;
      if (f.category) params.category = f.category;
      if (f.subcategory)
        params.subcategory = f.subcategory;
      if (f.religion) params.religion = f.religion;
      if (f.sort) params.sort = f.sort;

      const res = await api.get('/api/listings', {
        params,
      });

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.result || [];

      setProducts(data);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------------------------- */
  /* Effects */
  /* ---------------------------------- */

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    loadProducts(filters);

    const newParams = {};

    Object.entries(filters).forEach(([k, v]) => {
      if (v) newParams[k] = v;
    });

    setSearchParams(newParams, {
      replace: true,
    });
  }, [filters, loadProducts, setSearchParams]);

  /* ---------------------------------- */
  /* Helpers */
  /* ---------------------------------- */

  const setFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      subcategory: '',
      religion: '',
      sort: '',
    });

    setSearchTerm('');
    setCurrentPage(1);
  };

  const activeCount = useMemo(() => {
    return [
      filters.category,
      filters.subcategory,
      filters.religion,
    ].filter(Boolean).length;
  }, [filters]);

  /* ---------------------------------- */
  /* Filtered Subcategories */
  /* ---------------------------------- */

  const filteredSubcategories = useMemo(() => {
    if (!filters.category) return subcategories;

    return subcategories.filter(
      (s) =>
        s.category_uuid === filters.category ||
        s.categoryId === filters.category
    );
  }, [filters.category, subcategories]);

  /* ---------------------------------- */
  /* Pagination */
  /* ---------------------------------- */

  const totalPages = Math.ceil(
    products.length / PRODUCTS_PER_PAGE
  );

  const paginatedProducts = useMemo(() => {
    const start =
      (currentPage - 1) * PRODUCTS_PER_PAGE;

    return products.slice(
      start,
      start + PRODUCTS_PER_PAGE
    );
  }, [products, currentPage]);

  /* ---------------------------------- */
  /* Filter Panel */
  /* ---------------------------------- */

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-gray-800">
          Category
        </h3>

        <div className="space-y-1">
          <button
            onClick={() => setFilter('category', '')}
            className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-all ${
              !filters.category
                ? 'bg-[#25D366]/10 font-semibold text-[#128C7E]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  category:
                    cat.category_uuid || cat._id,
                  subcategory: '',
                }));

                setCurrentPage(1);
              }}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-all ${
                filters.category ===
                (cat.category_uuid || cat._id)
                  ? 'bg-[#25D366]/10 font-semibold text-[#128C7E]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      {filteredSubcategories.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-gray-800">
            Subcategory
          </h3>

          <div className="space-y-1">
            <button
              onClick={() =>
                setFilter('subcategory', '')
              }
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-all ${
                !filters.subcategory
                  ? 'bg-[#25D366]/10 font-semibold text-[#128C7E]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>

            {filteredSubcategories.map((s) => (
              <button
                key={s._id}
                onClick={() =>
                  setFilter(
                    'subcategory',
                    s.subcategory_uuid || s._id
                  )
                }
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-all ${
                  filters.subcategory ===
                  (s.subcategory_uuid || s._id)
                    ? 'bg-[#25D366]/10 font-semibold text-[#128C7E]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Religion */}
      {religions.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-gray-800">
            Religion / Occasion
          </h3>

          <div className="space-y-1">
            <button
              onClick={() => setFilter('religion', '')}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-all ${
                !filters.religion
                  ? 'bg-[#25D366]/10 font-semibold text-[#128C7E]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>

            {religions.map((r) => (
              <button
                key={r._id}
                onClick={() =>
                  setFilter(
                    'religion',
                    r.religion_uuid || r._id
                  )
                }
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-all ${
                  filters.religion ===
                  (r.religion_uuid || r._id)
                    ? 'bg-[#25D366]/10 font-semibold text-[#128C7E]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear */}
      {activeCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-500 transition-all hover:bg-red-50"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <MobileHeader />
      <MobileSearchBar value={searchTerm} onChange={setSearchTerm} />
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            All Products
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {loading
              ? 'Loading products...'
              : `${products.length} products found`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Sticky Top Bar */}
        <div className="sticky top-16 z-20 mb-6 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search products..."
                className="input-field pl-10"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <FaSort className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilter('sort', e.target.value)
                }
                className="input-field w-full pl-10 sm:w-56"
              >
                {SORT_OPTIONS.map((o) => (
                  <option
                    key={o.value}
                    value={o.value}
                  >
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Filter */}
            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:border-[#25D366] hover:text-[#128C7E] lg:hidden"
            >
              <FaFilter className="text-xs" />

              Filters

              {activeCount > 0 && (
                <span className="rounded-full bg-[#25D366] px-2 py-0.5 text-xs font-bold text-white">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-32 rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-sm backdrop-blur-md">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">
                  Filters
                </h2>

                {activeCount > 0 && (
                  <span className="rounded-full bg-[#25D366] px-2 py-1 text-xs font-bold text-white">
                    {activeCount}
                  </span>
                )}
              </div>

              <FilterPanel />
            </div>
          </aside>

          {/* Mobile Drawer */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              <aside
                className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-white p-5 shadow-2xl"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">
                    Filters
                  </h2>

                  <button
                    onClick={() =>
                      setSidebarOpen(false)
                    }
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                  >
                    <FaTimes />
                  </button>
                </div>

                <FilterPanel />
              </aside>
            </div>
          )}

          {/* Products */}
          <main className="min-w-0 flex-1">
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <LoadingSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center">
                <img
                  src="/empty-products.svg"
                  alt="No products"
                  className="mb-5 h-40"
                />

                <h3 className="font-serif text-2xl font-bold text-gray-700">
                  No products found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Try different filters or search
                  terms.
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#128C7E]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {paginatedProducts.map(
                    (product) => (
                      <div
                        key={product._id}
                        className="transition-all duration-300 hover:-translate-y-1"
                      >
                        <ProductCard product={product} />
                      </div>
                    )
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    {/* Prev */}
                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage(
                          (p) => p - 1
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:border-[#25D366] hover:text-[#128C7E] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaChevronLeft />
                    </button>

                    {/* Pages */}
                    {[...Array(totalPages)].map(
                      (_, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            setCurrentPage(i + 1)
                          }
                          className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                            currentPage === i + 1
                              ? 'bg-[#25D366] text-white shadow-md'
                              : 'border border-gray-200 bg-white text-gray-700 hover:border-[#25D366] hover:text-[#128C7E]'
                          }`}
                        >
                          {i + 1}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      disabled={
                        currentPage === totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (p) => p + 1
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:border-[#25D366] hover:text-[#128C7E] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      {!loading && !error && products.length > 0 && (
        <section className="mt-6">
          <h3 className="px-4 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Explore</h3>
          <ExploreGrid products={products.slice(0, 15)} />
        </section>
      )}
      <MobileBottomNav />
    </div>
  );
}