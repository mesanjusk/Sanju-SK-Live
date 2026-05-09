import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturedProducts from './FeaturedProducts';
import WhyChooseUs from './WhyChooseUs';
import Testimonials from './Testimonials';
import ContactPreview from './ContactPreview';
import Footer from './Footer';

const categoryIcons = ['📇', '📘', '🪧', '📦', '📣', '🎁'];

export default function Home() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get('/api/listings');
        const payload = Array.isArray(response.data)
          ? response.data
          : response.data?.result || [];
        setListings(payload);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        const payload = Array.isArray(response.data)
          ? response.data
          : response.data?.result || [];
        setCategories(payload);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchListings();
    fetchCategories();
  }, []);

  // Create category map for quick lookup
  const categoriesByUuid = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      if (category?.category_uuid) {
        map.set(category.category_uuid, category);
      }
    });
    return map;
  }, [categories]);

  // Build unique category cards
  const categoryCards = useMemo(() => {
    const uniqueCategoryUuids = [
      ...new Set(
        listings.map((listing) => listing?.category).filter(Boolean)
      ),
    ];

    return uniqueCategoryUuids.map((categoryUuid, index) => {
      const categoryDetails = categoriesByUuid.get(categoryUuid);

      return {
        id: categoryDetails?._id || `${categoryUuid}-${index}`,
        title: categoryDetails?.name || categoryUuid,
        icon: categoryIcons[index % categoryIcons.length],
        imageUrl: categoryDetails?.imageUrl || '',
        categoryUuid,
      };
    });
  }, [listings, categoriesByUuid]);

  // Normalize listings for ProductCard
  const featuredProducts = useMemo(() => {
    return listings.map((listing) => ({
      ...listing,
      description: listing?.description || listing?.Description || '',
      images: Array.isArray(listing?.images) ? listing.images : [],
      price: listing?.price ?? 0,
    }));
  }, [listings]);

  return (
    <div className="bg-white font-sans text-gray-900">
      <Navbar />
      <HeroSection />

      {/* Categories Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Explore Categories
            </h2>
            <p className="mt-3 text-gray-600">
              Find the right print product for every business need.
            </p>
          </div>

          {categoryCards.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoryCards.map((category) => (
                <article
                  key={category.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/subcategory/${category.categoryUuid}`)
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(`/subcategory/${category.categoryUuid}`);
                    }
                  }}
                  className="cursor-pointer rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-red-50 text-3xl">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      category.icon
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-800">
                    {category.title}
                  </h3>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-center text-gray-500">
              Categories will appear here soon.
            </p>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts
        products={featuredProducts}
        visibleCount={visibleCount}
        onLoadMore={() => setVisibleCount((prev) => prev + 4)}
      />

      <WhyChooseUs />
      <Testimonials />
      <ContactPreview />
      <Footer />
    </div>
  );
}