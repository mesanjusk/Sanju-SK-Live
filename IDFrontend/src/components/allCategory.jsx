import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import MobileHeader from './mobile/MobileHeader';
import MobileBottomNav from './mobile/MobileBottomNav';
import LoadingSkeleton from './common/LoadingSkeleton';

export default function AllCategory() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/api/categories'),
      api.get('/api/subcategories'),
    ]).then(([c, s]) => {
      setCategories(Array.isArray(c.data) ? c.data : c.data?.result || []);
      setSubcategories(Array.isArray(s.data) ? s.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const subcatsForSelected = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategories.filter(
      (s) => s.categoryId?._id === selectedCategory._id || s.categoryId === selectedCategory._id
    );
  }, [subcategories, selectedCategory]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory((prev) => (prev?._id === cat._id ? null : cat));
  };

  const goToProducts = (catId, subId) => {
    const params = new URLSearchParams();
    if (catId) params.set('category', catId);
    if (subId) params.set('subcategory', subId);
    navigate(`/products?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24">
      <MobileHeader />

      <main className="mx-auto w-full max-w-2xl px-4 py-4">
        <h1 className="mb-4 text-lg font-bold text-gray-900">All Categories</h1>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => {
              const isOpen = selectedCategory?._id === cat._id;
              const catSubs = subcategories.filter(
                (s) => s.categoryId?._id === cat._id || s.categoryId === cat._id
              );

              return (
                <div key={cat._id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  {/* Category row */}
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                  >
                    {cat.imageUrl && (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="h-11 w-11 flex-shrink-0 rounded-xl object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{cat.name}</p>
                      {catSubs.length > 0 && (
                        <p className="text-xs text-gray-400">{catSubs.length} subcategories</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); goToProducts(cat._id); }}
                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        View All
                      </button>
                      {catSubs.length > 0 && (
                        <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>›</span>
                      )}
                    </div>
                  </button>

                  {/* Subcategory chips */}
                  {isOpen && catSubs.length > 0 && (
                    <div className="border-t border-gray-50 bg-gray-50 px-4 py-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Subcategories</p>
                      <div className="flex flex-wrap gap-2">
                        {catSubs.map((sub) => (
                          <button
                            key={sub._id}
                            onClick={() => goToProducts(cat._id, sub._id)}
                            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-900 hover:bg-gray-900 hover:text-white active:scale-95"
                          >
                            {sub.imageUrl && (
                              <img src={sub.imageUrl} alt={sub.name} className="h-4 w-4 rounded-full object-cover" />
                            )}
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {categories.length === 0 && (
              <p className="mt-16 text-center text-sm text-gray-400">No categories found</p>
            )}
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
