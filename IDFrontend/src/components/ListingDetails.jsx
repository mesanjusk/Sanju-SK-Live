import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useFavorites } from '../context/FavoritesContext';

const ListingDetails = () => {
  const [listing, setListing] = useState(null);
  const { id } = useParams();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await api.get(`/api/listings/${id}`);
        setListing(response.data);
      } catch (err) {
        console.error('Error fetching listing:', err);
      }
    };

    fetchListing();
  }, [id]);

  if (!listing) {
    return <div>Loading...</div>;
  }

  const isFavorite = favorites.some((item) => item.id === listing.id);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">{listing.title}</h2>
      <p className="mb-2 text-gray-700">{listing.description}</p>
      <p className="mb-1 font-semibold">{listing.price} USD / night</p>
      <p className="mb-4 text-sm text-gray-500">{listing.location}</p>

      <button
        onClick={() =>
          isFavorite ? removeFavorite(listing.id) : addFavorite(listing)
        }
        className="mb-4 px-4 py-2 rounded bg-pink-500 text-white hover:bg-pink-600"
      >
        {isFavorite ? 'Remove from Favourites' : 'Add to Favourites'}
      </button>

        {/* Render Images */}
        {listing.images?.length ? (
          <div className="grid grid-cols-1 gap-4">
            {listing.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Listing image ${index + 1}`}
                className="w-full h-96 object-cover rounded"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No images available.</p>
        )}
      </div>
    );
  };

export default ListingDetails;
