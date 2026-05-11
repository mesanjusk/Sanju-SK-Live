import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import MobileHeader from './mobile/MobileHeader';
import StoryCategories from './mobile/StoryCategories';
import ProductFeedCard from './mobile/ProductFeedCard';
import MobileBottomNav from './mobile/MobileBottomNav';
import LoadingSkeleton from './common/LoadingSkeleton';

export default function AllCategory() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  const filtered = useMemo(() => {
    if (!selectedCategory) return listings.slice(0, 20);
    return listings.filter(
      (p) => p.category === selectedCategory.category_uuid || p.category === selectedCategory._id
    );
  }, [listings, selectedCategory]);

  const handleCategorySelect = (cat) => {
    if (!cat) { setSelectedCategory(null); return; }
    setSelectedCategory((prev) => (prev?._id === cat._id ? null : cat));
  };

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
              />
            ))
          ) : (
            <p className="mt-16 text-center text-sm text-gray-400">
              No products in this category
            </p>
          )}
        </section>
      </main>
      <MobileBottomNav />
    </div>
  );
}
