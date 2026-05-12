import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api';
import MobileHeader from './mobile/MobileHeader';
import StoryCategories from './mobile/StoryCategories';
import ProductFeedCard from './mobile/ProductFeedCard';
import MobileBottomNav from './mobile/MobileBottomNav';
import LoadingSkeleton from './common/LoadingSkeleton';
import ScrollGatePopup from './ScrollGatePopup';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AllCategory() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const hasShownPopup = useRef(false);

  useEffect(() => {
    Promise.all([
      api.get('/api/categories'),
      api.get('/api/listings'),
      api.get('/api/confi/GetConfiList'),
    ]).then(([c, l, conf]) => {
      setCategories(Array.isArray(c.data) ? c.data : c.data?.result || []);
      setListings(Array.isArray(l.data) ? l.data : l.data?.result || []);
      setConfig(conf.data?.result?.[0] || {});
    }).finally(() => setLoading(false));
  }, []);

  const shuffled = useMemo(() => shuffle(listings), [listings]);

  const filtered = useMemo(() => {
    if (!selectedCategory) return shuffled;
    return shuffle(
      listings.filter(
        (p) => p.category === selectedCategory.category_uuid || p.category === selectedCategory._id
      )
    );
  }, [shuffled, listings, selectedCategory]);

  const handleCategorySelect = (cat) => {
    if (!cat) { setSelectedCategory(null); return; }
    setSelectedCategory((prev) => (prev?._id === cat._id ? null : cat));
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
          categories={categories}
          onSelect={handleCategorySelect}
          selectedId={selectedCategory?._id}
        />
        <section className="mt-1">
          {loading ? (
            <div className="grid gap-4 p-4">
              {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((p) => (
              <ProductFeedCard
                key={p._id}
                product={p}
                whatsappNumber={config.whatsappNumber || config.phone}
                onView={handleProductView}
              />
            ))
          ) : (
            <p className="mt-16 text-center text-sm text-gray-400">
              No products in this category
            </p>
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
