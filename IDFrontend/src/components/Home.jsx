import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api';
import FestiveStorefrontHero from './mobile/FestiveStorefrontHero';
import { Link } from 'react-router-dom';
import StoryCategories from './mobile/StoryCategories';
import ProductFeedCard from './mobile/ProductFeedCard';
import VideoFeedCard from './mobile/VideoFeedCard';
import MobileBottomNav from './mobile/MobileBottomNav';
import LoadingSkeleton from './common/LoadingSkeleton';
import ScrollGatePopup from './ScrollGatePopup';
import FAQSection from './FAQSection';
import LocalContactFooter from './LocalContactFooter';

// Fisher-Yates shuffle — new order on every page load
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Interleave videos into the product feed every N products
function interleaveFeed(products, videos) {
  if (!videos.length) return products.map((p) => ({ ...p, _feedType: 'product' }));
  const result = [];
  let vIdx = 0;
  products.forEach((p, i) => {
    result.push({ ...p, _feedType: 'product' });
    // Insert a video after every 5th product
    if ((i + 1) % 5 === 0 && vIdx < videos.length) {
      result.push({ ...videos[vIdx++], _feedType: 'video' });
    }
  });
  return result;
}

export default function Home() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const loadMoreRef = useRef(null);
  const hasShownPopup = useRef(false);

  useEffect(() => {
    let active = true;
    let retryTimer;
    // The product feed must not wait for secondary APIs (videos, configs, etc).
    // A slower optional service must never hold back products on a cold start.
    const loadProducts = async () => {
      try {
        const response = await api.get('/api/listings', { timeout: 12000 });
        if (!active) return;
        const rows = Array.isArray(response.data) ? response.data : response.data?.result;
        if (!Array.isArray(rows)) throw new Error('Unexpected product API format');
        setListings(rows);
        setLoadError(false);
      } catch {
        if (!active) return;
        setLoadError(true);
        retryTimer = setTimeout(loadProducts, 20000);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProducts();
    api.get('/api/categories', { timeout: 12000 })
      .then(res => { if (active) setCategories(Array.isArray(res.data) ? res.data : res.data?.result || []); })
      .catch(() => {});
    api.get('/api/subcategories', { timeout: 12000 })
      .then(res => { if (active) setSubcategories(Array.isArray(res.data) ? res.data : res.data?.result || []); })
      .catch(() => {});
    api.get('/api/confi/GetConfiList', { timeout: 12000 })
      .then(res => { if (active) setConfig(res.data?.result?.[0] || {}); })
      .catch(() => {});
    api.get('/api/videos', { timeout: 12000 })
      .then(res => { if (active) setVideos(Array.isArray(res.data) ? res.data : res.data?.result || []); })
      .catch(() => {});
    return () => { active = false; clearTimeout(retryTimer); };
  }, [reloadKey]);

  const shuffled = useMemo(() => shuffle(listings), [listings]);

  const visibleSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategories.filter(
      (s) => s.categoryId?._id === selectedCategory._id || s.categoryId === selectedCategory._id
    );
  }, [subcategories, selectedCategory]);

  const categoryById = useMemo(() => {
    const index = new Map();
    for (const category of categories) {
      if (category._id) index.set(String(category._id), category);
      if (category.category_uuid) index.set(String(category.category_uuid), category);
    }
    return index;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    const categoryIds = selectedCategory
      ? [selectedCategory._id, selectedCategory.category_uuid].filter(Boolean).map(String)
      : null;
    const selectedSubId = selectedSubcategory?._id;
    const matched = shuffled.filter((product) => {
      const productCategoryId = String(product.category?._id || product.category || '');
      if (categoryIds && !categoryIds.includes(productCategoryId)) return false;
      if (selectedSubcategory &&
          product.subcategory !== selectedSubId &&
          product.subcategory !== selectedSubcategory.name) return false;
      if (!query) return true;
      const assignedCategory = categoryById.get(productCategoryId);
      const searchable = [product.title, product.description, assignedCategory?.name]
        .filter(Boolean).join(' ').toLowerCase();
      return searchable.includes(query);
    });
    return selectedCategory || query ? matched : matched.slice(0, 40);
  }, [shuffled, categoryById, selectedCategory, selectedSubcategory, deferredSearch]);

  // Videos belong to the discovery feed, not filtered product results.
  const feed = useMemo(() => {
    if (selectedCategory || deferredSearch.trim()) {
      return filteredProducts.map((product) => ({ ...product, _feedType: 'product' }));
    }
    return interleaveFeed(filteredProducts, shuffle(videos));
  }, [filteredProducts, videos, selectedCategory, deferredSearch]);

  // Progressive feed: render only the first 8 cards and extend near the viewport.
  // This avoids initializing dozens of 3D viewers and image nodes on first paint.
  useEffect(() => { setVisibleCount(8); }, [selectedCategory, selectedSubcategory, deferredSearch]);
  useEffect(() => {
    if (visibleCount >= feed.length || !loadMoreRef.current) return;
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount(count => Math.min(count + 8, feed.length));
    }, { rootMargin: '480px 0px', threshold: 0 });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, feed.length]);

  const handleCategorySelect = (cat) => {
    setSearchTerm('');
    if (!cat) { setSelectedCategory(null); setSelectedSubcategory(null); return; }
    setSelectedCategory((prev) => {
      if (prev?._id === cat._id) { setSelectedSubcategory(null); return null; }
      setSelectedSubcategory(null);
      return cat;
    });
  };

  const handleSubcategorySelect = (sub) => {
    setSelectedSubcategory((prev) => (prev?._id === sub._id ? null : sub));
  };

  const handleHeroCategorySelect = (category) => {
    handleCategorySelect(category);
    if (category) requestAnimationFrame(() =>
      document.getElementById('sk-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleProductView = useCallback((id) => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size >= 10 && !hasShownPopup.current) {
        hasShownPopup.current = true;
        setShowPopup(true);
      }
      return next;
    });
  }, []);

  return (
    <div className="sk-storefront sk-festive-home min-h-screen pb-24">
      <FestiveStorefrontHero
        listings={listings}
        categories={categories}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategorySelect={handleHeroCategorySelect}
        whatsappNumber={config.whatsappNumber || config.phone || '919372333633'}
      />
      <main className="mx-auto w-full max-w-2xl py-1">
        <div className="sk-section-label sk-festive-collections-label">
          <div><span className="sk-festive-eyebrow">CURATED FOR YOU</span><h2>Explore collections</h2><p>Find your next favourite design</p></div>
          <Link to="/allCategories">View all →</Link>
        </div>
        <StoryCategories
          categories={categories.slice(0, 12)}
          onSelect={handleCategorySelect}
          selectedId={selectedCategory?._id}
        />

        {visibleSubcategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
            {visibleSubcategories.map((sub) => (
              <button
                key={sub._id}
                onClick={() => handleSubcategorySelect(sub)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                  selectedSubcategory?._id === sub._id
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        <div className="sk-section-label" id="sk-products" style={{ paddingTop: 20, scrollMarginTop: 16 }}>
          <div><h2>{deferredSearch.trim() ? 'Search results' : selectedCategory ? selectedCategory.name : 'The latest creations'}</h2><p>{deferredSearch.trim() ? 'Showing matches for “' + deferredSearch.trim() + '”' : 'Discover your next favourite design'}</p></div>
          <Link to="/products">All products →</Link>
        </div>
        <section className="mt-1">
          {loading ? (
            <div className="grid gap-4 p-4">
              {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} />)}
            </div>
          ) : feed.length > 0 ? (
            feed.slice(0, visibleCount).map((item, index) =>
              item._feedType === 'video' ? (
                <VideoFeedCard key={`v-${item._id}`} video={item} />
              ) : (
                <ProductFeedCard
                  key={item._id}
                  product={item}
                  whatsappNumber={config.whatsappNumber || config.phone || '919372333633'}
                  onView={handleProductView}
                  priority={index === 0}
                />
              )
            )
          ) : loadError ? (
              <div role="alert" className="mx-4 my-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-gray-700">
                Our online catalog is temporarily offline. Please contact us for product photos and pricing; this page retries automatically.
                <button type="button" onClick={() => { setLoading(true); setLoadError(false); setReloadKey((v) => v + 1); }}
                  className="mt-3 block w-full rounded-lg bg-[#075E54] px-4 py-2 font-semibold text-white">Retry loading products</button>
                <a className="mt-3 block text-sm font-bold text-[#245f43] underline" href="https://wa.me/919372333633?text=Hello%2C%20please%20share%20your%20product%20catalog">Request catalog on WhatsApp</a>
              </div>
            ) : (
              <div className="mx-4 my-10 rounded-2xl bg-white p-8 text-center text-sm text-gray-600">
                No matching designs found. Try another collection or search.
                <button type="button" onClick={() => { handleSearchChange(''); setSelectedCategory(null); }}
                  className="mx-auto mt-4 block rounded-full bg-[#07566a] px-5 py-2 font-bold text-white">Show all designs</button>
              </div>
            )}
          {feed.length > visibleCount && !loading && (
            <div ref={loadMoreRef} className="px-4 pb-4 pt-2 text-center">
              <button type="button" className="sk-order-button !w-full" onClick={() => setVisibleCount(n => Math.min(n + 8, feed.length))}>
                Show more designs
              </button>
            </div>
          )}
        </section>
        <section aria-label="SK Digital printing and invitation services" className="mx-auto my-10 max-w-2xl px-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Wedding cards, digital invitations &amp; corporate gifts</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Explore services from SK Digital – Mahi Creation in Gondia. Get custom wedding card printing,
              create a digital invitation or enquire about branded gifts and print packaging.
            </p>
            <nav aria-label="Explore SK Digital services" className="mt-4 flex flex-col gap-3 text-sm font-semibold text-gray-900">
              <a className="underline underline-offset-4" href="/wedding-card-printing-gondia/">Wedding card printing in Gondia</a>
              <a className="underline underline-offset-4" href="/digital-wedding-invitations/">Digital wedding invitations in India</a>
              <a className="underline underline-offset-4" href="/corporate-gifting-gondia/">Corporate gifts &amp; custom branding in Gondia</a>
            </nav>
          </div>
        </section>
      </main>

      {/* Keep SEO contact and FAQs after the original mobile storefront, never above products. */}
      <section className="mx-auto mb-6 max-w-2xl px-4" aria-label="How to order custom printing in Gondia">
        <div className="rounded-2xl border border-[#e8e6d7] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#294334]">Custom printing, made easy</h2>
          <p className="mt-2 text-sm leading-6 text-[#687b6a]">
            Browse real product photos, share your preferred design on WhatsApp and tell us your quantity,
            size and deadline. We prepare a quotation and confirm your artwork before production.
            Visit us in Krishnapura Ward, Gondia, or enquire from Nagpur and Balaghat.
          </p>
          <a href="https://www.sanjusk.in/contact" className="mt-3 inline-block text-sm font-bold text-[#2a634b] underline">Contact our Gondia studio</a>
        </div>
      </section>
      <FAQSection />
      <LocalContactFooter />
      <ScrollGatePopup
        visible={showPopup}
        waNumber={config.whatsappNumber || config.phone || '919372333633'}
        onUnlock={() => setShowPopup(false)}
      />

      <MobileBottomNav />
    </div>
  );
}
