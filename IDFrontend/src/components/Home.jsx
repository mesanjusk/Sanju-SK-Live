import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api';
import MobileHeader from './mobile/MobileHeader';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
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
  const [viewedIds, setViewedIds] = useState(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const hasShownPopup = useRef(false);

  useEffect(() => {
    // Product data is the primary content. One cold-start/API failure must
    // not hide the entire feed, nor should a failed secondary request do so.
    let active = true;
    let retryTimer;
    const load = async (attempt = 0) => {
      const [l, c, s, conf, v] = await Promise.allSettled([
        api.get('/api/listings', { timeout: 30000 }),
        api.get('/api/categories', { timeout: 30000 }),
        api.get('/api/subcategories', { timeout: 30000 }),
        api.get('/api/confi/GetConfiList', { timeout: 30000 }),
        api.get('/api/videos', { timeout: 30000 }),
      ]);
      if (!active) return;

      if (c.status === 'fulfilled') setCategories(Array.isArray(c.value.data) ? c.value.data : c.value.data?.result || []);
      if (s.status === 'fulfilled') setSubcategories(Array.isArray(s.value.data) ? s.value.data : s.value.data?.result || []);
      if (conf.status === 'fulfilled') setConfig(conf.value.data?.result?.[0] || {});
      if (v.status === 'fulfilled') setVideos(Array.isArray(v.value.data) ? v.value.data : []);

      if (l.status === 'fulfilled') {
        const rows = Array.isArray(l.value.data) ? l.value.data : (l.value.data?.result || []);
        if (rows.length || attempt >= 2) {
          setListings(rows);
          setLoadError(false);
          setLoading(false);
          return;
        }
      }
      // Render free-tier cold starts can briefly time out or return empty data.
      if (attempt < 6) {
        retryTimer = setTimeout(() => load(attempt + 1), Math.min(2000 + 2000 * attempt, 12000));
      } else {
        setLoadError(true);
        setLoading(false);
      }
    };
    load();
    return () => { active = false; clearTimeout(retryTimer); };
  }, [reloadKey]);

  const shuffled = useMemo(() => shuffle(listings), [listings]);

  const visibleSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategories.filter(
      (s) => s.categoryId?._id === selectedCategory._id || s.categoryId === selectedCategory._id
    );
  }, [subcategories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return shuffled.slice(0, 40);
    const byCat = listings.filter(
      (p) => p.category === selectedCategory.category_uuid || p.category === selectedCategory._id
    );
    if (!selectedSubcategory) return shuffle(byCat);
    return shuffle(
      byCat.filter(
        (p) => p.subcategory === selectedSubcategory._id || p.subcategory === selectedSubcategory.name
      )
    );
  }, [shuffled, listings, selectedCategory, selectedSubcategory]);

  // Mix videos into feed only on the unfiltered home view
  const feed = useMemo(() => {
    if (selectedCategory) return filteredProducts.map((p) => ({ ...p, _feedType: 'product' }));
    return interleaveFeed(filteredProducts, shuffle(videos));
  }, [filteredProducts, videos, selectedCategory]);

  const handleCategorySelect = (cat) => {
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
    <div className="sk-storefront min-h-screen pb-24">
      <MobileHeader />
      <div className="sk-shell">
        <section className="sk-welcome" aria-label="Your creative printing studio">
          {listings.find((item) => Array.isArray(item.images) ? item.images[0] : item.images) && (
            <img className="sk-welcome__preview"
              src={(() => { const item = listings.find((entry) => Array.isArray(entry.images) ? entry.images[0] : entry.images); return Array.isArray(item.images) ? item.images[0] : item.images; })()}
              alt="Featured printed product from our collection" loading="lazy" />
          )}
          <div className="sk-welcome__content">
            <span className="sk-welcome__eyebrow">Gondia's creative print studio</span>
            <h1>Make every detail <em style={{ color: '#efd4a2', fontStyle: 'normal' }}>extraordinary.</em></h1>
            <p>Luxury invitations · Immersive product previews · Printing &amp; 3D signage</p>
            <Link to="/products" className="sk-welcome__cta">Explore the collection <FaArrowRight /></Link>
          </div>
        </section>
      </div>
      <main className="mx-auto w-full max-w-2xl py-1">
        <div className="sk-section-label">
          <div><h2>Explore collections</h2><p>Choose what inspires you</p></div>
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

        <div className="sk-section-label" style={{ paddingTop: 17 }}>
          <div><h2>{selectedCategory ? selectedCategory.name : 'The latest creations'}</h2><p>Discover your next favourite design</p></div>
          <Link to="/products">All products →</Link>
        </div>
        <section className="mt-1">
          {loading ? (
            <div className="grid gap-4 p-4">
              {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} />)}
            </div>
          ) : feed.length > 0 ? (
            feed.map((item) =>
              item._feedType === 'video' ? (
                <VideoFeedCard key={`v-${item._id}`} video={item} />
              ) : (
                <ProductFeedCard
                  key={item._id}
                  product={item}
                  whatsappNumber={config.whatsappNumber || config.phone || '919372333633'}
                  onView={handleProductView}
                />
              )
            )
          ) : loadError ? (
              <div role="alert" className="mx-4 my-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-gray-700">
                Products are temporarily unavailable. Your collection has not been deleted.
                <button type="button" onClick={() => { setLoading(true); setLoadError(false); setReloadKey((v) => v + 1); }}
                  className="mt-3 block w-full rounded-lg bg-[#075E54] px-4 py-2 font-semibold text-white">Retry loading products</button>
              </div>
            ) : (
              <p className="mt-16 text-center text-sm text-gray-400">No products found in this category</p>
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
