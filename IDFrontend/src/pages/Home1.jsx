// Home.jsx – Revamped to match premium eCommerce (like CaratLane), fully styled with Tailwind CSS

import { useState, useEffect, useMemo, Suspense, lazy, useDeferredValue } from 'react';
import api from '../api'

const Category = lazy(() => import("../components/Category"));
const Content = lazy(() => import("../components/Content"));
const GalleryModal = lazy(() => import("../components/GalleryModal"));

const Home = () => {
  const [listings, setListings] = useState([]);
  const [savedPosts, setSavedPosts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('sortBy') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openImageModal, setOpenImageModal] = useState(null);

  const deferredSearch = useDeferredValue(searchTerm);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get('/api/listings');
        setListings(response.data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedPosts');
      if (saved) setSavedPosts(JSON.parse(saved));
    } catch {
      console.warn("Malformed savedPosts in localStorage.");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
  }, [savedPosts]);

  useEffect(() => {
    localStorage.setItem('sortBy', sortBy);
  }, [sortBy]);

  const filteredListings = useMemo(() => {
    let filtered = listings.filter((item) =>
      item.title?.toLowerCase().includes(deferredSearch.toLowerCase())
    );
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }
    switch (sortBy) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price);
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return filtered;
    }
  }, [listings, deferredSearch, sortBy, selectedCategory]);

  useEffect(() => {
    const preventContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 pt-4 pb-20">
      

      {/* Hero Section */}
      <section className="relative rounded-xl overflow-hidden bg-[url('/hero-bg.webp')] bg-cover bg-center h-[350px] flex items-center justify-center mb-10">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-md text-center max-w-lg">
          <h1 className="text-4xl font-semibold text-gray-800">Elegant Wedding Cards</h1>
          <p className="mt-2 text-sm text-gray-600">Discover & customize premium designs for your big day</p>
        </div>
      </section>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search wedding cards..."
          className="border border-gray-300 rounded px-4 py-2 w-full sm:w-2/5 text-sm focus:ring-pink-500 focus:border-pink-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded px-4 py-2 text-sm focus:ring-pink-500 focus:border-pink-500"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="price-asc">Price (Low → High)</option>
          <option value="price-desc">Price (High → Low)</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Category Tabs */}
      <Suspense fallback={<div className="h-10 bg-gray-100 animate-pulse" />}>
        <Category
          uniqueCategories={[...new Set(listings.map((item) => item.category))]}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </Suspense>

      {/* Content Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600 mt-10">{error}</div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No cards found.</div>
        ) : (
          <Suspense fallback={<div className="text-center">Loading cards…</div>}>
            <Content
              listings={filteredListings}
              savedPosts={savedPosts}
              setSavedPosts={setSavedPosts}
              onPreview={setOpenImageModal}
            />
          </Suspense>
        )}
      </div>

      {/* Gallery Modal */}
      {openImageModal && (
        <Suspense fallback={<div className="text-center mt-6">Loading Preview…</div>}>
          <GalleryModal images={openImageModal} onClose={() => setOpenImageModal(null)} />
        </Suspense>
      )}

      {/* Newsletter Placeholder */}
      <section className="mt-20 bg-pink-50 py-12 rounded-xl text-center shadow-inner">
        <h2 className="text-xl font-semibold text-gray-800">Stay Inspired</h2>
        <p className="text-sm text-gray-600 mt-1 mb-4">Subscribe for latest designs & offers</p>
        <div className="flex justify-center">
          <input className="rounded-l px-4 py-2 border border-gray-300 text-sm w-64" placeholder="Your email" />
          <button className="bg-pink-600 text-white text-sm px-4 py-2 rounded-r hover:bg-pink-700">Subscribe</button>
        </div>
      </section>
    </div>
  );
};

export default Home;
