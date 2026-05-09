import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Footer from './Footer';
import Navbar from './Navbar';
import SocialMedia from './SocialMedia';

export default function FilterSubcategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [originalListings, setOriginalListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListingsByCategoryId = async () => {
      try {
        const [listingsRes, categoriesRes] = await Promise.all([api.get('/api/listings'), api.get('/api/categories')]);
        const listings = Array.isArray(listingsRes.data) ? listingsRes.data : listingsRes.data?.result || [];
        const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data?.result || [];

        const matchedCategory = categories.find((cat) => cat.category_uuid === id || cat._id === id);
        if (!matchedCategory) {
          setOriginalListings([]);
          setAllListings([]);
          setSelectedCategoryName('');
          return;
        }

        setSelectedCategoryName(matchedCategory.name || 'Category');
        const filtered = listings.filter(
          (listing) => listing.category === matchedCategory.category_uuid || listing.category === matchedCategory._id,
        );
        setOriginalListings(filtered);
        setAllListings(filtered);
      } catch (err) {
        console.error('Error fetching listings or categories:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListingsByCategoryId();
    }
  }, [id]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const [subcategoryRes, categoriesRes] = await Promise.all([api.get('/api/subcategories'), api.get('/api/categories')]);
        const subcategoryPayload = Array.isArray(subcategoryRes.data) ? subcategoryRes.data : subcategoryRes.data?.result || [];
        const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data?.result || [];
        const matchedCategory = categories.find((cat) => cat.category_uuid === id || cat._id === id);

        const matched = subcategoryPayload.filter((sub) => {
          const catId = sub.categoryId?._id || sub.categoryId?.$oid || sub.categoryId;
          return catId?.toString() === matchedCategory?._id?.toString();
        });

        setSubcategories(matched);
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      }
    };

    fetchSubcategories();
  }, [id]);

  const heading = useMemo(() => {
    if (!selectedSubcategoryName) return selectedCategoryName || 'Category';
    return `${selectedCategoryName} / ${selectedSubcategoryName}`;
  }, [selectedCategoryName, selectedSubcategoryName]);

  return (
    <>
      <Navbar />
      <div className="bg-white font-sans text-gray-900">
        <section className="bg-gray-50 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">{heading}</h1>
            <p className="mt-2 text-gray-600">Browse subcategories and discover matching designs.</p>
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4 overflow-x-auto pb-2">
              <button
                onClick={() => {
                  setSelectedSubcategoryName('');
                  setAllListings(originalListings);
                }}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  selectedSubcategoryName ? 'border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600' : 'border-red-600 bg-red-600 text-white'
                }`}
              >
                All
              </button>

              {subcategories.map((item) => (
                <button
                  key={item._id}
                  onClick={() => {
                    setSelectedSubcategoryName(item.name?.trim() || '');
                    const filteredBySub = originalListings.filter(
                      (listing) =>
                        listing.subcategory?.trim().toLowerCase() === item.name?.trim().toLowerCase() ||
                        listing.subcategory === item.subCategory_uuid ||
                        listing.subcategory === item._id,
                    );
                    setAllListings(filteredBySub);
                  }}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    selectedSubcategoryName === item.name?.trim()
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600'
                  }`}
                  aria-label={`Filter by ${item.name}`}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name || 'Subcategory'} className="h-6 w-6 rounded-full object-cover" />
                  ) : null}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {loading ? (
              <p className="text-center text-gray-500">Loading listings...</p>
            ) : allListings.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {allListings.map((listing) => (
                  <article
                    key={listing._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/list/${listing._id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate(`/list/${listing._id}`);
                      }
                    }}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-gray-100">
                      <img
                        src={Array.isArray(listing.images) ? listing.images[0] : listing.images}
                        alt={listing.title || 'Listing'}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-1 text-base font-bold text-gray-800">{listing.title}</h3>
                      <p className="mt-2 text-sm font-semibold text-red-600">₹{listing.price ?? 0}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No listings found in “{selectedCategoryName || 'Selected Category'}”.</p>
            )}
          </div>
        </section>
      </div>
      <Footer />
      
    </>
  );
}
