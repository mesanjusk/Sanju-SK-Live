import React, { useState, useEffect } from "react";
import api from '../api';
import Carousel from "./Carousel";

export default function FilterCategory() {
  const [listings, setListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortOption, setSortOption] = useState("none");
 
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get(
          "/api/listings"
        );
        setListings(response.data);
      } catch (err) {
        console.error("Error fetching listings:", err);
      }
    };
    fetchListings();
  }, []);

  const filteredListings = selectedCategory
    ? listings.filter((l) => l.category === selectedCategory)
    : listings;

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortOption === "low") return a.price - b.price;
    if (sortOption === "high") return b.price - a.price;
    return 0;
  });

  const uniqueCategories = [...new Set(listings.map((item) => item.category))];

  return (
    <div className="font-sans bg-white text-gray-900">
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="none">Sort By</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide px-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1 whitespace-nowrap rounded-full border ${
                selectedCategory === null
                  ? "bg-pink-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              All
            </button>
            {uniqueCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1 whitespace-nowrap rounded-full border ${
                  selectedCategory === cat
                    ? "bg-pink-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {sortedListings.length === 0 ? (
            <div className="text-center text-gray-500">No products found.</div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide -mx-2">
              <div className="flex gap-4 px-2 min-w-max">
                {sortedListings.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedProduct(item)}
                    className="min-w-[160px] max-w-[200px] cursor-pointer bg-white border rounded-lg p-3 shadow-sm hover:shadow-md flex-shrink-0"
                  >
                    <div className="aspect-square bg-gray-200 rounded mb-2 overflow-hidden relative">
                      {item.images?.length ? (
                        <Carousel
                          images={item.images}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      ₹{item.price || "--"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

   
    </div>
  );
}
