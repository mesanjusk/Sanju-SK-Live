import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api';
import MobileHeader from './mobile/MobileHeader';
import StoryCategories from './mobile/StoryCategories';
import ProductFeedCard from './mobile/ProductFeedCard';
import VideoFeedCard from './mobile/VideoFeedCard';
import MobileBottomNav from './mobile/MobileBottomNav';
import LoadingSkeleton from './common/LoadingSkeleton';
import ScrollGatePopup from './ScrollGatePopup';

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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const hasShownPopup = useRef(false);

  useEffect(() => {
    Promise.all([
      api.get('/api/listings'),
      api.get('/api/categories'),
      api.get('/api/subcategories'),
      api.get('/api/confi/GetConfiList'),
      api.get('/api/videos'),
    ]).then(([l, c, s, conf, v]) => {
      setListings(Array.isArray(l.data) ? l.data : []);
      setCategories(Array.isArray(c.data) ? c.data : c.data?.result || []);
      setSubcategories(Array.isArray(s.data) ? s.data : []);
      setConfig(conf.data?.result?.[0] || {});
      setVideos(Array.isArray(v.data) ? v.data : []);
    }).finally(() => setLoading(false));
  }, []);

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
    <div className="min-h-screen bg-[#fafafa] pb-24">
      <MobileHeader />
      <main className="mx-auto w-full max-w-2xl py-1">
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
                  whatsappNumber={config.whatsappNumber || config.phone}
                  onView={handleProductView}
                />
              )
            )
          ) : (
            <p className="mt-16 text-center text-sm text-gray-400">No products found in this category</p>
          )}
        </section>
      </main>

      <ScrollGatePopup
        visible={showPopup}
        waNumber={config.whatsappNumber || config.phone}
        onUnlock={() => setShowPopup(false)}
      />

      <MobileBottomNav />
    </div>
  );
}
