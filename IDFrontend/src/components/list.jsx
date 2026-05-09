import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Footer from './Footer';
import Navbar from './Navbar';
import SocialMedia from './SocialMedia';

export default function ListingPage() {
  const { itemId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchItems = async () => {
      if (!itemId) {
        setLoading(false);
        setItems([]);
        return;
      }

      try {
        const response = await api.get(`/api/listings/${itemId}`);
        setItems([response.data]);

        if (response.data.images && response.data.images.length > 0) {
          setSelectedImage(response.data.images[0]);
        } else {
          setSelectedImage('');
        }

        setQuantity(response.data.moq ?? 1);
      } catch (err) {
        console.error('Error fetching items:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [itemId]);

  const item = items[0];
  const moq = item?.moq !== undefined ? item.moq : 1;
  const discountPrice = useMemo(() => {
    if (!item) return null;
    return item.discountPrice !== undefined && item.discountPrice < item.price ? item.discountPrice : null;
  }, [item]);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > moq ? prev - 1 : prev));

  return (
    <>
      <Navbar />

      <main className="bg-gray-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : !item ? (
            <p className="text-center text-gray-500">No listing found.</p>
          ) : (
            <article className="overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:p-8">
                <div>
                  <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-xl border bg-gray-100">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    ) : (
                      <p className="text-gray-400">No image available</p>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-5 gap-3">
                    {item.images?.map((imgUrl, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImage(imgUrl)}
                        className={`overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                          selectedImage === imgUrl ? 'border-red-600' : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img src={imgUrl} alt={`Thumbnail-${index}`} className="h-20 w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-red-600">Printing & Advertising</p>
                  <h1 className="mt-2 text-3xl font-bold text-gray-900">{item.title}</h1>

                  <p className="mt-4 text-gray-600">
                    {item.Description || item.description || 'No description available. Please update this text.'}
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <span className="text-3xl font-bold text-red-600">₹{discountPrice ?? item.price ?? 0}</span>
                    {discountPrice && <span className="text-lg text-gray-500 line-through">₹{item.price}</span>}
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <span className="text-sm text-gray-600">MOQ: {moq}</span>
                    <span className="text-sm text-gray-600">|</span>
                    <span className="text-sm text-gray-600">Selected Qty: {quantity}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-all duration-300 hover:border-red-600 hover:text-red-600"
                    >
                      -
                    </button>
                    <span className="min-w-12 text-center text-lg font-semibold text-gray-800">{quantity}</span>
                    <button
                      type="button"
                      onClick={increaseQuantity}
                      className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-all duration-300 hover:border-red-600 hover:text-red-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>
      </main>

      <Footer />
      
    </>
  );
}
